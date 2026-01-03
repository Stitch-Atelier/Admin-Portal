import React, { useState } from "react";

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

interface SingleQueryRowProps {
  order: Order;
}

const SingleQueryRow: React.FC<SingleQueryRowProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="text-sm font-mono text-gray-900">{order._id}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="text-sm font-medium text-gray-900">
                {order.userMobile}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{order.orderDetails.totalAmount}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="ml-4">
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 flex items-center text-xs text-gray-500">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDate(order.createdAt)}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Order Items ({order.orderDetails.totalItems})
              </h3>
              <div className="space-y-3">
                {order.orderDetails.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.garment}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{item.subtotal}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Delivery Address
                </h3>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {order.address.addressText}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Payment Method
                </h3>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    ₹{order.orderDetails.totalAmount}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    ₹{order.orderDetails.totalAmount}
                  </span>
                </div>
              </div>

              {/* <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Update Status
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  View Details
                </button>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleQueryRow;
