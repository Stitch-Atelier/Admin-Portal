import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FetchOrdersByUser,
  FetchUserPoints,
  GetMasterMeasurement,
} from "../../../services/requests";
import { service } from "../../../services/service";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "completed": return "bg-green-100 text-green-700";
    case "delivered": return "bg-blue-100 text-blue-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const MEASUREMENT_LABELS: Record<string, string> = {
  neck: "Neck", bust: "Bust", waist: "Waist", armHole: "Arm Hole",
  shoulderW: "Shoulder Width", armL: "Arm Length", hip: "Hip",
  thigh: "Thigh", rise: "Rise", inseam: "Inseam", outseam: "Outseam",
};

const searchUsers = async (query: string) => {
  const isNumeric = /^\d+$/.test(query.trim());
  const params = isNumeric ? { mobile: query.trim() } : { name: query.trim() };
  const response = await service.get("/users/search", { params });
  return response.data;
};

const StatCard = ({ label, value, sub, color = "blue" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
};

const UserSearchOrder = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [pointsData, setPointsData] = useState<any>(null);
  const [measurement, setMeasurement] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "measurements" | "coupons">("overview");

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) { toast.error("Enter at least 2 characters"); return; }
    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) toast.error("No users found");
    } catch { toast.error("Search failed. Try again."); }
    finally { setSearching(false); }
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user); setSearchResults([]); setSearchQuery(""); setActiveTab("overview"); setLoadingProfile(true);
    try {
      const [ordersRes, pointsRes, measurementRes] = await Promise.allSettled([
        FetchOrdersByUser(user._id),
        FetchUserPoints(user._id),
        GetMasterMeasurement(user._id),
      ]);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data || []);
      else setOrders([]);
      if (pointsRes.status === "fulfilled" && pointsRes.value.status === 200) setPointsData(pointsRes.value.data);
      else setPointsData(null);
      if (measurementRes.status === "fulfilled") setMeasurement(measurementRes.value.data?.data || null);
      else setMeasurement(null);
    } catch { toast.error("Failed to load profile"); }
    finally { setLoadingProfile(false); }
  };

  const totalSpent = orders.filter((o) => o.status === "delivered" || o.status === "completed")
    .reduce((sum, o) => sum + (o.totalAmount || o.amountAfterDiscount || 0), 0);

  const orderCounts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customer Lookup</h1>
        <p className="text-gray-500 mt-1">Search by mobile number or name to view full customer profile</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" className="input input-bordered flex-1 text-sm"
          placeholder="Search by mobile number or name..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        <button onClick={handleSearch} disabled={searching}
          className="btn bg-blue-600 text-white hover:bg-blue-700 border-none">
          {searching ? <span className="loading loading-spinner loading-sm" /> : "Search"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-6 overflow-hidden">
          <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b">
            {searchResults.length} result{searchResults.length > 1 ? "s" : ""} found
          </p>
          {searchResults.map((user) => (
            <button key={user._id} onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                {user.firstname?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{user.firstname} {user.lastname}</p>
                <p className="text-sm text-gray-500">{user.mobile}</p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p className="text-purple-600 font-semibold">{user.stitchPts || 0} pts</p>
                <p>Since {formatDate(user.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedUser && searchResults.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium">Search for a customer</p>
          <p className="text-sm mt-1">Enter mobile number or name above to view their full profile</p>
        </div>
      )}

      {loadingProfile && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      )}

      {selectedUser && !loadingProfile && (
        <div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {selectedUser.firstname?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.firstname} {selectedUser.lastname}</h2>
                <p className="text-gray-500 text-sm">{selectedUser.mobile}</p>
                <p className="text-gray-400 text-xs mt-1">Member since {formatDate(selectedUser.createdAt)}</p>
              </div>
              <button onClick={() => { setSelectedUser(null); setOrders([]); setPointsData(null); setMeasurement(null); }}
                className="btn btn-sm btn-ghost text-gray-400">✕ Clear</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <StatCard label="Stitch Points" value={`${pointsData?.stitchPts ?? selectedUser.stitchPts ?? 0} pts`}
                sub={`${pointsData?.pointsToNextCoupon ?? "—"} pts to next coupon`} color="purple" />
              <StatCard label="Total Spent" value={`\u20B9${totalSpent.toLocaleString("en-IN")}`}
                sub="Completed + Delivered" color="green" />
              <StatCard label="Total Orders" value={orderCounts.total} sub={`${orderCounts.pending} pending`} color="blue" />
              <StatCard label="Active Coupons" value={pointsData?.activeCoupons?.length ?? 0} sub="Available to use" color="amber" />
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            {([
              { key: "overview", label: "Overview" },
              { key: "orders", label: `Orders (${orderCounts.total})` },
              { key: "measurements", label: "Measurements" },
              { key: "coupons", label: `Coupons (${pointsData?.activeCoupons?.length ?? 0})` },
            ] as const).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-all ${
                  activeTab === tab.key ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                }`}>{tab.label}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Order Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Pending", count: orderCounts.pending, color: "text-yellow-600 bg-yellow-50" },
                    { label: "Completed", count: orderCounts.completed, color: "text-green-600 bg-green-50" },
                    { label: "Delivered", count: orderCounts.delivered, color: "text-blue-600 bg-blue-50" },
                    { label: "Cancelled", count: orderCounts.cancelled, color: "text-red-600 bg-red-50" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                      <p className="text-3xl font-bold">{s.count}</p>
                      <p className="text-xs font-medium mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-blue-600 hover:underline">View all →</button>
                </div>
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} onClick={() => navigate(`/dashboard/order/${order.orderID}`)}
                    className="flex justify-between items-center py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-800">{order.orderID}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)} · {order.dressCount} dress{order.dressCount > 1 ? "es" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass(order.status)}`}>{order.status}</span>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        \u20B9{(order.totalAmount || order.amountAfterDiscount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Points Progress</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{pointsData?.stitchPts ?? selectedUser.stitchPts ?? 0} pts</span>
                  <span>600 pts (next coupon)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (((pointsData?.stitchPts ?? selectedUser.stitchPts) || 0) / 600) * 100)}%` }} />
                </div>
                {pointsData?.canGenerateCoupon && (
                  <p className="text-xs text-green-600 font-medium mt-2">✅ Customer can generate a coupon right now!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><p className="text-lg font-medium">No orders found</p></div>
              ) : orders.map((order) => (
                <div key={order._id} onClick={() => navigate(`/dashboard/order/${order.orderID}`)}
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono font-bold text-gray-800">{order.orderID}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusBadgeClass(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.dresses?.map((d: any, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{d.dressName}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-500 text-xs">
                      {order.dressCount} dress{order.dressCount > 1 ? "es" : ""}
                      {order.couponCode && <span className="ml-2 text-purple-600 font-mono">🎟️ {order.couponCode}</span>}
                    </div>
                    <p className="font-bold text-gray-800">\u20B9{(order.totalAmount || order.amountAfterDiscount || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "measurements" && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Master Measurements</h3>
              {!measurement ? (
                <div className="text-center py-10 text-gray-400"><p>No master measurements on file for this customer</p></div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Top</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
                    {["neck", "bust", "waist", "armHole", "shoulderW", "armL"].map((key) =>
                      measurement[key] ? (
                        <div key={key} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs text-blue-500 font-medium mb-1">{MEASUREMENT_LABELS[key]}</p>
                          <p className="font-bold text-gray-800">{measurement[key]?.val || "—"}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Bottom</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {["hip", "thigh", "rise", "inseam", "outseam"].map((key) =>
                      measurement[key] ? (
                        <div key={key} className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                          <p className="text-xs text-indigo-500 font-medium mb-1">{MEASUREMENT_LABELS[key]}</p>
                          <p className="font-bold text-gray-800">{measurement[key]?.val || "—"}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "coupons" && (
            <div className="space-y-3">
              {!pointsData?.activeCoupons?.length ? (
                <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
                  <p className="text-lg font-medium">No active coupons</p>
                  <p className="text-sm mt-1">
                    Customer has {pointsData?.stitchPts ?? 0} pts —{" "}
                    {(pointsData?.pointsToNextCoupon ?? 600) > 0
                      ? `needs ${pointsData?.pointsToNextCoupon ?? 600} more pts to generate one`
                      : "can generate a coupon now"}
                  </p>
                </div>
              ) : pointsData.activeCoupons.map((coupon: any) => (
                <div key={coupon._id} className="bg-white border border-purple-200 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-bold text-purple-700 text-lg">{coupon.code}</p>
                      <p className="text-sm text-gray-500 mt-1">Expires: {formatDate(coupon.expiresAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">\u20B9{coupon.remainingAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coupon.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{coupon.status === "partially_used" ? "Partially Used" : "Active"}</span>
                    </div>
                  </div>
                  {coupon.status === "partially_used" && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Used: \u20B9{coupon.discountAmount - coupon.remainingAmount}</span>
                        <span>Remaining: \u20B9{coupon.remainingAmount}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full"
                          style={{ width: `${(coupon.remainingAmount / coupon.discountAmount) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchOrder;