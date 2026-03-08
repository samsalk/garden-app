import { Sidebar } from "./Sidebar";

export function MobileSidebar({ show, onClose, ...sidebarProps }) {
  if (!show) return null;
  return (
    <div className="mob-sb-wrap">
      <div className="mob-sb-bg" onClick={onClose} />
      <div className="mob-sb-panel">
        <Sidebar {...sidebarProps} />
      </div>
    </div>
  );
}
