import type { ReactNode } from 'react'
import Aurora from './Aurora'
import { SparkleIcon } from './icons'
import ThemeToggle from './ThemeToggle'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode // the form
  footer: ReactNode // the "no account yet? / already have one?" link
}

// The centred card both the login and the register page use.
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4 text-ink">
      <Aurora />
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="w-full max-w-sm motion-safe:animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-blue-900 dark:bg-blue-900 text-white shadow-sm motion-safe:animate-pop-in">
            <SparkleIcon className="h-7 w-7" />
          </span>
          <h1 className="text-brand text-3xl font-bold tracking-tight">AtYourService</h1>
          <p className="mt-1 text-sm text-ink-soft">AI-powered IT support</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mb-5 mt-1 text-sm text-ink-soft">{subtitle}</p>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-ink-soft">{footer}</p>
      </div>
    </div>
  )
}
