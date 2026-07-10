#Requires -Version 5.1
<#
.SYNOPSIS
    Scheduled local dev loop for AutoBlogr (Linear team Dark7eaper, project AutoBlogr).

.DESCRIPTION
    Runs the dev loop headless via Claude Code, bounded to exactly ONE highest-priority
    Todo ticket per run, then opens a Pull Request to `dev` on a green quality gate.

    Mode 3 (CI-gated auto-merge to `dev`): this script NEVER pushes to `main` and NEVER
    promotes `dev` -> `main`. At the start of each run it auto-merges any open dev-loop PR
    whose CI "Lint and build" check is green (a PR with red or missing checks is left open
    for a human). Production promotion (`dev` -> `main`, Vercel) stays a human step. See
    CLAUDE.md and .claude/steering/ for the full policy.

    What it does, in order:
      1. Acquire a single-instance lock (an overlapping scheduled fire exits cleanly).
      2. Merge sweep: auto-merge open dev-loop PRs whose "Lint and build" check is green.
      3. Read-only SELECT: pick the eligible Todo tickets. Empty -> exit (no worktree).
      4. Refresh a dedicated git worktree (outside Dropbox, under %LOCALAPPDATA%) to a fresh
         branch based on origin/dev. The primary Dropbox working copy is never touched.
      5. Headless IMPLEMENT call: implement the ONE pre-approved ticket in the worktree.
      6. Commit, then run the quality gate: npm ci -> npm run lint -> npm run test -> npm run build.
      7. GREEN -> push the feature branch, open a PR via `gh`, then a headless FINALIZE call
         moves the ticket to In Review and comments the PR link.
         RED -> FINALIZE comments the failure and leaves the ticket In Progress; nothing is pushed.
      8. Write a per-run log to .claude\loop-runs\ and release the lock.

    No secrets are introduced. The run reuses the existing local Claude session + Linear MCP
    and the already-authenticated `gh` CLI. There is no ANTHROPIC_API_KEY / LINEAR_API_KEY.
    Linear is reachable only through the MCP inside a Claude session, so ALL Linear ticket
    transitions/comments are performed by the `claude -p` calls, not by this script.

.NOTES
    Registered as a Windows Task Scheduler job "AutoBlogr Dev Loop" (weekdays 09:30, run only
    when the user is logged on). Commit messages carry NO AI attribution (Ryan is sole author).

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\dev-loop-runner.ps1

.EXAMPLE
    # Dry test: implement + quality gate, but do not push, open a PR, merge, or finalize Linear.
    powershell -NoProfile -File scripts\dev-loop-runner.ps1 -NoPr
#>
[CmdletBinding()]
param(
    [string]$RepoRoot = '',
    # Dedicated worktree path. Defaults OUTSIDE the Dropbox-synced repo (under %LOCALAPPDATA%)
    # because Dropbox locks files mid-sync, which can make builds fail with EBUSY.
    [string]$WorktreePath = '',
    [string]$LogDir = '',
    [string]$Remote = 'origin',
    # Base branch the loop targets for its worktree + PRs. 'dev' so the automation never
    # promotes straight to main: everything flows feature -> dev -> main (main is protected).
    [string]$BaseBranch = 'dev',
    [string]$Model = '',
    [ValidateSet('bypassPermissions', 'acceptEdits', 'default', 'dontAsk', 'plan', 'auto')]
    [string]$PermissionMode = 'bypassPermissions',
    [double]$MaxBudgetUsd = 0,
    [int]$StaleLockMinutes = 2,
    # Implement + quality gate only. Skip push, PR creation, finalize, AND the merge sweep.
    [switch]$NoPr,
    # Open PRs but never auto-merge (temporary kill switch for the sweep).
    [switch]$NoMerge,
    # Run ONLY the merge sweep and exit (for a separate, faster merge cadence).
    [switch]$MergeSweepOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 1.0

# Decode native-command stdout (Claude JSON, git, gh) as UTF-8.
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
$OutputEncoding = [System.Text.Encoding]::UTF8

# ----- Project coordinates ----------------------------------------------------
$LinearProject = 'AutoBlogr'
$LinearTeam    = 'Dark7eaper'
# The CI check that gates auto-merge (the Web CI job name in .github/workflows/web.yml).
$script:RequiredCheck = 'Lint and build'
# Branch pattern the loop owns (ticket key is DAR).
$script:BranchRegex = '^dev-loop/(dar-\d+)-\d'

# ----- Resolve script dir + repo root -----------------------------------------
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir -and $PSCommandPath) { $ScriptDir = Split-Path -Parent $PSCommandPath }
if (-not $ScriptDir) { try { if ($MyInvocation.MyCommand.Path) { $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path } } catch { } }
if (-not $ScriptDir -and $RepoRoot) { $ScriptDir = Join-Path $RepoRoot 'scripts' }
if (-not $RepoRoot -and $ScriptDir) { $RepoRoot = Split-Path -Parent $ScriptDir }
if (-not $RepoRoot) { throw "Cannot determine RepoRoot; pass -RepoRoot explicitly." }
if (-not $ScriptDir) { $ScriptDir = Join-Path $RepoRoot 'scripts' }
$script:ScriptDir = $ScriptDir

