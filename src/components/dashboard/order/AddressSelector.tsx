import { useState } from "react";

const dummyAddresses = [
  "123, Sector 17, Ropar",
  "45, Model Town, Ludhiana",
  "House 88, Urban Estate, Jalandhar",
];

const AddressSelector = ({ onSelect }: any) => {
  const [address, setAddress] = useState("");
  const [showList, setShowList] = useState(false);

  const handleSelect = (addr: string) => {
    setAddress(addr);
    onSelect(addr);
    setShowList(false);
  };

  return (
    <div>
      <label className="block mb-1 font-medium">Select or Enter Address</label>
      <input
        type="text"
        className="w-full border rounded-md p-2"
        placeholder="Type or select address..."
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          onSelect(e.target.value);
        }}
        onFocus={() => setShowList(true)}
      />
      {showList && (
        <ul className="border rounded-md mt-1 bg-white shadow max-h-40 overflow-auto">
          {dummyAddresses.map((addr, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(addr)}
            >
              {addr}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressSelector;
