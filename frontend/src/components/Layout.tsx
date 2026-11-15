import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Aurora from './Aurora'
import BackendStatus from './BackendStatus'
import { ChatIcon, DocumentIcon, HistoryIcon, LogoutIcon, SparkleIcon, TicketIcon } from './icons'
import ThemeToggle from './ThemeToggle'

// A component is just a function that returns what to draw (written in JSX, which looks like HTML).
export default function Layout() {
  // useLocation tells us the current URL. The tickets table needs more room than the other pages,
  // so on /tickets we allow a wider column. The chat page (/) manages its OWN scrolling (see below).
  const { pathname } = useLocation()
  const wide = pathname.startsWith('/tickets')
  const isChat = pathname === '/'

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAgent = user?.role === 'agent'

  // The sidebar links. Keeping them in a list means adding a page later = adding one line here.
  // The same pages mean different things per role, so the labels change too.
  const links = [
    { to: '/', label: 'Chat', icon: ChatIcon, end: true }, // "end" so "/" is not highlighted on every page
    { to: '/history', label: 'History', icon: HistoryIcon },
    { to: '/tickets', label: isAgent ? 'All tickets' : 'My tickets', icon: TicketIcon },
    { to: '/upload', label: isAgent ? 'Company policies' : 'Documents', icon: DocumentIcon },
  ]

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    // Tailwind classes, read left to right:
    //   relative isolate -> a positioning context for the glowing background, and its own stacking layer
    //   h-screen         -> exactly as tall as the browser window
    //   flex-col         -> stack children vertically (phones)
    //   md:flex-row      -> from medium screens (768px) up, put them side by side instead
    //   overflow-hidden  -> the window itself never scrolls; the page area below does
    <div className="relative isolate flex h-screen flex-col overflow-hidden bg-canvas text-ink md:flex-row">
      <Aurora />

      {/* "glass" is our own utility (index.css): translucent + blurred, so the glow shows through it. */}
      <aside className="glass z-10 flex w-full flex-col border-b border-line md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-5 py-4">
          {/* the logo mark: a solid navy tile */}
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-900 dark:bg-blue-900 text-white shadow-sm">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-brand text-lg font-bold leading-tight tracking-tight">AtYourService</h1>
            <p className="text-xs text-ink-soft">AI-powered IT support</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {links.map(({ to, label, icon: LinkIcon, end }) => (
            // NavLink is a link that knows whether it points at the current page ("isActive"),
            // so we can highlight it. className can be a function that receives that information.
            <NavLink
              key={to} // React needs a unique "key" for each item of a list
              to={to}
              end={end}
              className={({ isActive }) =>
                // "group" lets the icon react to hovering the whole link (group-hover:...).
                // The coloured bar on the left is a ::before pseudo-element (before:...), only drawn when active.
                `group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "bg-blue-900/5 text-blue-900 ring-1 ring-inset ring-blue-900/10 before:absolute before:-left-3 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-blue-900 before:content-[''] dark:before:bg-blue-400 dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-400/20"
                    : 'text-ink-soft hover:translate-x-0.5 hover:bg-surface-3 hover:text-ink'
                }`
              }
            >
              <LinkIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* mt-auto pushes this block to the bottom of the sidebar */}
        {/* On phones this is ONE compact row (user, logout, theme switch) to save height; from md up it becomes
            two rows: the user on top, the server status and theme switch below. */}
        <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 md:mt-auto md:block md:space-y-3 md:p-4">
          {user && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-900 dark:bg-blue-900 text-xs font-bold text-white ring-2 ring-surface">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-ink-soft">{isAgent ? 'IT support agent' : 'Employee'}</p>
              </div>
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="shrink-0 rounded-lg p-2 text-ink-soft outline-none transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-red-400"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="flex shrink-0 items-center justify-between gap-2">
            <div className="hidden md:block">
              <BackendStatus />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Outlet = "the current page goes here" (ChatPage, HistoryPage... chosen by the URL). */}
      {/* Most pages scroll inside <main>. The chat page does not: it is exactly as tall as <main> (h-full)
          and scrolls only its own message list, so the input bar can never jump around. */}
      <main className={`min-h-0 flex-1 ${isChat ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div
          className={`mx-auto flex w-full flex-col p-4 md:p-8 ${isChat ? 'h-full' : 'min-h-full'} ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}
        >
          {/* key={pathname}: a new page is a new element, so the entrance animation replays on every navigation. */}
          <div key={pathname} className="flex min-h-0 flex-1 flex-col motion-safe:animate-fade-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
