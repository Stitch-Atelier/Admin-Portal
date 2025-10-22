import UserSelector from "./UserSelector";
import { useEffect, useState } from "react";
import { FetchAddress, FetchAllDresses } from "../../../services/requests";
import toast from "react-hot-toast";
import { FiMinus, FiPlus } from "react-icons/fi";

const CreateOrder = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [allDresses, setAllDresses] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedDresses, setSelectedDresses] = useState<any[]>([]);
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState<number>(0);

  const handleIncrease = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    const dressOBJ = allDresses.find((dress: any) => dress._id === id);
    dressOBJ.dressStatus = "fabric picked";
    dressOBJ.dressPic = "";
    setTotalBeforeDiscount(
      (prev) => prev + (dressOBJ?.dressPrice ? dressOBJ.dressPrice : 0)
    );
    setSelectedDresses((prev) => [...prev, dressOBJ]);
  };

  const handleDecrease = (id: string) => {
    const dressOBJ = allDresses.find((d: any) => d._id === id);
    if (!dressOBJ) return;

    const price = dressOBJ.dressPrice || 0;

    setQuantities((prev) => {
      const currentQty = prev[id] || 0;
      if (currentQty === 0) return prev; // nothing to do
      const nextQty = currentQty - 1;
      // create new object to avoid mutating prev
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[id];
      } else {
        next[id] = nextQty;
      }
      return next;
    });

    setSelectedDresses((prev) => {
      const existsIndex = prev.findIndex((item) => item._id === id);
      if (existsIndex === -1) return prev; // nothing to do

      const copy = [...prev];
      const item = copy[existsIndex];

      if (item.qty > 1) {
        copy[existsIndex] = { ...item, qty: item.qty - 1 };
        return copy;
      } else {
        // qty == 1 -> remove item entirely
        copy.splice(existsIndex, 1);
        return copy;
      }
    });

    // decrease total, but never go below 0
    setTotalBeforeDiscount((prev) => Math.max(0, prev - price));
  };

  // Fetch Address Info
  const GetAddressInfo = async (userId: string) => {
    const { response, status } = await FetchAddress(userId);
    if (status === 200) {
      setAddressInfo(response[0]); //only first element of array is picked
      toast.success("Address fetched successfully!");
    }
  };

  const GetAllDresses = async () => {
    const { response, status } = await FetchAllDresses();
    if (status === 200) {
      setAllDresses(response?.dresses); //only first element of array is picked
      toast.success("Dresses fetched successfully!");
    }
  };

  // Fetch address info when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      GetAddressInfo(selectedUser?._id);
      GetAllDresses();
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log("Selected Dresses:", selectedDresses);
  }, [selectedDresses]);

  return (
    <main>
      <UserSelector onSelect={setSelectedUser} />
      {addressInfo && (
        <div className="mt-8 mb-8 p-6 rounded-2xl border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-white max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 3.05a7 7 0 019.9 9.9l-4.243 4.243a1 1 0 01-1.414 0L5.05 12.95a7 7 0 010-9.9zM10 9a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Delivery Address
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Street Address
              </p>
              <p className="text-base text-gray-800">{addressInfo?.address}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">City</p>
              <p className="text-base text-gray-800">{addressInfo?.city}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">State</p>
              <p className="text-base text-gray-800">{addressInfo?.state}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
              <p className="text-base text-gray-800">{addressInfo?.country}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Pin Code</p>
              <p className="text-base text-gray-800">{addressInfo?.pinCode}</p>
            </div>

            {addressInfo?.addressType && (
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {addressInfo?.addressType}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Form */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Select Your Dresses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(allDresses) &&
            allDresses.map((dress) => (
              <div
                key={dress._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-50">
                  {dress?.dressPic ? (
                    <img
                      src={dress.dressPic}
                      alt={dress.dressName}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Type Badge */}
                  {dress?.dressType && (
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 ${
                          dress?.dressType === "No Lining"
                            ? "bg-red-500"
                            : "bg-sky-500"
                        }  text-white text-xs font-semibold rounded-full shadow-lg`}
                      >
                        {dress.dressType}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Dress Name */}
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {dress?.dressName}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{dress?.dressPrice?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-600">
                        Quantity
                      </span>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                        <button
                          onClick={() => handleDecrease(dress._id)}
                          className="bg-white hover:bg-rose-500 hover:text-white text-gray-700 p-2 rounded-full transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            !quantities[dress._id] ||
                            quantities[dress._id] === 0
                          }
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>

                        <span className="w-12 text-center font-bold text-lg text-gray-800">
                          {quantities[dress._id] || 0}
                        </span>

                        <button
                          onClick={() => handleIncrease(dress._id)}
                          className="bg-blue-500 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-200 shadow-sm"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Empty State */}
        {(!Array.isArray(allDresses) || allDresses.length === 0) && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Dresses Available
            </h3>
            <p className="text-gray-500">
              Check back later for new collections
            </p>
          </div>
        )}
        {Array.isArray(allDresses) && (
          <div className="text-center py-16">
            <button
              disabled={selectedDresses.length === 0}
              onClick={() =>
                (
                  document.getElementById("model") as HTMLDialogElement | null
                )?.showModal()
              }
              className="btn btn-md font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:hovercursor-not-allowed disabled:bg-gray-400 transition-all duration-200"
            >
              Create Order
            </button>
          </div>
        )}

        <dialog id="model" className="modal">
          <div className="modal-box max-w-3xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div>
              <h5 className="font-semibold mb-2">
                Name: {selectedUser?.firstname}
              </h5>
              <h5 className="font-semibold mb-2">
                Mobile: {selectedUser?.mobile}
              </h5>
              <h5 className="font-semibold mb-2">
                Address: {addressInfo?.address}, {addressInfo?.city},{" "}
                {addressInfo?.state}, {addressInfo?.country} -{" "}
                {addressInfo?.pinCode}
              </h5>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Dresses:</h4>
                <ul className="list-disc list-inside">
                  {selectedDresses.map((dress, index) => (
                    <li key={index}>
                      {dress.dressName} - {dress?.dressPrice}
                    </li>
                  ))}
                </ul>
              </div>
              <h5 className="font-semibold mb-2">
                Total Before Discount: {totalBeforeDiscount}
              </h5>
            </div>
          </div>
        </dialog>
      </div>
    </main>
  );
};

export default CreateOrder;
