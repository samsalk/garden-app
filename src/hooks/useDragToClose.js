import { useRef, useState } from "react";

/**
 * Attaches swipe-down-to-dismiss behaviour to a bottom-sheet modal.
 *
 * Usage:
 *   const { modalStyle, handleProps } = useDragToClose(onClose);
 *   <div className="modal" style={modalStyle}>
 *     <div className="modal-drag" {...handleProps} />
 *     …
 *
 * The modal slides down as the user drags. If they release past the
 * DISMISS_THRESHOLD the modal calls onClose(); otherwise it snaps back.
 */

const DISMISS_THRESHOLD = 80; // px

export function useDragToClose(onClose) {
  const [dragY,    setDragY]    = useState(0);
  const startY    = useRef(null);
  const dragging  = useRef(false);

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  }

  function onTouchMove(e) {
    if (!dragging.current || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);   // only allow downward drag
  }

  function onTouchEnd() {
    dragging.current = false;
    if (dragY >= DISMISS_THRESHOLD) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);              // snap back
    }
  }

  const modalStyle = {
    transform:  `translateY(${dragY}px)`,
    transition: dragging.current ? "none" : "transform .25s ease",
    // slight fade as you drag further down
    opacity:    1 - Math.min(dragY / 280, 0.4),
  };

  const handleProps = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    style: { touchAction: "none", cursor: "grab" },
  };

  return { modalStyle, handleProps };
}