# ----- Resolve paths ----------------------------------------------------------
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if (-not $WorktreePath) {
    $wtBase = if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { $env:TEMP }
    $WorktreePath = Join-Path $wtBase 'autoblogr-dev-loop\worktree'
}
if (-not $LogDir) { $LogDir = Join-Path $RepoRoot '.claude\loop-runs' }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$script:LogFile = Join-Path $LogDir ("run-{0}.log" -f $stamp)
$LockFile = Join-Path $LogDir 'dev-loop.lock'

# ----- Logging ----------------------------------------------------------------
function Add-LogText {
    param([string]$Value)
    for ($i = 0; $i -lt 6; $i++) {
        try { Add-Content -LiteralPath $script:LogFile -Value $Value -ErrorAction Stop; return }
        catch { Start-Sleep -Milliseconds 50 }
    }
}
function Set-FileText {
    param([string]$Path, [string]$Text)
    for ($i = 0; $i -lt 6; $i++) {
        try { [System.IO.File]::WriteAllText($Path, [string]$Text); return $true }
        catch { Start-Sleep -Milliseconds 50 }
    }
    return $false
}
function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $line = "{0} [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Add-LogText -Value $line
    Write-Host $line
}
function Append-Raw {
    param([string]$Prefix, [string]$Text)
    if ($null -eq $Text) { return }
    foreach ($l in ($Text -split "`r?`n")) { Add-LogText -Value ("  {0}{1}" -f $Prefix, $l) }
}

# ----- Native command helpers -------------------------------------------------
function Get-NpmCmd {
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm) {
        $cmd = Join-Path (Split-Path $npm.Source) 'npm.cmd'
        if (Test-Path $cmd) { return $cmd }
    }
    return 'npm.cmd'
}
function Resolve-Exe {
    param([Parameter(Mandatory)][string]$Name)
    $c = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $c) { throw "Required tool '$Name' not found on PATH (as an executable)." }
    return $c.Source
}
function Invoke-Logged {
    param(
        [Parameter(Mandatory)][string]$Exe,
        [string[]]$Arguments = @(),
        [string]$WorkDir,
        [switch]$AllowFail
    )
    Write-Log ("RUN: {0} {1}" -f $Exe, ($Arguments -join ' '))
    $prev = $null
    if ($WorkDir) { $prev = (Get-Location).Path; Set-Location -LiteralPath $WorkDir }
    $errFile = Join-Path $LogDir ("stderr-{0}.tmp" -f (Get-Random))
    $eapPrev = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        & $Exe @Arguments 2> $errFile | ForEach-Object {
            $s = $_.ToString()
            Add-LogText -Value ("  | " + $s)
            Write-Host $s
        }
        $code = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $eapPrev
        if ($prev) { Set-Location -LiteralPath $prev }
    }
    if (Test-Path $errFile) {
        $errText = Get-Content -LiteralPath $errFile -Raw -ErrorAction SilentlyContinue
        if ($errText) { Append-Raw -Prefix '|2 ' -Text $errText }
        Remove-Item -LiteralPath $errFile -Force -ErrorAction SilentlyContinue
    }
    if ($null -eq $code) { $code = 0 }
    Write-Log ("EXIT {0}: {1}" -f $code, $Exe)
    if ($code -ne 0 -and -not $AllowFail) {
        throw ("Command failed (exit {0}): {1} {2}" -f $code, $Exe, ($Arguments -join ' '))
    }
    return $code
}
function Invoke-Capture {
    param(
        [Parameter(Mandatory)][string]$Exe,
        [string[]]$Arguments = @(),
        [string]$WorkDir
    )
    $prev = $null
    if ($WorkDir) { $prev = (Get-Location).Path; Set-Location -LiteralPath $WorkDir }
    $errFile = Join-Path $LogDir ("stderr-{0}.tmp" -f (Get-Random))
    $eapPrev = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $out = & $Exe @Arguments 2> $errFile
        $code = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $eapPrev
        if ($prev) { Set-Location -LiteralPath $prev }
    }
    if (Test-Path $errFile) {
        Append-Raw -Prefix '[stderr] ' -Text (Get-Content -LiteralPath $errFile -Raw -ErrorAction SilentlyContinue)
        Remove-Item -LiteralPath $errFile -Force -ErrorAction SilentlyContinue
    }
    if ($null -eq $code) { $code = 0 }
    return [pscustomobject]@{ ExitCode = $code; Stdout = ($out -join "`n") }
}
function Git {
    return Invoke-Logged -Exe $script:GitExe -Arguments $args
}

# ----- Stale git lock cleanup -------------------------------------------------
function Clear-StaleGitLocks {
    param([string]$GitCommonDir)
    if ($StaleLockMinutes -le 0) { return }
    if (Get-Process -Name git -ErrorAction SilentlyContinue) {
        Write-Log "git process active; skipping stale-lock cleanup." 'WARN'
        return
    }
    $cutoff = (Get-Date).AddMinutes(-$StaleLockMinutes)
    $locks = Get-ChildItem -LiteralPath $GitCommonDir -Recurse -Filter '*.lock' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff }
    foreach ($l in $locks) {
        Write-Log ("Removing stale git lock: {0}" -f $l.FullName) 'WARN'
        Remove-Item -LiteralPath $l.FullName -Force -ErrorAction SilentlyContinue
    }
}

