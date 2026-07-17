// Tailwind config for the design-sync build (claude.ai/design import).
//
// Same theme/plugins as the app's tailwind.config.js — the DS must ship the app's
// real tokens, not a parallel set. Two deliberate differences:
//
// 1. `content` also scans .design-sync/previews/** — utility classes appearing only
//    in an authored preview card would otherwise be purged and the card ships unstyled.
//
// 2. `safelist` keeps a broad utility surface that the app itself may not happen to use.
//    This is the important one. The app can purge to its own markup; a DESIGN SYSTEM
//    cannot. The claude.ai/design agent builds NEW screens on top of these components and
//    writes its own layout glue (`grid grid-cols-3`, `gap-8`, `max-w-2xl`…). Rendered
//    designs receive only this stylesheet, so any class the agent writes that was purged
//    here silently renders unstyled. The safelist below is the vocabulary the conventions
//    header promises the agent it can use — the two must stay in agreement.
//
// Consumed via `cfg.cssEntry` after compiling to .design-sync/.cache/tailwind.css.
// Run from the repo root — content globs resolve against the CLI's cwd.
const base = require('../tailwind.config.js')

// The DS's semantic color names (from tailwind.config.js `theme.extend.colors`).
const COLORS = [
  'background', 'foreground', 'border', 'input', 'ring',
  'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
]
const colorGroup = `(${COLORS.join('|')})`

const RESPONSIVE = ['sm', 'md', 'lg', 'xl']

