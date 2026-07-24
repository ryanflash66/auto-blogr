## How to build with AutoBlogr UI

This is a **shadcn/ui (new-york) library on Radix primitives**, styled with **Tailwind utility classes**
reading **semantic CSS-variable tokens**. Every component is on `window.AutoBlogr`. Compose the primitives —
don't rebuild them, and don't restyle them with raw palette colours.

### Setup and wrapping

There is **no global theme provider** — tokens are plain CSS variables on `:root`, so components are styled
the moment `styles.css` is loaded. Nothing needs wrapping by default. Four exceptions, each of which throws
or renders nothing without its provider:

| Provider | Required by |
|---|---|
| `SidebarProvider` | every `Sidebar*` component (reads `useSidebar()`) |
| `TooltipProvider` | `Tooltip` |
| `ToastProvider` + `ToastViewport` | `Toast` (or render `Toaster` once near the app root and push via the `useToast` hook) |
| `Form` (react-hook-form `FormProvider`) | `FormField` / `FormControl` / `FormMessage` |

Typography is the **system font stack** (Tailwind's `ui-sans-serif, system-ui, …`) — there is no webfont,
and **no serif**: `font-serif` is not in this stylesheet. Use `font-sans` (default) and `font-mono`.

### The styling idiom — use these names

Style with Tailwind utilities bound to **semantic tokens**, never `bg-gray-100`/`text-slate-600`. Each colour
below works as `bg-*`, `text-*`, `border-*`, and `ring-*`, and pairs with its `-foreground` for content on top:

| Family | Names |
|---|---|
| Surfaces | `background`, `card`, `popover`, `muted`, `accent`, `sidebar` |
| Emphasis | `primary`, `secondary`, `destructive` |
| Lines / focus | `border`, `input` (form borders), `ring` (focus rings) |
| Charts | `chart-1` … `chart-5` — in Recharts pass `hsl(var(--chart-1))` |

So: `bg-card text-card-foreground`, `bg-primary text-primary-foreground`, `text-muted-foreground`,
`border-input`, `focus-visible:ring-ring`, `bg-destructive text-destructive-foreground`.
Opacity modifiers work (`bg-primary/90`, `hover:bg-accent`).

**Radius** comes from `--radius` (0.5rem): `rounded-lg` = `--radius`, `rounded-md` = −2px, `rounded-sm` = −4px.
Prefer these over `rounded-[6px]`.

**Dark mode** is class-based: put `class="dark"` on an ancestor and every token flips. Don't hand-write
`dark:` colour overrides — the tokens already handle it.

**Layout is yours**: normal Tailwind (`flex`, `grid grid-cols-3`, `gap-6`, `max-w-2xl`, `md:flex-row`,
`space-y-4`, `divide-y`) is available, including responsive/`hover:`/`focus-visible:`/`dark:` variants.
**Avoid arbitrary values** (`w-[473px]`, `text-[13px]`) — they are not in this stylesheet and render unstyled.

### Where the truth lives

- `_ds/<folder>/styles.css` → imports `_ds_bundle.css`: every token definition and component class.
- `components/<group>/<Name>/<Name>.d.ts` — the real prop contract (hand-written from source; enums are exact).
- `components/<group>/<Name>/<Name>.prompt.md` — what the component is and how to compose it.
  Groups: `forms`, `overlays`, `navigation`, `data-display`, `feedback`, `layout`.

Read the `.d.ts` before guessing a prop. A few carry **caveats** — they are real: `Slider` renders one thumb
(no ranges) and its `disabled` has no visual effect; `Checkbox` has no distinct indeterminate state.

### Idiomatic example

```jsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } = window.AutoBlogr

<div className="grid gap-6 md:grid-cols-2">
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Ten SEO mistakes to avoid</CardTitle>
          <CardDescription>Draft · 1,800 words</CardDescription>
        </div>
        <Badge variant="secondary">Ready</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">Generated from your saved idea “SEO audit checklist”.</p>
    </CardContent>
    <CardFooter className="gap-2">
      <Button>Publish</Button>
      <Button variant="outline">Edit draft</Button>
    </CardFooter>
  </Card>
</div>
```

Note the split: **library components** carry the look (`Card`, `Button variant="outline"`, `Badge`), and the
**layout glue** is plain Tailwind on tokens (`grid gap-6 md:grid-cols-2`, `text-sm text-muted-foreground`).
Use `asChild` to keep a component's styling on a different element (e.g. `<Button asChild><a …/></Button>`).