# ----- Claude headless --------------------------------------------------------
function Invoke-ClaudeHeadless {
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [Parameter(Mandatory)][string]$WorkDir,
        [string]$Label = 'claude',
        [string[]]$DisallowedTools = @()
    )
    $cargs = @('-p', $Prompt, '--output-format', 'json', '--permission-mode', $PermissionMode, '--add-dir', $WorkDir)
    if ($Model)              { $cargs += @('--model', $Model) }
    if ($MaxBudgetUsd -gt 0) { $cargs += @('--max-budget-usd', "$MaxBudgetUsd") }
    if ($DisallowedTools.Count -gt 0) { $cargs += @('--disallowedTools', ($DisallowedTools -join ',')) }
    Write-Log ("CLAUDE [{0}]: prompt {1} chars, model='{2}', perm='{3}'" -f $Label, $Prompt.Length, $Model, $PermissionMode)
    $res = Invoke-Capture -Exe $script:ClaudeExe -Arguments $cargs -WorkDir $WorkDir
    $rawPath = Join-Path $LogDir ("claude-{0}-{1}.out.json" -f $Label, $stamp)
    if (Set-FileText -Path $rawPath -Text $res.Stdout) { Write-Log ("CLAUDE [{0}] raw output -> {1}" -f $Label, $rawPath) }
    else { Append-Raw -Prefix ("[{0} stdout] " -f $Label) -Text $res.Stdout }
    Write-Log ("CLAUDE [{0}] EXIT {1}" -f $Label, $res.ExitCode)

    $envelope = $null
    try { $envelope = $res.Stdout | ConvertFrom-Json } catch { }
    $resultText = if ($envelope -and ($envelope.PSObject.Properties.Name -contains 'result')) { [string]$envelope.result } else { $res.Stdout }
    $isError = $res.ExitCode -ne 0
    if ($envelope) {
        if (($envelope.PSObject.Properties.Name -contains 'is_error') -and $envelope.is_error) { $isError = $true }
        if (($envelope.PSObject.Properties.Name -contains 'subtype') -and $envelope.subtype -and $envelope.subtype -ne 'success') { $isError = $true }
    }
    return [pscustomobject]@{ ExitCode = $res.ExitCode; ResultText = $resultText; IsError = $isError }
}

