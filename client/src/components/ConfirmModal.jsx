import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, icon, onConfirm, onCancel, danger }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    if (overlayRef.current && modalRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { opacity: 0, scale: 0.92, y: 20 });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25 });
      gsap.to(modalRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" });
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={modalRef}
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-header">
              <h3>
                <i className={icon || "ti ti-alert-triangle"} style={{ marginRight: 8, color: danger ? "var(--sf-red)" : "var(--sf-amber)" }}></i>
                {title || "Confirm"}
              </h3>
              <motion.button className="icon-btn" onClick={onCancel} aria-label="Close" whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <i className="ti ti-x"></i>
              </motion.button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: 14, color: "var(--sf-text-2)", lineHeight: 1.5 }}>
                {message || "Are you sure?"}
              </p>
            </div>
            <div className="modal-footer">
              <motion.button ref={cancelRef} className="btn btn-ghost" onClick={onCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {cancelLabel || "Cancel"}
              </motion.button>
              <motion.button
                className="btn"
                onClick={onConfirm}
                style={danger ? { background: "var(--sf-red)", color: "#fff", border: "none" } : undefined}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {confirmLabel || "Confirm"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
