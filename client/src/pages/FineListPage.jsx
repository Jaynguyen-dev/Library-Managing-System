import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function FineListPage() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = async (isPaid) => {
    setLoading(true);
    try {
      const params = isPaid !== undefined ? { is_paid: isPaid } : {};
      const { data } = await api.get("/api/fines", { params });
      setFines(data.data.fines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePay = async (id) => {
    try {
      await api.patch(`/api/fines/${id}/pay`);
      fetchFines();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-display-md mb-6">Fines</h1>
      {loading ? (
        <div className="text-center py-12 text-ink-muted-48">Loading...</div>
      ) : fines.length === 0 ? (
        <div className="text-center py-12 text-ink-muted-48">No fines found.</div>
      ) : (
        <div className="grid gap-3">
          {fines.map((f) => (
            <div key={f.id} className="bg-white rounded-lg p-5 border border-hairline flex items-center justify-between">
              <div>
                <p className="text-body-strong">{f.user?.full_name}</p>
                <p className="text-caption text-ink-muted-48">{formatCurrency(f.amount)} · {f.reason} · {formatDate(f.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-caption px-3 py-1 rounded-pill ${f.is_paid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {f.is_paid ? "Paid" : "Unpaid"}
                </span>
                {!f.is_paid && (
                  <button onClick={() => handlePay(f.id)} className="bg-primary text-white rounded-pill px-4 py-1.5 text-caption hover:bg-primary-focus transition active:scale-[0.98]">
                    Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
