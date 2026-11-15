// A very faint dot pattern behind the whole app (no colour blobs). Purely decorative, so it is hidden from
// screen readers (aria-hidden), ignores the mouse (pointer-events-none) and sits behind everything (-z-10).
// The pattern is drawn in CSS (the "dot-grid" utility in index.css) and faded out towards the edges with a mask.
export default function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
    </div>
  )
}
