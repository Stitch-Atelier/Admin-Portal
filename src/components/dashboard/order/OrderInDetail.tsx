import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FetchOrderById, UpdateOrderById } from "../../../services/requests";

const DRESS_STATUSES = [
  "fabric picked",
  "cutting",
  "top stitch",
  "bottom stitch",
  "hemming",
  "stitched",
];

const OrderInDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [expandedDress, setExpandedDress] = useState<number | null>(null);

  const GetOrderByID = async () => {
    setLoading(true);
    const res = await FetchOrderById(orderId!);
    if (res?.status === 200 && res?.response) {
      setOrder(res.response);
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    GetOrderByID();
  }, [orderId]);

  const HandleOrderUpdate = async () => {
    try {
      setUpdating(true);
      const payload = {
        extraCharges: order.extraCharges,
        remarks: order.remarks,
        dresses: order.dresses.map((d: any) => ({
          dressStatus: d.dressStatus,
          _id: d._id,
        })),
        status: order.status,
      };

      const res = await UpdateOrderById(orderId!, payload);
      if (res?.status === 200) {
        toast.success("Order updated successfully");
        setEditMode(false);
        GetOrderByID();
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const HandleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await UpdateOrderById(orderId!, { status: "cancelled" });
      if (res?.status === 200) {
        toast.success("Order cancelled successfully");
        GetOrderByID();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const MarkAsCompleted = async () => {
    try {
      const res = await UpdateOrderById(orderId!, { status: "completed" });
      if (res?.status === 200) {
        toast.success("Order marked as completed");
        GetOrderByID();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-10 text-gray-600">
        No order details found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Order <span className="text-blue-600">{order.orderID}</span>
          </h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <p>Created: {formatDate(order.createdAt)}</p>
            <p>Updated: {formatDate(order.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
              order.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : order.status === "completed"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>

          {order.status === "pending" && (
            <>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editMode ? "Cancel Edit" : "Edit Order"}
              </button>
              <button
                onClick={HandleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cancel Order
              </button>
            </>
          )}

          {order.status !== "completed" && (
            <button
              onClick={MarkAsCompleted}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      {order.userId && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Customer Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span>{" "}
              {order.userId.firstname} {order.userId.lastname}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Mobile:</span> {order.userId.mobile}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span>{" "}
              <span className="capitalize">{order.userId.role}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Customer ID:</span>{" "}
              {order.userId._id}
            </p>
          </div>
        </div>
      )}

      {/* Address */}
      {order.address && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Delivery Address
          </h2>
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-1">
              {order.address.address}
            </p>
            <p className="text-gray-700">
              {order.address.city}, {order.address.state} -{" "}
              {order.address.pinCode}
            </p>
            <p className="text-gray-700">{order.address.country}</p>
            <div className="mt-2 inline-block">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase">
                {order.address.addressType} address
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dresses */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Dresses ({order.dressCount})
        </h2>

        <div className="space-y-4">
          {order.dresses?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-5">
                  <img
                    src={item.dressPic}
                    alt={item.dressName}
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {item.dressName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Dress ID:{" "}
                          <span className="font-mono text-xs">
                            {item.dressId}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedDress(expandedDress === idx ? null : idx)
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        {expandedDress === idx
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-semibold text-gray-800">
                          {item.dressType}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-semibold text-gray-800">
                          ₹{item.dressPrice}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="font-semibold text-blue-600 capitalize">
                          {item.dressStatus}
                        </p>
                      </div>
                    </div>

                    {editMode && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Update Status:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {DRESS_STATUSES.map((status) => (
                            <label
                              key={status}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                                item.dressStatus === status
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`status-${idx}`}
                                value={status}
                                checked={item.dressStatus === status}
                                onChange={(e) => {
                                  const updated = [...order.dresses];
                                  updated[idx].dressStatus = e.target.value;
                                  setOrder({ ...order, dresses: updated });
                                }}
                                className="text-blue-600"
                              />
                              <span className="text-sm capitalize">
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Measurements */}
                {expandedDress === idx && item.measurement && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Measurements
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(item.measurement).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="bg-white p-3 rounded border"
                          >
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {value.val}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {value.type}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Summary */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Payment Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Amount Before Discount:</span>
            <span className="font-semibold text-gray-900 text-lg">
              ₹{order.amountBeforeDiscount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Amount After Discount:</span>
            <span className="font-semibold text-gray-900 text-lg">
              ₹{order.amountAfterDiscount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Extra Charges:</span>
            {editMode ? (
              <input
                type="number"
                value={order.extraCharges}
                onChange={(e) =>
                  setOrder({ ...order, extraCharges: +e.target.value })
                }
                className="border-2 rounded-lg px-3 py-2 w-32 text-right font-semibold"
              />
            ) : (
              <span className="font-semibold text-gray-900 text-lg">
                ₹{order.extraCharges}
              </span>
            )}
          </div>
          <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
            <span className="text-gray-800 font-bold text-lg">
              Total Amount:
            </span>
            <span className="font-bold text-blue-600 text-2xl">
              ₹{order.amountAfterDiscount + order.extraCharges}
            </span>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-6 bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Remarks</h2>
        {editMode ? (
          <textarea
            value={order.remarks}
            onChange={(e) => setOrder({ ...order, remarks: e.target.value })}
            className="border-2 w-full rounded-lg px-4 py-3 min-h-24 focus:border-blue-500 focus:outline-none"
            placeholder="Add any remarks or special instructions..."
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {order.remarks || (
              <span className="italic text-gray-400">No remarks added</span>
            )}
          </p>
        )}
      </div>

      {/* Update Button */}
      {editMode && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setEditMode(false);
              GetOrderByID();
            }}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Discard Changes
          </button>
          <button
            disabled={updating}
            onClick={HandleOrderUpdate}
            className={`px-6 py-3 rounded-lg text-white font-medium transition ${
              updating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderInDetail;
