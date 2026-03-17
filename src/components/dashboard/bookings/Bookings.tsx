import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FetchNewBookings,
  FetchBookingHistory,
  UpdateBookingStatus,
} from "../../../services/requests";

type BookingItem = {
  _id: string;
  userId: string;
  userMobile: string;
  orderDetails: {
    items: {
      id: string;
      name: string;
      garment: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
    totalItems: number;
    totalAmount: number;
  };
  address: {
    type: string;
    addressText: string;
  };
  paymentMethod: string;
  status: string;
  createdAt: string;
  customRequest?: string | null;
};

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Single Booking Card ──
const BookingCard = ({
  booking,
  showActions,
  onConfirm,
  onCancel,
  confirming,
}: {
  booking: BookingItem;
  showActions: boolean;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  confirming: string | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(booking.status)}`}
              >
                {booking.status}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(booking.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Mobile:</span>{" "}
                {booking.userMobile}
              </p>
              <p>
                <span className="font-medium">Items:</span>{" "}
                {booking.orderDetails.totalItems}
              </p>
              <p>
                <span className="font-medium">Base Amount:</span>{" "}
                <span className="text-green-700 font-semibold">
                  ₹{booking.orderDetails.totalAmount}
                </span>
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {booking.paymentMethod}
              </p>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Address:</span>{" "}
              {booking.address.addressText}
            </div>

            {booking.customRequest && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <span className="font-medium">Custom Request:</span>{" "}
                {booking.customRequest}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          {showActions && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => onConfirm?.(booking._id)}
                disabled={confirming === booking._id}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {confirming === booking._id ? "Confirming..." : "✓ Confirm"}
              </button>
              <button
                onClick={() => onCancel?.(booking._id)}
                disabled={confirming === booking._id}
                className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition disabled:opacity-50 font-medium"
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Toggle Items ── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-blue-600 hover:underline font-medium"
        >
          {expanded ? "▲ Hide items" : "▼ View items"}
        </button>
      </div>

      {/* ── Expanded Items ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-2">
            Items Requested
          </h4>
          <div className="space-y-2">
            {booking.orderDetails.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.garment} · Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-700">₹{item.subtotal}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end text-sm font-semibold text-gray-800">
            Base Total: ₹{booking.orderDetails.totalAmount}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            * Final price determined after representative visit
          </p>
        </div>
      )}
    </div>
  );
};

// ── Main Bookings Page ──
const Bookings = () => {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [newBookings, setNewBookings] = useState<BookingItem[]>([]);
  const [historyBookings, setHistoryBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const loadNew = useCallback(async () => {
    const { status, data } = await FetchNewBookings();
    if (status === 200) setNewBookings(data);
  }, []);

  const loadHistory = useCallback(async () => {
    const { status, data } = await FetchBookingHistory();
    if (status === 200) setHistoryBookings(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadNew(), loadHistory()]);
    setLoading(false);
  }, [loadNew, loadHistory]);

  useEffect(() => {
    loadAll();
    // ── Poll every 30s for new bookings ──
    const interval = setInterval(loadNew, 30000);
    return () => clearInterval(interval);
  }, [loadAll, loadNew]);

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    try {
      const { status } = await UpdateBookingStatus(id, "confirmed");
      if (status === 200) {
        toast.success("Booking confirmed! Customer has been notified.");
        await loadAll();
      } else {
        toast.error("Failed to confirm booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConfirming(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    setConfirming(id);
    try {
      const { status } = await UpdateBookingStatus(id, "cancelled");
      if (status === 200) {
        toast.success("Booking cancelled. Customer has been notified.");
        await loadAll();
      } else {
        toast.error("Failed to cancel booking");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 mt-1">
          Manage customer booking requests and history
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-5 py-3 text-sm font-semibold rounded-t-lg transition-all relative ${
            activeTab === "new"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          New Bookings
          {newBookings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {newBookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-3 text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === "history"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Bookings
          {historyBookings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
              {historyBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : activeTab === "new" ? (
        <div className="space-y-4">
          {newBookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-lg font-medium">No new bookings</p>
              <p className="text-sm mt-1">
                New booking requests from customers will appear here
              </p>
            </div>
          ) : (
            newBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                showActions={true}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirming={confirming}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {historyBookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-lg font-medium">No booking history yet</p>
              <p className="text-sm mt-1">
                Confirmed and cancelled bookings will appear here
              </p>
            </div>
          ) : (
            historyBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                showActions={false}
                confirming={confirming}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;