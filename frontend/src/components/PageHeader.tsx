// PROPS are a component's inputs, like function parameters. Here we describe their shape.
// "description?" with a question mark means that one is optional.
type PageHeaderProps = {
  title: string
  description?: string
}

// Every page starts with the same title block, so we write it once and reuse it:
//   <PageHeader title="History" description="Your past conversations" />
export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {/* In JSX, { ... } runs JavaScript. "description && ..." draws the paragraph only if a description was given. */}
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </header>
  )
}
