import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";
import AddCreditsModal from "../components/AddCreditsModal";

function typeBadge(type) {
  const map = {
    topup: { cls: "badge-green", label: "Top-up" },
    deduction: { cls: "badge-red", label: "Payment" },
    refund: { cls: "badge-amber", label: "Refund" },
  };
  const m = map[type] || { cls: "badge-gray", label: type };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [fines, setFines] = useState([]);

  const fetchWallet = useCallback(() => {
    api.get("/api/wallet")
      .then(({ data }) => setWallet(data.data.wallet))
      .catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, []);

  const fetchFines = useCallback(() => {
    api.get("/api/fines/my", { params: { page: 1, limit: 100 } })
      .then(({ data }) => setFines(data.data.fines || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchFines();
  }, [fetchWallet, fetchFines]);

  const handleCreditsAdded = () => {
    fetchWallet();
  };

  const totalUnpaidFines = fines.filter((f) => !f.is_paid).reduce((s, f) => s + f.amount, 0);

  const handlePayFine = async (fineId) => {
    try {
      await api.patch(`/api/fines/${fineId}/self-pay`);
      toast.success("Fine paid from wallet");
      fetchWallet();
      fetchFines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="stat-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card" style={{ padding: "18px" }}>
              <div className="stat-label">&nbsp;</div>
              <div className="stat-val" style={{ background: "#E8E8ED", height: "28px", width: "80px", borderRadius: "4px" }}>&nbsp;</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">My Wallet</span>
        <button className="btn btn-primary" onClick={() => setShowAddCredits(true)}>
          <i className="ti ti-plus" style={{ marginRight: "4px" }}></i>Add Credits
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: "16px" }}>
        <div className="stat-card">
          <div className="stat-label">Current Balance</div>
          <div className="stat-val" style={{ color: "var(--sf-accent)" }}>
            {formatCurrency(wallet?.balance || 0)}
          </div>
          <div className="stat-sub">Available to use</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid Fines</div>
          <div className="stat-val" style={{ color: totalUnpaidFines > 0 ? "var(--sf-red)" : "var(--sf-green)" }}>
            {totalUnpaidFines > 0 ? formatCurrency(totalUnpaidFines) : "0 ₫"}
          </div>
          <div className="stat-sub">{fines.filter((f) => !f.is_paid).length} outstanding</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-val">{wallet?.transactions?.length || 0}</div>
          <div className="stat-sub">Total transactions</div>
        </div>
      </div>

      {totalUnpaidFines > 0 && (
        <div className="card" style={{ marginBottom: "16px", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: "4px" }}>Unpaid Fines</div>
              <div style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>
                {totalUnpaidFines > (wallet?.balance || 0)
                  ? "Insufficient balance to pay all fines"
                  : "Sufficient balance to pay all fines"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--sf-red)" }}>{formatCurrency(totalUnpaidFines)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header" style={{ marginTop: "6px" }}>
        <span className="section-title">Unpaid Fines</span>
      </div>

      {fines.filter((f) => !f.is_paid).length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--sf-text-2)", fontSize: "13px" }}>
          No unpaid fines. All clear!
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "16px" }}>
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Amount</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fines.filter((f) => !f.is_paid).map((f) => {
                const bookTitle = f.borrow_record?.items?.[0]?.book?.title || f.reason || "-";
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 500 }}>{bookTitle}</td>
                    <td>{formatCurrency(f.amount)}</td>
                    <td style={{ color: "var(--sf-text-2)" }}>{formatDate(f.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handlePayFine(f.id)}
                        disabled={(wallet?.balance || 0) < f.amount}
                      >
                        {(wallet?.balance || 0) >= f.amount ? "Pay from Wallet" : "Insufficient"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Transaction History</span>
      </div>

      {(!wallet?.transactions || wallet.transactions.length === 0) ? (
        <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--sf-text-2)", fontSize: "13px" }}>
          No transactions yet.
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{typeBadge(t.type)}</td>
                  <td style={{ fontWeight: 500, color: t.amount > 0 ? "var(--sf-green)" : "var(--sf-red)" }}>
                    {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>
                    {t.payment_method ? t.payment_method.charAt(0).toUpperCase() + t.payment_method.slice(1) : "—"}
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>{t.description || "—"}</td>
                  <td style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddCredits && (
        <AddCreditsModal
          onClose={() => setShowAddCredits(false)}
          onSuccess={handleCreditsAdded}
        />
      )}
    </div>
  );
}
