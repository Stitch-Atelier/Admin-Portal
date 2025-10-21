const OrderSummaryModal = ({
  user,
  address,
  dresses,
  discounts,
  remarks,
  onClose,
}: any) => {
  const total = dresses.reduce(
    (acc: any, d: any) =>
      acc + (d.type === "with" ? d.withLining : d.withoutLining),
    0
  );
  const afterDiscount =
    total - discounts.stitchRewards - discounts.occasion > 0
      ? total - discounts.stitchRewards - discounts.occasion
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-2/3 p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <p className="mb-2">
          <strong>User:</strong> {user?.name} ({user?.mobile})
        </p>
        <p className="mb-4">
          <strong>Address:</strong> {address || "Not provided"}
        </p>

        <h3 className="font-medium mb-2">Dresses:</h3>
        <ul className="mb-3 list-disc list-inside">
          {dresses.map((d: any) => (
            <li key={d.id}>
              {d.name} — ₹{d.type === "with" ? d.withLining : d.withoutLining} (
              {d.type === "with" ? "with lining" : "without lining"})
            </li>
          ))}
        </ul>

        <p className="mb-1">Total: ₹{total}</p>
        <p className="mb-1 text-green-600">
          - Stitch Rewards: ₹{discounts.stitchRewards}
        </p>
        <p className="mb-1 text-green-600">
          - Occasional Discount: ₹{discounts.occasion}
        </p>
        <p className="font-semibold text-lg mt-2">
          Amount Payable: ₹{afterDiscount}
        </p>

        <p className="mt-4 text-sm text-gray-700">
          <strong>Remarks:</strong> {remarks || "None"}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => alert("Order Confirmed!")}
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;
