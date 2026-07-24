import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from 'autoblogr'
import { useForm } from 'react-hook-form'

// `Form` is react-hook-form's FormProvider, so every cell builds a real
// useForm() and threads its `control` into FormField.
export const TextField = () => {
  const form = useForm({
    defaultValues: { title: 'Ten SEO Mistakes Quietly Costing You Traffic' },
  })

  return (
    <Form {...form}>
      <form className="w-80">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post title</FormLabel>
              <FormControl>
                <Input placeholder="Give this post a headline" {...field} />
              </FormControl>
              <FormDescription>Used as the H1 and the SEO title tag.</FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

// Hoisted so the object identity is stable — useForm re-applies `errors` on
// every identity change, and an inline literal would loop.
const SLUG_ERRORS = {
  slug: { type: 'pattern', message: 'Use lowercase letters, numbers and hyphens only.' },
}

export const WithValidationError = () => {
  const form = useForm({
    defaultValues: { slug: 'Ten SEO Mistakes!' },
    errors: SLUG_ERRORS,
    shouldFocusError: false,
  })

  return (
    <Form {...form}>
      <form className="w-80">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Appended to marketing-site.com/blog/.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export const SelectField = () => {
  const form = useForm({ defaultValues: { tone: 'conversational' } })

  return (
    <Form {...form}>
      <form className="w-80">
        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Writing tone</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Applied to every draft generated for this site.</FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export const SwitchField = () => {
  const form = useForm({ defaultValues: { autoPublish: true } })

  return (
    <Form {...form}>
      <form className="w-80">
        <FormField
          control={form.control}
          name="autoPublish"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
              <div className="space-y-0.5 pr-4">
                <FormLabel>Auto-publish</FormLabel>
                <FormDescription>Push approved drafts to WordPress without review.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
