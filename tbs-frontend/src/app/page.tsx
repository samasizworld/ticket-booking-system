'use client';
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

/* =======================
   Types
======================= */

type TicketStatus = "available" | "reserved" | "sold";
type TicketType = "general" | "vip" | "front_row";

interface Ticket {
  id: string;
  name: string;
  type: TicketType;
  price: number;
  status: TicketStatus;
}

interface ReserveResponse {
  paymentToken: string;
  message?: string;
}

/* =======================
   Component
======================= */

export default function App() {
  const [ticketType, setTicketType] = useState<TicketType | "">("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [reserveError, setReserveError] = useState<string | null>(null);
  const [showReserveModal, setShowReserveModal] = useState<boolean>(false);

  useEffect(() => {
    fetchTickets();
  }, [ticketType]);

  /* =======================
     API Calls
  ======================= */

  async function fetchTickets(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/tickets${ticketType ? `?ticketType=${ticketType}` : ""}`
      );
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch {
      setMessage("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  function toggleTicketSelection(ticket: Ticket): void {
    if (ticket.status !== "available") return;

    setSelectedTickets((prev) => {
      const exists = prev.some((t) => t.id === ticket.id);
      return exists
        ? prev.filter((t) => t.id !== ticket.id)
        : [...prev, ticket];
    });
  }

  async function reserveTickets(): Promise<void> {
    if (selectedTickets.length === 0) return;

    setLoading(true);
    setReserveError(null);

    try {
      const res = await fetch(`${API_BASE}/tickets/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketIds: selectedTickets.map((t) => t.id),
        }),
      });

      const data: ReserveResponse = await res.json();

      if (!res.ok) {
        setReserveError(data.message || "Unable to reserve tickets");
        return;
      }

      setPaymentToken(data.paymentToken);
      setShowReserveModal(false);
      setMessage(`Reserved ${selectedTickets.length} ticket(s).`);
    } catch {
      setReserveError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment(
    status: "confirmed" | "cancelled"
  ): Promise<void> {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/tickets/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentToken,
          paymentStatus: status,
        }),
      });

      setPaymentToken(null);
      setSelectedTickets([]);
      fetchTickets();

      setMessage(
        status === "confirmed"
          ? "Payment successful"
          : "Payment cancelled"
      );
    } finally {
      setLoading(false);
    }
  }

  const totalPrice = selectedTickets.reduce(
    (sum, t) => sum + t.price,
    0
  );

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-slate-50 pb-24 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          🎟 Ticket Booking
        </h1>

        {/* Ticket Filter */}
        <div className="flex justify-center mb-6">
          <select
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500"
            value={ticketType}
            onChange={(e) =>
              setTicketType(e.target.value as TicketType | "")
            }
          >
            <option value="">All</option>
            <option value="general">General</option>
            <option value="vip">VIP</option>
            <option value="front_row">Front Row</option>
          </select>
        </div>

        {/* Ticket Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tickets.map((t) => {
            const isSelected = selectedTickets.some(
              (s) => s.id === t.id
            );

            return (
              <div
                key={t.id}
                onClick={() => toggleTicketSelection(t)}
                className={`
                  rounded-xl bg-white p-5 shadow-sm transition-all
                  hover:shadow-md cursor-pointer
                  ${t.status !== "available" ? "opacity-50 cursor-not-allowed" : ""}
                  ${isSelected ? "ring-2 ring-indigo-600" : ""}
                `}
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  {t.name}
                </h3>
                <p className="text-sm text-slate-500 capitalize">
                  {t.type}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  ${t.price}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Status: {t.status}
                </p>
              </div>
            );
          })}
        </div>

        {/* Toast */}
        {message && (
          <div className="fixed bottom-24 right-5 rounded-lg bg-slate-800 px-4 py-2 text-white shadow">
            {message}
            <button
              className="ml-3 opacity-70"
              onClick={() => setMessage("")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Sticky Bottom Bar */}
        {selectedTickets.length > 0 && !paymentToken && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white shadow-lg">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="text-sm text-slate-700">
                <span className="font-semibold">
                  {selectedTickets.length}
                </span>{" "}
                selected ·{" "}
                <span className="font-semibold">${totalPrice}</span>
              </div>

              <button
                onClick={() => setShowReserveModal(true)}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                Reserve Selected
              </button>
            </div>
          </div>
        )}

        {/* Reserve Modal */}
        {showReserveModal && !paymentToken && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="w-96 rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-xl font-semibold text-slate-800">
                Reserve Tickets
              </h2>

              <ul className="mb-3 max-h-40 overflow-auto text-sm text-slate-700">
                {selectedTickets.map((t) => (
                  <li key={t.id}>
                    {t.name} — ${t.price}
                  </li>
                ))}
              </ul>

              {reserveError && (
                <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                  ❗ {reserveError}
                </div>
              )}

              <div className="mb-4 font-semibold text-slate-900">
                Total: ${totalPrice}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  onClick={reserveTickets}
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Reserving..." : "Reserve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentToken && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="w-96 rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                Confirm Payment
              </h2>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => confirmPayment("cancelled")}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmPayment("confirmed")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
