import { useState } from "react";
import UserSelector from "./UserSelector";
import { FetchOrdersByUser } from "../../../services/requests";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserOrderSearch = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserSelect = async (user: any) => {
    if (!user || !user._id) {
      toast.error("Invalid user selected.");
      return;
    }

    setSelectedUser(user);
    setOrders([]);
    setLoading(true);

    try {
      const { status, data } = await FetchOrdersByUser(user._id);

      if (status === 200 && Array.isArray(data) && data.length > 0) {
        setOrders(data);
        toast.success("Orders loaded successfully!");
      } else {
        setOrders([]);
        toast.error("No orders found for this user.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (orderId: string) => {
    navigate(`/dashboard/order/${orderId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        🔍 Search Orders by User
      </h2>

      {/* Search User */}
      <UserSelector onSelect={handleUserSelect} />

      {/* Selected User Info */}
      {selectedUser && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            👤 Selected User
          </h3>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {selectedUser.firstname || "N/A"}
            </p>
            <p>
              <span className="font-medium">Mobile:</span>{" "}
              {selectedUser.mobile || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Orders Section */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order: any) => (
              <div
                onClick={() => handleClick(order.orderID)}
                key={order._id}
                className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all hover:cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    🧾 Order : {order?.orderID}
                  </h4>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  Date:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>

                <ul className="divide-y divide-gray-100 mb-3">
                  {Array.isArray(order.dresses) &&
                    order.dresses.map((dress: any, index: number) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-2 text-gray-700"
                      >
                        <span>
                          {dress.dressName}{" "}
                          <span className="text-sm text-gray-500">
                            ({dress.dressType})
                          </span>
                        </span>
                        <span className="font-medium">₹{dress.dressPrice}</span>
                      </li>
                    ))}
                </ul>

                <div className="text-right font-semibold text-gray-800">
                  Total: ₹{order.amountAfterDiscount || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          selectedUser && (
            <p className="text-gray-500 text-center mt-4">
              No orders found for this user.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default UserOrderSearch;