module.exports = {
  ...base,
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './.design-sync/previews/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // ── semantic colors on every property that takes one ──────────────────
    { pattern: new RegExp(`^(bg|text|border|ring|fill|stroke|divide|outline)-${colorGroup}$`), variants: ['hover', 'focus', 'focus-visible', 'active', 'disabled', 'dark'] },
    // opacity modifiers the components themselves use (bg-primary/90 etc.)
    { pattern: new RegExp(`^(bg|text|border)-${colorGroup}\\/(5|10|20|30|40|50|60|70|80|90)$`), variants: ['hover', 'dark'] },

    // ── display / flex / grid ─────────────────────────────────────────────
    { pattern: /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|contents|hidden|table|flow-root)$/, variants: RESPONSIVE },
    { pattern: /^(flex-row|flex-row-reverse|flex-col|flex-col-reverse|flex-wrap|flex-nowrap|flex-1|flex-auto|flex-initial|flex-none|shrink|shrink-0|grow|grow-0)$/, variants: RESPONSIVE },
    { pattern: /^(items|self)-(start|end|center|baseline|stretch)$/, variants: RESPONSIVE },
    { pattern: /^(justify|content)-(start|end|center|between|around|evenly|stretch)$/, variants: RESPONSIVE },
    { pattern: /^grid-cols-(1|2|3|4|5|6|7|8|9|10|11|12|none)$/, variants: RESPONSIVE },
    { pattern: /^grid-rows-(1|2|3|4|5|6|none)$/, variants: RESPONSIVE },
    { pattern: /^(col|row)-span-(1|2|3|4|5|6|7|8|9|10|11|12|full)$/, variants: RESPONSIVE },
    { pattern: /^(col|row)-start-(1|2|3|4|5|6|7|8|9|10|11|12|13|auto)$/, variants: RESPONSIVE },
    { pattern: /^(auto-cols|auto-rows)-(auto|min|max|fr)$/, variants: RESPONSIVE },
    { pattern: /^order-(1|2|3|4|5|6|first|last|none)$/, variants: RESPONSIVE },

    // ── spacing (gap / padding / margin / space-between) ──────────────────
    { pattern: /^(gap|gap-x|gap-y)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32)$/, variants: RESPONSIVE },
    { pattern: /^(p|px|py|pt|pr|pb|pl)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32)$/, variants: RESPONSIVE },
    { pattern: /^-?(m|mx|my|mt|mr|mb|ml)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|auto)$/, variants: RESPONSIVE },
    { pattern: /^(space-x|space-y)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|8|10|12|16)$/, variants: RESPONSIVE },
    { pattern: /^(space-x|space-y)-reverse$/ },
    // divide-* widths: only divide-<color> came through the color patterns above, and src/
    // never uses divide-*, so a divided list (a shape the design agent reaches for constantly)
    // would have rendered with no rule at all.
    { pattern: /^divide-(x|y)(-0|-2|-4|-8)?$/ },
    { pattern: /^divide-(x|y)-reverse$/ },
    { pattern: /^divide-(solid|dashed|dotted|none)$/ },

    // ── sizing ────────────────────────────────────────────────────────────
    { pattern: /^w-(0|px|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|48|56|64|72|80|96|auto|full|screen|min|max|fit|1\/2|1\/3|2\/3|1\/4|3\/4)$/, variants: RESPONSIVE },
    { pattern: /^h-(0|px|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|48|56|64|72|80|96|auto|full|screen|min|max|fit)$/, variants: RESPONSIVE },
    { pattern: /^size-(3|4|5|6|8|10|12|16|full)$/ },
    { pattern: /^(max-w)-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|min|max|fit|prose|screen-sm|screen-md|screen-lg|screen-xl)$/, variants: RESPONSIVE },
    { pattern: /^(min-w|min-h)-(0|full|min|max|fit|screen)$/, variants: RESPONSIVE },
    { pattern: /^(max-h)-(0|full|screen|min|max|fit|32|40|48|64|80|96)$/, variants: RESPONSIVE },

    // ── typography ────────────────────────────────────────────────────────
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/, variants: RESPONSIVE },
    { pattern: /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/ },
    // sans + mono only. `font-serif` is deliberately NOT safelisted: this DS has no serif in its
    // type system (zero uses in src/), and emitting the class pulls Tailwind's default serif stack
    // into the shipped CSS — which referenced "Cambria" and tripped [FONT_MISSING] for a family
    // there is no woff2 to ship. It would also invite the design agent to use a typeface the
    // design language doesn't include.
    { pattern: /^font-(sans|mono)$/ },
    { pattern: /^text-(left|center|right|justify)$/, variants: RESPONSIVE },
    { pattern: /^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/ },
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/ },
    { pattern: /^(underline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|truncate|italic|not-italic|whitespace-nowrap|whitespace-pre-wrap|break-words|text-balance|text-pretty|tabular-nums)$/, variants: ['hover'] },
    { pattern: /^line-clamp-(1|2|3|4|5|6|none)$/ },
    // list utilities: src/ never uses them and nothing above covered them, so a plain <ul>
    // in an agent-authored design would render with no marker at all.
    { pattern: /^list-(none|disc|decimal)$/ },
    { pattern: /^list-(inside|outside)$/ },

    // ── borders / radius / shadow / effects ───────────────────────────────
    { pattern: /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/ },
    { pattern: /^rounded-(t|r|b|l|tl|tr|br|bl)(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/ },
    { pattern: /^border(-0|-2|-4|-8)?$/ },
    { pattern: /^border-(t|r|b|l|x|y)(-0|-2|-4|-8)?$/ },
    { pattern: /^border-(solid|dashed|dotted|none)$/ },
    { pattern: /^shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?$/, variants: ['hover'] },
    { pattern: /^ring(-0|-1|-2|-4|-8)?$/, variants: ['focus', 'focus-visible'] },
    { pattern: /^opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/, variants: ['hover', 'disabled'] },

    // ── position / layering / overflow ────────────────────────────────────
    { pattern: /^(static|fixed|absolute|relative|sticky)$/, variants: RESPONSIVE },
    { pattern: /^(inset|inset-x|inset-y|top|right|bottom|left)-(0|px|1|2|3|4|6|8|auto|full|1\/2)$/ },
    { pattern: /^z-(0|10|20|30|40|50|auto)$/ },
    { pattern: /^overflow-(auto|hidden|clip|visible|scroll|x-auto|y-auto|x-hidden|y-hidden)$/ },
    { pattern: /^(object|bg)-(cover|contain|center|fill|none)$/ },

    // ── interactivity / misc ──────────────────────────────────────────────
    { pattern: /^(cursor-pointer|cursor-default|cursor-not-allowed|select-none|pointer-events-none|pointer-events-auto)$/ },
    { pattern: /^transition(-none|-all|-colors|-opacity|-shadow|-transform)?$/ },
    { pattern: /^duration-(75|100|150|200|300|500|700|1000)$/ },
    { pattern: /^(animate-none|animate-spin|animate-ping|animate-pulse|animate-bounce)$/ },
    { pattern: /^(sr-only|not-sr-only)$/ },
  ],
}
