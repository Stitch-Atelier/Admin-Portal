import UserSelector from "./UserSelector";
import AddressSelector from "./AddressSelector";
import DressList from "./DressList";
import DiscountSection from "./DiscountSection";
import OrderSummaryModal from "./OrderSummaryModal";
import { useState } from "react";

const CreateOrder = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedDresses, setSelectedDresses] = useState([]);
  const [discounts, setDiscounts] = useState({ stitchRewards: 0, occasion: 0 });
  const [remarks, setRemarks] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const handleCreateOrder = () => setShowSummary(true);
 
  return (
    <main className="grid grid-cols-2 gap-6 p-6">
      {/* Left Section */}
      <section className="flex flex-col gap-4">
        <UserSelector onSelect={setSelectedUser} />
        <AddressSelector onSelect={setSelectedAddress} />
        <DressList onSelect={setSelectedDresses} />
      </section>

      {/* Right Section */}
      <section className="flex flex-col gap-4">
        <DiscountSection onChange={setDiscounts} />

        <div>
          <label className="block mb-1 font-medium">Remarks</label>
          <textarea
            className="w-full border rounded-md p-2"
            placeholder="Add any remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreateOrder}
          className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
        >
          Create Order
        </button>
      </section>

      {showSummary && (
        <OrderSummaryModal
          user={selectedUser}
          address={selectedAddress}
          dresses={selectedDresses}
          discounts={discounts}
          remarks={remarks}
          onClose={() => setShowSummary(false)}
        />
      )}
    </main>
  );
};

export default CreateOrder;
