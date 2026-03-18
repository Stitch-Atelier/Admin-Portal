import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FetchOrders } from "../../../services/requests";

const STATUS_FILTERS = ["all", "pending", "completed", "delivered", "cancelled"];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "completed": return "bg-green-100 text-green-700";
    case "delivered": return "bg-blue-100 text-blue-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const QueryHome = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [fetched, setFetched] = useState<Record<string, any[]>>({});

  const loadOrders = async (status: string) => {
    // Use cache if already fetched
    if (fetched[status]) {
      setOrders(fetched[status]);
      return;
    }
    setLoading(true);
    try {
      if (status === "all") {
        // Fetch all statuses in parallel
        const [pending, completed, delivered, cancelled] = await Promise.all([
          FetchOrders("pending"),
          FetchOrders("completed"),
          FetchOrders("delivered"),
          FetchOrders("cancelled"),
        ]);
        const all = [
          ...(pending.response || []),
          ...(completed.response || []),
          ...(delivered.response || []),
          ...(cancelled.response || []),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(all);
        setFetched((prev) => ({ ...prev, all }));
      } else {
        const { response } = await FetchOrders(status);
        const data = response || [];
        setOrders(data);
        setFetched((prev) => ({ ...prev, [status]: data }));
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders("all");
  }, []);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    loadOrders(status);
  };

  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalAmount || o.amountAfterDiscount || 0), 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Orders</h1>
          <p className="text-gray-600">Every order ever placed — filter by status</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/dashboard/order/${order.orderID}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono font-bold text-gray-800 text-lg">
                      {order.orderID}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(order.createdAt)}
                      {order.userId?.firstname && (
                        <span className="ml-2 text-gray-400">
                          · {order.userId.firstname} {order.userId.lastname}
                        </span>
                      )}
                      {order.userId?.mobile && (
                        <span className="ml-2 text-gray-400">
                          · {order.userId.mobile}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusBadgeClass(order.status)}`}>
                    {order.status === "delivered" ? "🎉 " : ""}{order.status}
                  </span>
                </div>

                {/* Dresses */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.dresses?.map((d: any, i: number) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {d.dressName} — {d.dressStatus}
                    </span>
                  ))}
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4 text-gray-500 text-xs">
                    <span>{order.dressCount} dress{order.dressCount > 1 ? "es" : ""}</span>
                    {order.couponCode && (
                      <span className="text-purple-600 font-mono">🎟️ {order.couponCode}</span>
                    )}
                    {order.extraCharges > 0 && (
                      <span>Extra: ₹{order.extraCharges}</span>
                    )}
                  </div>
                  <div className="text-right">
                    {(order.amountBeforeDiscount !== order.totalAmount && order.totalAmount > 0) && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{order.amountBeforeDiscount?.toLocaleString("en-IN")}
                      </p>
                    )}
                    <p className="font-bold text-gray-800">
                      ₹{(order.totalAmount || order.amountAfterDiscount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Summary */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {orders.length} order{orders.length > 1 ? "s" : ""}</span>
              <span className="font-semibold">
                Revenue (completed + delivered): ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryHome;