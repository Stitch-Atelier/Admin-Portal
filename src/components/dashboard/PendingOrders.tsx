import { useEffect, useState } from "react";
import { FetchPendingOrders } from "../../services/requests";

const PendingOrders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const GetPendingOrders = async () => {
    setLoading(true);
    const res = await FetchPendingOrders();

    if (res?.status === 200 && Array.isArray(res.response)) {
      setOrders(res?.response);
    } else {
      setOrders([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    GetPendingOrders();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Latest Pending Orders</h2>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 shadow">
        <table className="table table-zebra w-full">
          {/* head */}
          <thead className="bg-base-200">
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Dress Count</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No pending orders found
                </td>
              </tr>
            ) : (
              orders.map((order: any, index: number) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td className="font-medium">{order.orderID}</td>
                  <td>{order.userId?.name || "—"}</td>
                  <td>{order.userId?.phone || "—"}</td>
                  <td>{order.dressCount}</td>
                  <td>
                    {order.amountAfterDiscount ?? order.amountBeforeDiscount}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "pending"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingOrders;
