# design-sync notes — AutoBlogr

Repo-specific gotchas for syncing this design system to claude.ai/design.
Read this before re-running the sync. Config lives in `.design-sync/config.json`.

## What this DS actually is

- **This repo is an application, not a component library.** `package.json` is `private` with no
  `main`/`module`/`exports`, and `npm run build` produces a **Vite app** (`dist/index.html` + assets) —
  *not* a library entry. There is no `.d.ts` tree anywhere.
- The design system is the **shadcn/ui set in `src/components/ui/`** (new-york style, `components.json`,
  `tsx: false` so every component is plain `.jsx`). 48 source files → **246 PascalCase exports**
  (shadcn compounds export all their sub-parts: `sidebar.jsx` alone exports 23).
  `use-toast.jsx` contributes no components (it's the hook) — this is correct, not a miss.

## The `--entry` trick (why the build command looks wrong)

The converter resolves the package dir as `join(<node-modules>, cfg.pkg)`, which in a DS's *own* repo
doesn't exist (npm won't self-install). Passing `--entry` makes it instead walk up from the entry to the
nearest `package.json` with a `name` — landing on the repo root, which is what we want.

But we also need **synth-entry mode** (no dist → the converter synthesizes an entry from `src/` and
auto-discovers components), and that only engages when the entry does **not** resolve.

Both are satisfied by pointing `--entry` at a **deliberately non-existent path**:

```sh
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/.cache/no-lib-entry.js --out "$OUT"
```

`lib/bundle.mjs:resolveDistEntry` is called with `soft: true` by the package adapter, so a missing
`--entry` prints `[NO_DIST] --entry ... doesn't exist` and returns `null` → synth path. **Both
`[NO_DIST]` lines in the build log are expected and benign** — they are not a failure to chase.
`./.design-sync/.cache/no-lib-entry.js` must stay non-existent; never create that file.

*Rejected alternative:* a `node_modules/autoblogr` junction to the repo root would also fix the package
dir, but it creates a recursive `node_modules/autoblogr/node_modules/autoblogr/...` path inside a
**Dropbox-synced** tree. Not worth the risk. See below.

## Dropbox (`R:\Dropbox\...`) — file locking

This repo lives in a Dropbox-synced folder, which holds handles open and breaks deletes:

- **`npm ci` fails with `EBUSY ... rmdir node_modules/acorn-jsx`** — it wipes `node_modules` first.
  Use **`npm install`** instead. (There is no committed lockfile anyway.)
- **The build output must live OUTSIDE the Dropbox tree.** `package-build.mjs` does `rm -rf` on `--out`
  every run, and Dropbox made that fail with `EBUSY`. Build to
  **`C:/Users/ryanf/AppData/Local/Temp/autoblogr-ds-bundle`** and pass that as both `--out` and
  `finalize_plan`'s `localDir`. (`vite.config.js` already relocates Vite's dep cache off-tree for the
  same reason — same class of bug.)
- A locked dir that `rm -rf` won't remove will usually **`mv` first, then `rm`**.

## Tailwind — `cssEntry` must be COMPILED first

`src/index.css` is raw `@tailwind base/components/utilities` directives plus the `:root` token block —
**not loadable in a browser**. The DS ships a compiled stylesheet instead:

```sh
npx tailwindcss -c .design-sync/tailwind.ds.config.cjs -i src/index.css -o .design-sync/.cache/tailwind.css
```

This is `cfg.buildCmd` and **must run before every converter run** (the output is gitignored under
`.cache/`, so a fresh clone has no stylesheet until it runs).

`.design-sync/tailwind.ds.config.cjs` re-exports the app's own `tailwind.config.js` theme and differs in
two deliberate ways:

1. **`content` also scans `.design-sync/previews/**`** — utility classes used solely in an authored preview
   card would otherwise be purged and the card would ship unstyled.

2. **A broad `safelist`** (737 KB compiled, 82 KB gzipped, ~6.5k selectors — was 97 KB when purged to
   `src/` alone). This is the important one and it is **not optional**:

   > An app may purge to its own markup. A **design system cannot.** The claude.ai/design agent builds
   > NEW screens with these components and writes its own layout glue (`grid grid-cols-3`, `gap-8`,
   > `md:flex-row`, `hover:bg-accent`). Rendered designs receive **only** the `styles.css` import closure,
   > so any class the agent writes that isn't in this stylesheet silently renders unstyled — and nothing
   > downstream catches it.

   The safelist is therefore the vocabulary `.design-sync/conventions.md` promises the agent it can use.
   **Keep the two in agreement**: if you enumerate a class family in the conventions header, safelist it.

   **Arbitrary-value classes (`w-[473px]`, `text-[13px]`) can never be safelisted** — Tailwind JIT only
   emits them when it sees them in scanned content. They work in previews (the `previews/**` glob catches
   them, after a recompile) but will NOT work in an agent-authored design. Avoid them in previews so the
   cards don't teach a pattern that breaks downstream.

**Only `package-build.mjs` refreshes the shipped CSS** (`lib/preview-rebuild.mjs` explicitly does not touch
`_ds_bundle.css`). So the compile + full build are orchestrator-only steps; parallel preview subagents
cannot introduce a new utility class and see it styled. The safelist is what makes their authoring loop
work without a rebuild.

> **Consequence worth internalising:** for anyone authoring against an already-built bundle, the usable
> class vocabulary is **safelist ∪ classes already present in `src/`**. The `previews/**` content glob only
> pays off after `buildCmd` + a full `package-build` re-runs, so mid-wave it is effectively inert.

## Known DS source bugs (found during the import — NOT fixed here)

Two components accept a documented prop that renders **no visual state**, because the CSS keys off a
pseudo-class that cannot match the element Radix renders. Both confirmed by screenshot:

| Component | Prop | Why it does nothing |
|---|---|---|
| `Slider` | `disabled` | `disabled:opacity-50` sits on `SliderPrimitive.Thumb`, which renders a `<span role="slider">`. CSS `:disabled` only matches form controls, never a span. Radix emits `data-disabled` — the fix is `data-[disabled]:`. |
| `Checkbox` | `checked="indeterminate"` | The Indicator unconditionally renders `<Check />` and the fill is `data-[state=checked]:bg-primary`, so indeterminate shows a tick on an unfilled box instead of the canonical mixed state (upstream shadcn renders `<Minus />`). |

**Discriminator:** `Checkbox`/`Switch`/`RadioGroup` `disabled` *do* work — their Radix roots are real
`<button>`s, so `:disabled` matches. This is not a shadcn-wide bug.

Also: `slider.jsx` renders exactly **one hardcoded `<Thumb>`**, so a two-value range silently renders a
single thumb and mis-tracks.

The affected preview cells were **deliberately dropped** (a card showing a state that doesn't visibly
change teaches the design agent to write dead props), and the `dtsPropsFor` JSDoc for both carries an
explicit caveat. **If the source is fixed, restore the cells and drop the caveats.**

## Fonts — nothing to ship (verified)

No `[FONT_MISSING]` is correct here. `src/index.css` mentions `font-family: Inter, …` but **only inside a
commented-out block** — with comments stripped the live stacks are Tailwind's defaults
(`ui-sans-serif, system-ui, …` and the mono stack), and the compiled CSS has **zero `@font-face` rules**.
This DS renders in the system font stack by design; there is no brand webfont to source. Don't go hunting.

## Authored previews — the pattern

`.design-sync/previews/<Name>.tsx`, one file per component; each **uppercase function export = one graded
card cell**, rendered as `h(window.__dsPreview[key])` with no props. Import from **`'autoblogr'`** (the bare
package specifier is shimmed to `window.AutoBlogr`); `lucide-react` and `react-hook-form` resolve normally.

Learned from the calibration pass (Button / Card / Dialog):

- **Overlays must be forced open statically** (`<Dialog open modal={false}>`) — an interaction-driven open
  state captures as a bare trigger button.
- **Pass `onOpenAutoFocus={(e) => e.preventDefault()}` to Radix `*Content`.** Otherwise Radix focuses the
  first field and *selects its text*, which captures as a blue selection highlight.
