import type { SVGProps } from 'react'

// Tiny inline SVG icons (no icon library needed). They all share the same base: a 24x24 drawing board,
// outlined strokes that use the CURRENT TEXT COLOUR (stroke="currentColor"), so a Tailwind text-* class
// colours the icon and dark mode just works. Pass className="h-5 w-5" to size one.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export const ChatIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.5L4 21l1.4-3.7C4.2 15.9 3 14.1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
    <path d="M8 11h8M8 14.5h5" />
  </Icon>
)

export const HistoryIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const TicketIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2.5 2.5 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-6z" />
    <path d="M14 5v2m0 3v2m0 3v2" />
  </Icon>
)

export const DocumentIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 3h8l5 5v13H6V3z" />
    <path d="M14 3v5h5M9.5 13h6M9.5 17h6" />
  </Icon>
)

export const SunIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)

export const MoonIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
)

export const SparkleIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 16v4M17 18h4" />
  </Icon>
)

export const SendIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
)

export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M16 8l4 4-4 4M20 12H9" />
  </Icon>
)

export const ImageIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M21 16l-5-5-8 8" />
  </Icon>
)
