import { useState, useEffect } from "react";
import SingleQueryRow from "./SingleQueryRow";

interface OrderItem {
  id: string;
  name: string;
  garment: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Address {
  type: string;
  addressText: string;
}

interface OrderDetails {
  items: OrderItem[];
  totalItems: number;
  totalAmount: number;
}

interface Order {
  _id: string;
  orderDetails: OrderDetails;
  address: Address;
  paymentMethod: string;
  userMobile: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const QueryHome = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      try {
        // Replace this with your actual API call
        const mockData = {
          success: true,
          data: [
            {
              orderDetails: {
                items: [
                  {
                    id: "68f76118d63cdf58dc7f4b87",
                    name: "Simple Suit - Lining",
                    garment: "Lining",
                    quantity: 1,
                    price: 700,
                    subtotal: 700,
                  },
                  {
                    id: "68f76118d63cdf58dc7f4b88",
                    name: "Pathani Salwar Suit - No Lining",
                    garment: "No Lining",
                    quantity: 1,
                    price: 350,
                    subtotal: 350,
                  },
                ],
                totalItems: 2,
                totalAmount: 1050,
              },
              address: {
                type: "saved",
                addressText:
                  "Hno - 238, st - 15, locality - Chandigarh, Rupnagar, Punjab, 140001 - India.",
              },
              _id: "6954acd28450ab380930b179",
              paymentMethod: "Cash on Delivery",
              userMobile: "7087433161",
              status: "pending",
              createdAt: "2025-12-31T04:55:46.361Z",
              updatedAt: "2025-12-31T04:55:46.361Z",
              __v: 0,
            },
            {
              orderDetails: {
                items: [
                  {
                    id: "68f76118d63cdf58dc7f4b86",
                    name: "Simple Suit - No Lining",
                    garment: "No Lining",
                    quantity: 1,
                    price: 400,
                    subtotal: 400,
                  },
                ],
                totalItems: 1,
                totalAmount: 400,
              },
              address: {
                type: "saved",
                addressText:
                  "Hno - 686, st - 2, locality - Gobi vally, Rupnagar, Punjab, 140001 - India.",
              },
              _id: "69539bff8450ab380930b0dc",
              paymentMethod: "Cash on Delivery",
              userMobile: "9877963194",
              status: "pending",
              createdAt: "2025-12-30T09:31:43.046Z",
              updatedAt: "2025-12-30T09:31:43.046Z",
              __v: 0,
            },
            {
              orderDetails: {
                items: [
                  {
                    id: "68f76118d63cdf58dc7f4b86",
                    name: "Simple Suit - No Lining",
                    garment: "No Lining",
                    quantity: 1,
                    price: 400,
                    subtotal: 400,
                  },
                ],
                totalItems: 1,
                totalAmount: 400,
              },
              address: {
                type: "saved",
                addressText:
                  "Hno - 686, st - 1, locality - Govind Valley, Rupnagar, Punjab, 140001 - India.",
              },
              _id: "6952a01a8450ab380930b01f",
              paymentMethod: "Cash on Delivery",
              userMobile: "7814067015",
              status: "pending",
              createdAt: "2025-12-29T15:36:58.170Z",
              updatedAt: "2025-12-29T15:36:58.170Z",
              __v: 0,
            },
          ],
        };

        setOrders(mockData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Queries
          </h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {["all", "pending", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <SingleQueryRow key={order._id} order={order} />
            ))
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Orders: {filteredOrders.length}</span>
            <span>
              Total Revenue: ₹
              {filteredOrders
                .reduce((sum, order) => sum + order.orderDetails.totalAmount, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryHome;