- **Watch the `sm:` breakpoint (640px) against the declared capture viewport.** shadcn footers are
  `flex-col-reverse sm:flex-row`, so `Dialog` at a 560px viewport captured the *mobile* stacked+reversed
  footer. Declared viewport ≥ 720 fixes it. The default capture viewport (~1000px) is already fine — this
  only bites components given an explicit narrow `cfg.overrides.<Name>.viewport`.
- **Changing `cfg.overrides` requires a full `package-build`** — `preview-rebuild` refuses with
  `[CONFIG_STALE]` because the full build re-stamps grade keys.
- **Use DS tokens in previews, never raw grays.** App code sometimes uses `text-gray-600` / `bg-emerald-100`
  directly; the cards must not teach that, because the design agent imitates them.

### Overlays specifically

- **`modal={false}` does NOT generalize beyond Dialog — it deletes the scrim.** Radix's `DialogOverlay`
  returns `null` when `modal={false}`, and vaul's does the same. `Sheet`/`Drawer` panels are `bg-background`
  on a white page, so without the overlay they capture as white-on-white and the `side` variant is
  unreadable. Leave `modal` at its default `true` for Sheet/Drawer/AlertDialog — the focus trap it avoids
  costs nothing when the harness captures one story per page load. (`AlertDialog` can't opt out anyway:
  Radix hardcodes `modal={true}`.) `Dialog.tsx` keeps `modal={false}` deliberately and is graded good.
- **All portal overlays need `cfg.overrides.<Name>.cardMode = "single"`.** The default grid render paints
  every story onto `document.body`, so they stack on top of each other. Captures are unaffected (the
  harness drives `?story=`, one render per page), but the *card humans browse* is the grid.
  `column` preserves the story inventory but still shares one body, so overlays still stack — `single` is
  the only visually correct mode. The cost: `single` shows only the primary story, so `Sheet` and `Tooltip`
  lose their `side` sweeps on the card (the sweep still exists as cells and in the `.d.ts` enum).
- **`viewport` is IN the grade key; `cardMode` is NOT.** Adding an explicit `ov.viewport` re-mints that
  component's verdicts. The overlay grades here were minted at the default **900x700**, which is why only
  `cardMode` was applied. `single` renders the FIRST export, which already matches the canonical story in
  each file — so no `primaryStory` was needed.
