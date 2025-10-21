import { useState } from "react";

const dummyDresses = [
  { id: 1, name: "Kurti", withLining: 500, withoutLining: 400 },
  { id: 2, name: "Salwar Suit", withLining: 700, withoutLining: 550 },
  { id: 3, name: "Lehenga", withLining: 1200, withoutLining: 1000 },
];

const DressList = ({ onSelect }: any) => {
  const [selected, setSelected] = useState<any>([]);

  const toggleDress = (dress: any, type: any) => {
    const exists = selected.find((s: any) => s.id === dress.id);
    let updated;

    if (exists) {
      updated = selected.map((s: any) =>
        s.id === dress.id ? { ...s, type } : s
      );
    } else {
      updated = [...selected, { ...dress, type, quantity: 1 }];
    }

    setSelected(updated);
    onSelect(updated);
  };

  const increaseQty = (id: number) => {
    const updated = selected.map((s: any) =>
      s.id === id ? { ...s, quantity: s.quantity + 1 } : s
    );
    setSelected(updated);
    onSelect(updated);
  };

  const decreaseQty = (id: number) => {
    const updated = selected
      .map((s: any) =>
        s.id === id ? { ...s, quantity: Math.max(s.quantity - 1, 0) } : s
      )
      .filter((s: any) => s.quantity > 0);
    setSelected(updated);
    onSelect(updated);
  };

  const clearSelection = (id: number) => {
    const updated = selected.filter((s: any) => s.id !== id);
    setSelected(updated);
    onSelect(updated);
  };

  return (
    <div>
      <label className="block mb-2 font-medium">Select Dresses</label>
      <div className="border rounded-md p-3 space-y-3">
        {dummyDresses.map((dress) => {
          const selectedDress = selected.find((s: any) => s.id === dress.id);
          return (
            <div
              key={dress.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="font-medium">{dress.name}</span>

              <div className="flex items-center gap-3">
                {/* Price Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDress(dress, "with")}
                    className={`px-3 py-1 rounded-md border ${
                      selectedDress?.type === "with"
                        ? "bg-green-100 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    ₹{dress.withLining} (with)
                  </button>
                  <button
                    onClick={() => toggleDress(dress, "without")}
                    className={`px-3 py-1 rounded-md border ${
                      selectedDress?.type === "without"
                        ? "bg-blue-100 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    ₹{dress.withoutLining} (w/o)
                  </button>
                </div>

                {/* Quantity Counter + Clear */}
                {selectedDress && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(dress.id)}
                      className="px-2 py-1 border rounded-md hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">
                      {selectedDress.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(dress.id)}
                      className="px-2 py-1 border rounded-md hover:bg-gray-100"
                    >
                      +
                    </button>

                    <button
                      onClick={() => clearSelection(dress.id)}
                      className="px-2 py-1 text-red-500 border border-red-400 rounded-md hover:bg-red-50"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Selected Count: {selected.length}
      </p>
    </div>
  );
};

export default DressList;
