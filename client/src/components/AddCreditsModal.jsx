import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", icon: "ti ti-credit-card" },
  { id: "mastercard", label: "Mastercard", icon: "ti ti-credit-card" },
  { id: "momo", label: "MoMo", icon: "ti ti-device-mobile" },
  { id: "banking", label: "Online Banking", icon: "ti ti-building-bank" },
];

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

export default function AddCreditsModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [method, setMethod] = useState("momo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const finalAmount = useCustom ? (parseInt(customAmount, 10) || 0) : amount;

  const handleSubmit = async () => {
    if (finalAmount < 10000) {
      setError("Minimum amount is 10,000 VND");
      return;
    }
    if (finalAmount > 100000000) {
      setError("Maximum amount is 100,000,000 VND");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/wallet/add", {
        amount: finalAmount,
        payment_method: method,
      });
      toast.success(`Added ${formatCurrency(finalAmount)} to your wallet`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add credits");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Add credits"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <h3>Add Credits</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ background: "#FFF0EF", color: "#991B1B", fontSize: "13px", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>
          )}

          <div className="form-row">
            <label className="form-label">Select Amount</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`btn ${!useCustom && amount === a ? "btn-primary" : "btn-ghost"}`}
                  style={{ fontSize: "13px", padding: "6px 14px" }}
                  onClick={() => { setAmount(a); setUseCustom(false); }}
                >
                  {formatCurrency(a)}
                </button>
              ))}
              <button
                type="button"
                className={`btn ${useCustom ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: "13px", padding: "6px 14px" }}
                onClick={() => setUseCustom(true)}
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <input
                type="number"
                className="form-input"
                placeholder="Enter amount (VND)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="10000"
                style={{ marginTop: "4px" }}
              />
            )}
          </div>

          <div className="form-row">
            <label className="form-label">Payment Method</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  className={`btn ${method === pm.id ? "btn-primary" : "btn-ghost"}`}
                  style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "10px", fontSize: "13px" }}
                  onClick={() => setMethod(pm.id)}
                >
                  <i className={pm.icon}></i>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "16px", padding: "12px 16px", background: "var(--sf-bg-2)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--sf-accent)" }}>
              {formatCurrency(finalAmount)}
            </span>
          </div>

          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#FFF9ED", borderRadius: "8px", fontSize: "12px", color: "#92400E" }}>
            <i className="ti ti-info-circle" style={{ marginRight: "6px" }}></i>
            Demo mode: Payment is simulated. No real transaction will be processed.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || finalAmount < 10000}>
            {submitting ? "Processing…" : `Add ${formatCurrency(finalAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