function Get-LoopResult {
    param([string]$Text)
    if (-not $Text) { return $null }
    $rx = [regex]::new('<<<LOOP_RESULT>>>\s*(?<json>\{[\s\S]*\})\s*<<<END_LOOP_RESULT>>>',
        [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $m = $rx.Match($Text)
    if ($m.Success) { try { return $m.Groups['json'].Value | ConvertFrom-Json } catch { } }
    $rx2 = [regex]::new('\{[^{}]*"status"[^{}]*\}', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $ms = $rx2.Matches($Text)
    if ($ms.Count -gt 0) { try { return $ms[$ms.Count - 1].Value | ConvertFrom-Json } catch { } }
    foreach ($pat in @('(?:Selected|Picked|Chose|Moved|Implemented)\b[^\r\n]*?\b([A-Z]{2,}-\d+)\b', '\b([A-Z]{2,}-\d+)\b')) {
        $tm = [regex]::Match($Text, $pat)
        if ($tm.Success) { return [pscustomobject]@{ ticket = $tm.Groups[1].Value; title = ''; status = 'implemented'; summary = '' } }
    }
    return $null
}

# Parse the read-only SELECT output into an ordered list of eligible "Todo" ticket ids.
function Get-EligibleList {
    param([string]$Text)
    if (-not $Text) { return @() }
    $json = $null
    $rx = [regex]::new('<<<ELIGIBLE>>>\s*(?<json>\{[\s\S]*?\})\s*<<<END_ELIGIBLE>>>',
        [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $m = $rx.Match($Text)
    if ($m.Success) { $json = $m.Groups['json'].Value }
    if (-not $json) {
        $rx2 = [regex]::new('\{\s*"eligible"\s*:\s*\[[\s\S]*?\]\s*\}', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $ms = $rx2.Matches($Text)
        if ($ms.Count -gt 0) { $json = $ms[$ms.Count - 1].Value }
    }
    if (-not $json) { return @() }
    $obj = $null
    try { $obj = $json | ConvertFrom-Json } catch { return @() }
    if (-not $obj -or -not ($obj.PSObject.Properties.Name -contains 'eligible')) { return @() }
    $ids = @()
    foreach ($e in @($obj.eligible)) {
        if ($null -eq $e) { continue }
        $id = $null; $st = $null
        if ($e -is [string]) { $id = $e; $st = 'Todo' }
        else {
            if ($e.PSObject.Properties.Name -contains 'id')     { $id = [string]$e.id }
            if ($e.PSObject.Properties.Name -contains 'status') { $st = [string]$e.status }
        }
        if (-not $id) { continue }
        $id = $id.Trim().ToUpper()
        if ($id -notmatch '^[A-Z]+-\d+$') { continue }
        if ($st -and ($st.Trim() -ne 'Todo')) { Write-Log ("Select listed {0} with status '{1}' (not Todo); dropping it." -f $id, $st) 'WARN'; continue }
        if ($ids -notcontains $id) { $ids += $id }
    }
    return , $ids
}

# Headless Linear-only finalize: move state (optional) + post one comment.
function Invoke-Finalize {
    param(
        [Parameter(Mandatory)][string]$Ticket,
        [ValidateSet('Review', 'Done', 'None')][string]$ToState = 'None',
        [Parameter(Mandatory)][string]$Body
    )
    $tmpl = Get-Content -LiteralPath (Join-Path $script:ScriptDir 'prompts\finalize.txt') -Raw
    $stateInstr = switch ($ToState) {
        'Review' { "1. Move $Ticket to the `"In Review`" state." }
        'Done'   { "1. Move $Ticket to the `"Done`" state." }
        default  { "1. Do NOT change the state of $Ticket (leave it exactly as-is)." }
    }
    $prompt = $tmpl.
        Replace('{PROJECT}', $LinearProject).
        Replace('{TEAM}', $LinearTeam).
        Replace('{TICKET}', $Ticket).
        Replace('{STATE_INSTRUCTION}', $stateInstr).
        Replace('{BODY}', $Body)
    $fin = Invoke-ClaudeHeadless -Prompt $prompt -WorkDir $RepoRoot -Label 'finalize' -DisallowedTools @('Edit', 'Write', 'NotebookEdit', 'Bash')
    if ($fin.IsError -or ($fin.ResultText -notmatch 'DONE')) {
        Write-Log ("Finalize step may not have completed cleanly for {0}. Verify Linear state/comment and the log." -f $Ticket) 'WARN'
    } else {
        Write-Log ("Finalize complete for {0} (state -> {1})." -f $Ticket, $ToState)
    }
}

# Mode 3 auto-merge gate. Returns $true only when the required CI check ("Lint and build")
# is PRESENT and COMPLETED SUCCESSfully. Missing/pending/red required check -> $false. All
# OTHER checks (e.g. Copilot review, a preview deploy) are ignored so the auto-merge is not
# blocked by advisory bots. No green required check => no auto-merge, whatever branch
# protection is set to.
function Test-MergeReady {
    param($Rollup)
    if ($null -eq $Rollup) { return $false }
    $items = @($Rollup)
    if ($items.Count -eq 0) { return $false }
    foreach ($c in $items) {
        if ($null -eq $c) { continue }
        $names = $c.PSObject.Properties.Name
        if ($names -contains 'conclusion') {
            $cname = if ($names -contains 'name') { [string]$c.name } else { '' }
            if ($cname -ieq $script:RequiredCheck) {
                $status = if ($names -contains 'status') { [string]$c.status } else { '' }
                $concl  = [string]$c.conclusion
                return ($status -eq 'COMPLETED' -and (@('SUCCESS', 'NEUTRAL', 'SKIPPED') -contains $concl))
            }
        }
        elseif ($names -contains 'state') {
            $ctx = if ($names -contains 'context') { [string]$c.context } else { '' }
            if ($ctx -ieq $script:RequiredCheck) { return ([string]$c.state -eq 'SUCCESS') }
        }
    }
    return $false
}

# Mode 3 merge sweep: auto-merge any open dev-loop PR to `dev` whose required check is green
# and which GitHub reports MERGEABLE, then move its ticket to Done. Red/pending/missing checks
# -> left open, retried next run; conflicts -> left open for manual rebase. `main` is never touched.
function Invoke-MergeSweep {
    try {
        $listJson = (Invoke-Capture -Exe $script:GhExe -Arguments @('pr', 'list', '--state', 'open', '--base', $BaseBranch, '--json', 'number,headRefName', '--limit', '100') -WorkDir $RepoRoot).Stdout
        $parsed = $null
        try { $parsed = $listJson | ConvertFrom-Json } catch { }
        $cands = @()
        foreach ($pr in $parsed) {
            if ($null -eq $pr) { continue }
            if ($pr.headRefName -match $script:BranchRegex) {
                $cands += [pscustomobject]@{ Number = [int]$pr.number; Branch = $pr.headRefName; Ticket = $Matches[1].ToUpper() }
            }
        }
        if (-not $cands) { Write-Log 'Merge sweep: no open dev-loop PRs to consider.'; return }
        Write-Log ("Merge sweep: {0} candidate PR(s): {1}" -f $cands.Count, (($cands | ForEach-Object { "#$($_.Number)($($_.Ticket))" }) -join ', '))

        foreach ($c in $cands) {
            $mergeable = $null; $checksGreen = $false
            for ($i = 0; $i -lt 5; $i++) {
                $mj = (Invoke-Capture -Exe $script:GhExe -Arguments @('pr', 'view', "$($c.Number)", '--json', 'mergeable,mergeStateStatus,statusCheckRollup') -WorkDir $RepoRoot).Stdout
                $pv = $null
                try { $pv = $mj | ConvertFrom-Json } catch { }
                if ($pv) {
                    $mergeable   = [string]$pv.mergeable
                    $checksGreen = Test-MergeReady -Rollup $pv.statusCheckRollup
                }
                if ($mergeable -eq 'CONFLICTING') { break }
                if ($mergeable -eq 'MERGEABLE' -and $checksGreen) { break }
                Start-Sleep -Seconds 2
            }
            if ($mergeable -eq 'CONFLICTING') {
                Write-Log ("  #{0} {1}: CONFLICTS with {2}; leaving open for manual rebase." -f $c.Number, $c.Ticket, $BaseBranch) 'WARN'
                continue
            }
            if (-not $checksGreen) {
                Write-Log ("  #{0} {1}: '{2}' check not green yet (pending/red/missing); leaving open, retry next run." -f $c.Number, $c.Ticket, $script:RequiredCheck)
                continue
            }
            if ($mergeable -ne 'MERGEABLE') {
                Write-Log ("  #{0} {1}: checks green but mergeability is '{2}'; retry next run." -f $c.Number, $c.Ticket, $mergeable) 'WARN'
                continue
            }
            $r = Invoke-Capture -Exe $script:GhExe -Arguments @('pr', 'merge', "$($c.Number)", '--squash', '--delete-branch') -WorkDir $RepoRoot
            Append-Raw -Prefix '[gh-merge] ' -Text $r.Stdout
            if ($r.ExitCode -eq 0) {
                Write-Log ("  #{0} {1}: MERGED to {2} (CI green)." -f $c.Number, $c.Ticket, $BaseBranch)
                $doneBody = ("Auto-merged to ``{0}`` on a green CI ``{1}`` check (Mode 3 dev loop). Closing this ticket.`n`nProduction promotion (``{0}`` -> ``main``, Vercel) stays a human step: verify the shipped change on ``{0}`` and file new tickets for any issues." -f $BaseBranch, $script:RequiredCheck)
                Invoke-Finalize -Ticket $c.Ticket -ToState 'Done' -Body $doneBody
            }
            else {
                Write-Log ("  #{0} {1}: merge command exit {2} (check the PR)." -f $c.Number, $c.Ticket, $r.ExitCode) 'WARN'
            }
        }
        Invoke-Logged -Exe $script:GitExe -Arguments @('-C', $RepoRoot, 'fetch', $Remote, '--prune') -AllowFail | Out-Null
    }
    catch {
        Write-Log ("Merge sweep error (continuing to implement step): {0} [line {1}]" -f $_.Exception.Message, $_.InvocationInfo.ScriptLineNumber) 'WARN'
        if ($_.ScriptStackTrace) { Append-Raw -Prefix '[sweep-trace] ' -Text $_.ScriptStackTrace }
    }
}

# =============================================================================
# Single-instance lock
# =============================================================================
if (Test-Path $LockFile) {
    $info = @(Get-Content -LiteralPath $LockFile -ErrorAction SilentlyContinue)
    $lpid = if ($info.Count -ge 1) { $info[0] } else { '' }
    $alive = $false
    if ($lpid -match '^\d+$' -and (Get-Process -Id ([int]$lpid) -ErrorAction SilentlyContinue)) { $alive = $true }
    if ($alive) { Write-Log ("Another dev-loop run is active (PID {0}). Exiting cleanly." -f $lpid); exit 0 }
    Write-Log ("Stale lock found (PID {0}); reclaiming." -f $lpid) 'WARN'
    Remove-Item -LiteralPath $LockFile -Force -ErrorAction SilentlyContinue
}
Set-Content -LiteralPath $LockFile -Value @("$PID", (Get-Date -Format o))

# =============================================================================
# Main
# =============================================================================
$exitCode = 0
try {
    Write-Log "=== AutoBlogr scheduled dev loop ==="
    Write-Log ("RepoRoot     : {0}" -f $RepoRoot)
    Write-Log ("WorktreePath : {0}" -f $WorktreePath)
    Write-Log ("Log file     : {0}" -f $script:LogFile)
    Write-Log ("Base branch  : {0}/{1}  | NoPr={2} NoMerge={3} MergeSweepOnly={4}" -f $Remote, $BaseBranch, [bool]$NoPr, [bool]$NoMerge, [bool]$MergeSweepOnly)

    $script:GitExe    = Resolve-Exe -Name 'git'
    $script:GhExe     = Resolve-Exe -Name 'gh'
    $script:ClaudeExe = Resolve-Exe -Name 'claude'
    $npmCmd           = Get-NpmCmd
    Write-Log ("Tools: git='{0}' gh='{1}' claude='{2}' npm='{3}'" -f $script:GitExe, $script:GhExe, $script:ClaudeExe, $npmCmd)

    if (-not (Test-Path (Join-Path $RepoRoot '.git'))) { throw "RepoRoot is not a git repository: $RepoRoot" }
    $gitCommonDir = (Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $RepoRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir')).Stdout.Trim()
    if (-not $gitCommonDir -or -not (Test-Path $gitCommonDir)) { $gitCommonDir = Join-Path $RepoRoot '.git' }
    Clear-StaleGitLocks -GitCommonDir $gitCommonDir

    Git -C $RepoRoot fetch $Remote --prune | Out-Null

    # --- Merge sweep (Mode 3) ------------------------------------------------
    if ($NoPr -or $NoMerge) {
        Write-Log ("Merge sweep skipped (NoPr={0}, NoMerge={1})." -f [bool]$NoPr, [bool]$NoMerge)
    } else {
        Invoke-MergeSweep
    }
    if ($MergeSweepOnly) { Write-Log 'MergeSweepOnly: sweep done; skipping implementation. Exiting cleanly.'; exit 0 }

    # --- Pre-flight SELECT (read-only) ---------------------------------------
    $selectPrompt = (Get-Content -LiteralPath (Join-Path $script:ScriptDir 'prompts\select.txt') -Raw).
        Replace('{PROJECT}', $LinearProject).
        Replace('{TEAM}', $LinearTeam)
    $sel = Invoke-ClaudeHeadless -Prompt $selectPrompt -WorkDir $RepoRoot -Label 'select' -DisallowedTools @('Edit', 'Write', 'NotebookEdit', 'Bash')
    if ($sel.IsError) { Write-Log "SELECT call errored; failing safe (no implement call this run)." 'WARN'; exit 0 }
    $eligible = Get-EligibleList -Text $sel.ResultText
    if ($null -eq $eligible) { $eligible = @() }
    Write-Log ("Eligible Todo tickets ({0}): {1}" -f $eligible.Count, ($(if ($eligible.Count) { $eligible -join ', ' } else { '(none)' })))
    if ($eligible.Count -eq 0) { Write-Log "No eligible Todo ticket. Exiting cleanly (no worktree, no implement call)."; exit 0 }
    $target = $eligible[0]
    Write-Log ("Target ticket for this run: {0}" -f $target)

    # --- Refresh remote + worktree -------------------------------------------
    $runBranch = "dev-loop/auto/$stamp"
    $wtNorm = ($WorktreePath -replace '\\', '/').TrimEnd('/').ToLower()
    $wtListing = (Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $RepoRoot, 'worktree', 'list', '--porcelain')).Stdout
    $registered = $false
    foreach ($line in ($wtListing -split "`r?`n")) {
        if ($line -like 'worktree *') {
            $p = ($line.Substring(9) -replace '\\', '/').TrimEnd('/').ToLower()
            if ($p -eq $wtNorm) { $registered = $true; break }
        }
    }
    if (-not $registered) {
        Git -C $RepoRoot worktree prune | Out-Null
        if (Test-Path $WorktreePath) {
            Write-Log ("Removing leftover (unregistered) worktree dir: {0}" -f $WorktreePath) 'WARN'
            Remove-Item -LiteralPath $WorktreePath -Recurse -Force -ErrorAction SilentlyContinue
        }
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $WorktreePath) | Out-Null
        Git -C $RepoRoot worktree add -B $runBranch $WorktreePath "$Remote/$BaseBranch" | Out-Null
    } else {
        Write-Log "Reusing existing worktree; resetting to a fresh branch."
        Git -C $WorktreePath reset --hard | Out-Null
        Git -C $WorktreePath checkout -B $runBranch "$Remote/$BaseBranch" | Out-Null
        Git -C $WorktreePath clean -fd | Out-Null
    }
    $headBranch = (Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $WorktreePath, 'rev-parse', '--abbrev-ref', 'HEAD')).Stdout.Trim()
    if ($headBranch -ne $runBranch) { throw "Worktree is on '$headBranch', expected '$runBranch'." }
    Write-Log ("Worktree ready on branch {0} @ {1}/{2}" -f $runBranch, $Remote, $BaseBranch)

    # --- Headless implement call ---------------------------------------------
    $implementPrompt = (Get-Content -LiteralPath (Join-Path $script:ScriptDir 'prompts\implement.txt') -Raw).
        Replace('{PROJECT}', $LinearProject).
        Replace('{TEAM}', $LinearTeam).
        Replace('{BRANCH}', $runBranch).
        Replace('{BASE}', $BaseBranch).
        Replace('{TARGET}', $target).
        Replace('{ALLOWLIST}', ($eligible -join ', '))
    $impl = Invoke-ClaudeHeadless -Prompt $implementPrompt -WorkDir $WorktreePath -Label 'implement'
    if ($impl.IsError) { Write-Log "Implement call reported an error envelope; checking for a result anyway." 'WARN' }

    $loop = $null
    $resultFile = Join-Path $WorktreePath '.dev-loop-result.json'
    if (Test-Path $resultFile) {
        try { $loop = (Get-Content -LiteralPath $resultFile -Raw) | ConvertFrom-Json }
        catch { Write-Log "Result file present but unparseable as JSON." 'WARN' }
        Remove-Item -LiteralPath $resultFile -Force -ErrorAction SilentlyContinue
    }
    if (-not $loop) { $loop = Get-LoopResult -Text $impl.ResultText }
    if (-not $loop) { throw "Implement call produced no result (.dev-loop-result.json missing and no parseable block)." }

    $status  = [string]$loop.status
    $ticket  = ([string]$loop.ticket).Trim().ToUpper()
    $summary = ([string]$loop.summary).Trim()
    Write-Log ("Loop result: status='{0}' ticket='{1}' summary='{2}'" -f $status, $ticket, $summary)

    # GUARD (post-check): the implemented ticket MUST be on the SELECT-approved allowlist.
    if ($status -eq 'implemented' -and ($eligible -notcontains $ticket)) {
        Write-Log ("GUARD: implement returned '{0}', NOT in the eligible allowlist ({1}). Discarding this run." -f $ticket, ($eligible -join ', ')) 'ERROR'
        exit 1
    }
    if ($status -ne 'implemented') { Write-Log ("Nothing to ship (status='{0}'). No PR. Exiting cleanly." -f $status); exit 0 }
    if (-not ($ticket -match '^[A-Z]+-\d+$')) { throw "Implemented but ticket id is invalid: '$ticket'." }

    # --- Commit the change ----------------------------------------------------
    Git -C $WorktreePath add -A | Out-Null
    $pending = (Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $WorktreePath, 'status', '--porcelain')).Stdout.Trim()
    if (-not $pending) { Write-Log ("Implement step produced no file changes for {0}; nothing to ship. Exiting cleanly." -f $ticket) 'WARN'; exit 0 }

    if (-not $summary) {
        $ns = @((Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $WorktreePath, 'diff', '--cached', '--name-status')).Stdout -split "`r?`n" | Where-Object { $_ })
        if ($ns.Count -eq 1) {
            $parts = $ns[0] -split "`t"
            $verb = switch ($parts[0].Substring(0, 1)) { 'A' { 'Add' } 'D' { 'Remove' } 'R' { 'Rename' } default { 'Update' } }
            $summary = "{0} {1}" -f $verb, $parts[-1]
        } elseif ($ns.Count -gt 1) { $summary = "Update {0} files" -f $ns.Count }
        else { $summary = "$ticket changes" }
        Write-Log ("Summary synthesized from staged diff: '{0}'" -f $summary)
    }

    $commitSubject = "{0}: {1}" -f $ticket, $summary
    if ($commitSubject.Length -gt 72) { $commitSubject = $commitSubject.Substring(0, 72) }
    Git -C $WorktreePath commit -m $commitSubject | Out-Null

    $featureBranch = "dev-loop/{0}-{1}" -f $ticket.ToLower(), $stamp
    if ($featureBranch -eq $BaseBranch) { throw "Refusing: feature branch resolves to base branch '$BaseBranch'." }
    Git -C $WorktreePath branch -m $featureBranch | Out-Null
    $runBranch = $featureBranch
    Write-Log ("Committed and renamed branch to {0}" -f $runBranch)

    $changedFiles = @((Invoke-Capture -Exe $script:GitExe -Arguments @('-C', $WorktreePath, 'diff', '--name-only', "$Remote/$BaseBranch...HEAD")).Stdout -split "`r?`n" | Where-Object { $_ })
    Write-Log ("Files changed ({0}): {1}" -f $changedFiles.Count, ($changedFiles -join ', '))

    # --- Quality gate: npm ci -> lint -> test -> build (ALL gating) -----------
    $ciExit = Invoke-Logged -Exe $npmCmd -Arguments @('ci') -WorkDir $WorktreePath -AllowFail
    $lintExit = $null; $testExit = $null; $buildExit = $null
    if ($ciExit -eq 0) {
        $lintExit  = Invoke-Logged -Exe $npmCmd -Arguments @('run', 'lint')  -WorkDir $WorktreePath -AllowFail
        $testExit  = Invoke-Logged -Exe $npmCmd -Arguments @('run', 'test')  -WorkDir $WorktreePath -AllowFail
        $buildExit = Invoke-Logged -Exe $npmCmd -Arguments @('run', 'build') -WorkDir $WorktreePath -AllowFail
    } else { Write-Log "npm ci failed; treating as a red gate." 'ERROR' }
    $green = ($ciExit -eq 0 -and $lintExit -eq 0 -and $testExit -eq 0 -and $buildExit -eq 0)
    Write-Log ("Quality gate: {0} (ci={1}, lint={2}, test={3}, build={4})" -f ($(if ($green) { 'GREEN' } else { 'RED' })), $ciExit, $lintExit, $testExit, $buildExit)

    $fileListMd = if ($changedFiles.Count) { ($changedFiles | ForEach-Object { "- ``$_``" }) -join "`n" } else { '- (none)' }
    function Fmt([object]$code) { if ($null -eq $code) { 'not run' } elseif ($code -eq 0) { 'PASS' } else { "FAILED (exit $code)" } }

    if ($NoPr) {
        Write-Log "-NoPr set: skipping push, PR creation, merge, and finalize. Quality gate was: $(if ($green) {'GREEN'} else {'RED'})."
        exit $(if ($green) { 0 } else { 1 })
    }

    if ($green) {
        if ($runBranch -eq $BaseBranch) { throw "Refusing to push: branch equals base '$BaseBranch'." }
        Git -C $WorktreePath push -u $Remote $runBranch | Out-Null

        $prTitle = "{0}: {1}" -f $ticket, $summary
        $prTitle = $prTitle -replace '"', ''   # strip quotes: PS 5.1 native-arg quoting is unreliable
        $prBodyTmpl = @'
{SUMMARY}

Opened by the scheduled dev loop ({TICKET}). Mode 3: this PR auto-merges to `{BASE}` once the CI `{CHECK}` check is green. It does NOT ship to production by itself: promotion `{BASE}` -> `main` (Vercel) stays a human step.

**Ticket:** {TICKET}
**Branch:** `{BRANCH}` -> `{BASE}`

**Files changed:**
{FILES}

**Quality gate (runner):**
- `npm ci` : {CI}
- `npm run lint` : {LINT}
- `npm run test` : {TEST}
- `npm run build` : {BUILD}

**Protected-area check:** this change touches no protected surface (auth, secrets/BYOK, `supabase/migrations/**`, `src/lib/supabase*`, Edge Functions, `.github/workflows/*`, deploy config, `wp-plugin/**`). If it does, do not merge — escalate.
'@
        $prBody = $prBodyTmpl.Replace('{SUMMARY}', $summary).Replace('{TICKET}', $ticket).Replace('{BRANCH}', $runBranch).Replace('{BASE}', $BaseBranch).Replace('{CHECK}', $script:RequiredCheck).Replace('{FILES}', $fileListMd).Replace('{CI}', (Fmt $ciExit)).Replace('{LINT}', (Fmt $lintExit)).Replace('{TEST}', (Fmt $testExit)).Replace('{BUILD}', (Fmt $buildExit))
        # Pass the body via a file (never inline): multi-line markdown with backticks/quotes
        # would otherwise be mis-tokenized by the Windows PowerShell 5.1 native-arg parser.
        $prBodyFile = Join-Path $LogDir ("pr-body-{0}.md" -f $stamp)
        [void](Set-FileText -Path $prBodyFile -Text $prBody)
        $prRes = Invoke-Capture -Exe $script:GhExe -Arguments @('pr', 'create', '--base', $BaseBranch, '--head', $runBranch, '--title', $prTitle, '--body-file', $prBodyFile) -WorkDir $WorktreePath
        Append-Raw -Prefix '[gh] ' -Text $prRes.Stdout
        if ($prRes.ExitCode -ne 0) { throw "gh pr create failed (exit $($prRes.ExitCode)). See log." }
        $prUrl = (($prRes.Stdout -split "`r?`n") | Where-Object { $_ -match '^https?://' } | Select-Object -Last 1)
        if (-not $prUrl) { $prUrl = $prRes.Stdout.Trim() }
        Write-Log ("PR opened: {0}" -f $prUrl)

        $bodyTmpl = @'
Implemented via the scheduled dev loop and opened as a PR (Mode 3: auto-merges to `{BASE}` once the CI `{CHECK}` check is green).

**PR:** {PRURL}
**Branch:** `{BRANCH}` -> `{BASE}`
**Summary:** {SUMMARY}

**Files changed:**
{FILES}

**Quality gate (runner):**
- `npm ci` : {CI}
- `npm run lint` : {LINT}
- `npm run test` : {TEST}
- `npm run build` : {BUILD}

This PR auto-merges to `{BASE}` once `{CHECK}` is green, and the ticket then moves to Done. Production promotion (`{BASE}` -> `main`, Vercel) stays a human step: verify on `{BASE}` and file new tickets for anything off.
'@
        $body = $bodyTmpl.Replace('{PRURL}', $prUrl).Replace('{BRANCH}', $runBranch).Replace('{BASE}', $BaseBranch).Replace('{CHECK}', $script:RequiredCheck).Replace('{SUMMARY}', $summary).Replace('{FILES}', $fileListMd).Replace('{CI}', (Fmt $ciExit)).Replace('{LINT}', (Fmt $lintExit)).Replace('{TEST}', (Fmt $testExit)).Replace('{BUILD}', (Fmt $buildExit))
        Invoke-Finalize -Ticket $ticket -ToState 'Review' -Body $body
    }
    else {
        $bodyTmpl = @'
Quality gate FAILED during the scheduled dev loop. No branch was pushed and no PR was opened.

**Summary attempted:** {SUMMARY}
**Local branch (not pushed):** `{BRANCH}`

**Quality gate (runner):**
- `npm ci` : {CI}
- `npm run lint` : {LINT}
- `npm run test` : {TEST}
- `npm run build` : {BUILD}

Full run log: `{LOG}`

Left this ticket In Progress for investigation. Fix and re-run, or move it back to Todo to retry.
'@
        $body = $bodyTmpl.Replace('{SUMMARY}', $summary).Replace('{BRANCH}', $runBranch).Replace('{CI}', (Fmt $ciExit)).Replace('{LINT}', (Fmt $lintExit)).Replace('{TEST}', (Fmt $testExit)).Replace('{BUILD}', (Fmt $buildExit)).Replace('{LOG}', $script:LogFile)
        Invoke-Finalize -Ticket $ticket -ToState 'None' -Body $body
        $exitCode = 1
    }
}
catch {
    Write-Log ("FATAL: {0}" -f $_.Exception.Message) 'ERROR'
    if ($_.ScriptStackTrace) { Append-Raw -Prefix '[trace] ' -Text $_.ScriptStackTrace }
    $exitCode = 1
}
finally {
    Remove-Item -LiteralPath $LockFile -Force -ErrorAction SilentlyContinue
    Write-Log ("Done. Exit {0}. Log: {1}" -f $exitCode, $script:LogFile)
}

exit $exitCode