- Smaller overlay facts: `onOpenAutoFocus` artifacts differ per component (first-field text selection vs.
  AlertDialog's Cancel focus ring); a disabled Tooltip trigger needs an `inline-block` span wrapper plus
  `sideOffset={8}`; `HoverCardContent` is not portalled in this DS but floating-ui resolves the
  `.ds-single` transform correctly; Drawer's stacked footer is correct-by-design — don't "fix" it.

### Per-component traps (each cost a capture cycle to find)

- **`ContextMenu open` is a silent no-op.** Verified against the installed `@radix-ui/react-context-menu@2.2.16`:
  the root accepts only `{children, onOpenChange, dir, modal}`, its open state is a plain internal
  `useState(false)`, and the menu anchors to a *virtual element* built from the `contextmenu` event's
  `clientX/clientY` — so there is no position to render at even if `open` were controllable.
  `previews/ContextMenu.tsx` forces it open by dispatching one `contextmenu` MouseEvent at the trigger from
  a ref callback on mount, anchored at the trigger's lower-right so the trigger stays legible.
  (`ContextMenuSub open` *does* work.)
- **`react-resizable-panels` sets an inline `height:100%`, which beats any `h-*` class.** Put the height on a
  wrapper div instead. Insidious because the *horizontal* group looks fine while broken — only the vertical
  one collapses to a hairline.
- **Recharts races the capture.** Set `isAnimationActive={false}` on every series or the chart captures
  half-drawn. House rule for any chart preview here. `ChartTooltip` is invisible in a static capture (it's
  hover-driven); `ChartLegendContent` renders fine. `ChartContainer` needs a sized parent and a real
  `config` — that `config`→`--color-*` mapping is the component's entire point.
- **`ScrollArea` needs `type="always"`** or the scrollbar auto-hides and the card reads as a plain div.
- **`Carousel` arrows are `-left-12/-right-12`** — the parent needs ~`px-14` or they clip.
- **`Sidebar`'s `variant`/`side` cannot be demoed in a bounded card.** They're only read on the non-`none`
  code path, which is `hidden md:block` + `fixed h-svh`: it renders nothing at a narrow capture viewport and
  bleeds past any bounded wrapper otherwise. The previews use `collapsible="none"` and deliberately omit
  `variant`/`side`/`SidebarTrigger` rather than teach props that are no-ops in the composition shown.
  Demoing them would need a `viewport` ≥ ~1024 wide (and would re-mint those grades).
- **`<SidebarProvider className="h-full min-h-0">`** is what makes a bounded shell possible — tailwind-merge
  lets `min-h-0` beat the built-in `min-h-svh`.
- **`SidebarContent` is `overflow-auto` and silently scrolls rows out of the card** with no visual hint.
  Budget ~5–7 menu rows at `h-96`.
- **`SidebarMenuSkeleton` randomises its text width per instance**, so its screenshots are NOT pixel-stable
  across captures. Don't chase a "changed" sheet for that component.
- **`PaginationLink` is an `<a>` with no `disabled` prop** — boundary state is compositional
  (`aria-disabled` + `pointer-events-none opacity-50`), same class as the `aria-invalid` idiom.
  `PaginationPrevious`/`Next` hardcode `size="default"`, overriding any `size` passed.
- **`NavigationMenu` needs no `cardMode`** (verified): its viewport is `absolute top-full` *inside* the Root,
  not portalled to `document.body`, so an open panel stays in its own grid cell. Forcing it open requires an
  explicit `value` on `NavigationMenuItem` (Radix auto-generates one otherwise, so a controlled Root `value`
  could never match). Its only failure mode is overflowing into the next row — solved in-preview with a
  `pb-56` spacer.
- **`Table` needs no `cardMode: "column"`** (verified) — the 4-column posts table fits the default cell.
- **`Menubar` and `Command` roots stretch** to fill their container and capture implausibly wide — constrain
  with `w-fit` / `max-w-md`.
- **`CommandDialog` can't forward `onOpenAutoFocus`** (its inner `DialogContent` is hardcoded), so its input
  is autofocused. Harmless today (no visible ring), but latent if the theme ever gives inputs one.

### Form conventions the cards encode

- **Label binding:** control gets `id`, Label gets matching `htmlFor`. For `peer-disabled` label dimming to
  fire, the control must carry `peer` **and precede the Label as a sibling** — never wrapped.
- **Error state is compositional, not a variant.** No form control has an `error`/`invalid` variant. The
  idiom is `aria-invalid` + `border-destructive focus-visible:ring-destructive` + a `text-sm text-destructive`
  message.
- **`RadioGroup` is `grid gap-2` by default** — `orientation="horizontal"` alone changes nothing visually;
  add `className="flex ..."`.
- **Uncontrolled only** in previews (`defaultValue`/`defaultChecked`): cells render via `h(Component)` with
  no props and no state, so a bare `value` would warn and freeze the field.

## The toast.jsx incident (2026-07-16) — read if Toast looks wrong

Mid-sync, `src/components/ui/toast.jsx` silently reverted to a **broken** pre-fix version (no
`@radix-ui/react-toast` import; `ToastProvider` and `ToastViewport` duplicated as identical `fixed top-0`
divs; `ToastClose` an inert button, so toasts could never be dismissed). Cause: local `dev` was **3 commits
behind `origin/dev`**, and the fix — `847f222 "Fix demo blockers: dead toasts…"` — hadn't been pulled. The
working tree briefly held the fixed file (likely Dropbox syncing this tree against another checkout) and
then reverted to match HEAD.

Resolved by `git pull --ff-only` to `847f222`. **A git repo inside Dropbox can have its working tree
mutated underneath a running build** — if a component's render suddenly contradicts its source, diff the
working tree against HEAD *and* check whether the branch is behind before believing anything.

## Grouping — why `.design-sync/docs/` exists

`lib/source-kit.mjs` derives a component's group from its source directory, but skips generic dir names
(`GENERIC_DIR` = components/component/src/lib/**ui**/packages/react). Every file here sits flat in
`src/components/ui/`, so **every component derived to `general`** regardless of `cfg.srcDir` — a single
flat pane of 246 cards.

Fix: `.design-sync/docs/<Name>.md` per component, with `category:` frontmatter, bound via `cfg.docsDir`.
Frontmatter `category` sets the group **and** the body's first line becomes the `.prompt.md` summary the
design agent reads. Groups: Forms, Overlays, Navigation, Data Display, Feedback, Layout.
These were generated once from a family→group map; they are durable, committed, and hand-editable.
Adding a component to `src/components/ui/` means **adding a matching `docs/<Name>.md`**, or it silently
lands back in `general`.

## `.d.ts` contracts — all hand-written

`[DTS] parsed 0 .d.ts files` is expected: the sources are `.jsx` with `cva()` variants and no type
annotations, so the extractor has nothing to read and emits `[key: string]: unknown` for **every**
component. That is the artifact the design agent codes against, so all 246 bodies are hand-written in
**`cfg.dtsPropsFor`**, grounded in each file's cva variant map, its destructured params, and the upstream
primitive it forwards to.

**If you add or change a component's props, update `cfg.dtsPropsFor.<Name>` — nothing regenerates it.**

## How to re-sync (the whole command)

```sh
# 1. deps (NO lockfile in repo, and `npm ci` dies on Dropbox EBUSY — see above)
npm install
(cd .ds-sync && npm i esbuild ts-morph @types/react playwright --ignore-scripts)   # if .ds-sync is fresh

# 2. re-copy the staged scripts (a stale .ds-sync/ runs an OLD converter against current instructions)
cp -r "<skill-base-dir>"/{package-build.mjs,package-validate.mjs,package-capture.mjs,resync.mjs,lib,storybook} .ds-sync/

# 3. cfg.buildCmd — compile the Tailwind entry (nothing works without this)
npx tailwindcss -c .design-sync/tailwind.ds.config.cjs -i src/index.css -o .design-sync/.cache/tailwind.css

# 4. fetch the verification anchor from the project, then run the driver
#    (projectId is in config.json; save _ds_sync.json to .design-sync/.cache/remote-sync.json)
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/.cache/no-lib-entry.js --out C:/Users/ryanf/AppData/Local/Temp/autoblogr-ds-bundle \
  --remote .design-sync/.cache/remote-sync.json
```

Note `--out` is **outside the repo** (Dropbox EBUSY) and `--entry` points at a file that must **not exist**.

## Re-sync risks

- **`cfg.dtsPropsFor` is a hand-maintained mirror of the source.** It cannot drift-detect: if a `cva`
  variant gains an option or a prop is renamed in `src/components/ui/*.jsx`, the contract silently lies to
  the design agent. On re-sync, re-run `scratchpad/extract-api.mjs`-style extraction (cva maps +
  destructured params) and diff against the config before trusting it.
- **`.design-sync/docs/*.md` is keyed by component name.** A renamed export orphans its doc → that
  component drops back to `general` with a thin prompt. A new export with no doc does the same.
- **The `--entry` path must stay non-existent.** If someone later adds a real library build at that path,
  the converter would silently switch out of synth mode and auto-discovery would stop (component list
  would come from `.d.ts` instead — currently none, which would mean **zero components**).
- **Playwright/chromium pinning:** `playwright@1.61.1` pins chromium build **1228**, which is what's
  cached at `%LOCALAPPDATA%/ms-playwright` (NOT `~/.cache/ms-playwright` — that path is empty on this
  box). Installed into `.ds-sync/` with `--ignore-scripts` to avoid a browser download. A playwright
  upgrade that moves off 1228 will fail with `Executable doesn't exist` and want a ~200MB download.
- **`node_modules` is not committed and has no lockfile** — dependency versions can float between syncs,
  which can change what the bundle inlines (currently 104 npm packages, 1349 KB). A floated Radix version
  can also invalidate a `dtsPropsFor` body sourced from "the upstream primitive's documented API".
- **The safelist and `conventions.md` must agree.** The header promises the design agent a class vocabulary;
  the safelist is what makes those classes exist. Change one, check the other. Anything the header names is
  verifiable — grep the class against `_ds_bundle.css` and the component names against the
  `components/<group>/<Name>/` dirs before trusting it.
- **`conventions.md` is human-editable and belongs to its authors.** A re-sync **validates** it against the
  fresh build and reports drift — it does **not** rewrite it.
- **Grades live in `.design-sync/.cache/review/` and are gitignored.** Cross-machine carry-forward comes from
  the **uploaded `_ds_sync.json`**, not from git. A fresh clone with no anchor re-verifies everything.
- **`Sidebar`'s `variant`/`side` and `Slider`'s `disabled` are deliberately undemoed**, and `Checkbox`'s
  indeterminate row was dropped. These are recorded gaps, not oversights — see the sections above before
  "fixing" them.

## Known render warns

Triaged warnings that are legitimate. A re-sync checks its warn lines against this list — **anything not
here is new**, so look at it before dismissing it.

- **`[TOKENS_MISSING]` — exactly these 4 vars, and no others:**
  `--radix-accordion-content-height`, `--radix-navigation-menu-viewport-height`,
  `--radix-navigation-menu-viewport-width`, `--tw-shadow-color`.
  All are **set at runtime**, which is the case the warning text itself calls out. The first three are
  written by Radix onto the element at open time (consumed by `tailwind.config.js` accordion keyframes and
  by `navigation-menu.jsx`); `--tw-shadow-color` is a Tailwind internal set by its own shadow utilities.
  **Verified by render, not assumed:** `Accordion` (Single/Multiple/InContext) and `NavigationMenu`
  (PrimaryNavOpen) both grade `good` with their panels painted. Do NOT set `cfg.tokensPkg`/`tokensGlob` for
  these. If the list ever grows past these four, that IS new.
- **The two `[NO_DIST]` lines are expected** — see "The `--entry` trick" above. Not a failure.

## Resolved warns — don't reintroduce these

- **`[FONT_MISSING] "Cambria"`** was self-inflicted: safelisting `font-(sans|serif|mono)` emitted
  `.font-serif`, which pulls Tailwind's default serif stack (`ui-serif, Georgia, Cambria, …`) into the
  shipped CSS and made it reference a family with no woff2 to ship. **This DS has no serif** (zero uses of
  `font-serif` in `src/`). Fixed by safelisting `font-(sans|mono)` only. If Cambria reappears, someone
  re-added serif to the safelist — remove it rather than sourcing a font.
- **`[GRID_OVERFLOW]` on 8 components** — all resolved via `cfg.overrides` (see the card-mode table below).

## Card modes (`cfg.overrides`) — why each one exists

22 entries, all resolving a real `[GRID_OVERFLOW]` or portal-stacking problem. **`cardMode` is not in the
grade key, so these carry grades forward; an explicit `viewport` IS keyed and re-mints them** — which is why
only `Dialog` has one (set before its verdict was minted).

- **`single`** (portal/fixed content — a grid card stacks every story on `document.body`):
  `Dialog` (+`viewport: 720x460`), `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `HoverCard`, `Tooltip`,
  `DropdownMenu`, `ContextMenu`, `Command`, `Menubar`, `Toast` (`primaryStory: Default`),
  `Toaster` (`primaryStory: MountedWithQueue`), `Select` (`primaryStory: OpenMenu`).
  Cost: `single` shows only the primary story, so `Sheet`/`Tooltip` lose their `side` sweeps **on the card**
  (the cells still exist and the enum is in the `.d.ts`).
- **`column`** (renders wider than a grid cell; keeps every story at full card width):
  `Sidebar`, `SidebarInput`, `SidebarMenuSkeleton`, `ChartContainer`, `NavigationMenu`, `Pagination`,
  `PaginationEllipsis`, `Tabs`.
- **Verified as needing NO override:** `Table` (the 4-col posts table fits the default cell) and
  `NavigationMenu` needing `single` (it's flagged *wide*, not *escaping* — its panel is `absolute top-full`
  inside its own Root, not portalled). Don't "helpfully" add them.
