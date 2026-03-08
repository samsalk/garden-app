/**
 * BottomSheet — the single source of truth for all modal chrome.
 *
 * Provides:
 *  - Semi-transparent overlay that closes the sheet on click
 *  - White modal panel (slides up from bottom on mobile, centered on desktop)
 *  - ✕ close button in the top-right corner
 *
 * Usage:
 *   <BottomSheet onClose={onClose}>
 *     <div className="modal-title">…</div>
 *     … content …
 *   </BottomSheet>
 */
export function BottomSheet({ onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="bs-close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}
