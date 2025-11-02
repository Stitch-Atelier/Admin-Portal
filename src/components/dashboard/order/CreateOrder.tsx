import UserSelector from "./UserSelector";
import { useEffect, useState } from "react";
import {
  FetchAddress,
  FetchAllDresses,
  CreateOrderWithImages,
  FetchAllDicounts,
} from "../../../services/requests";
import toast from "react-hot-toast";
import { FiMinus, FiPlus } from "react-icons/fi";

const CreateOrder = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [allDresses, setAllDresses] = useState<any>(null);
  const [allDiscounts, setAllDiscounts] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Changed: Each dress instance has a unique instanceId
  const [selectedDresses, setSelectedDresses] = useState<any[]>([]);
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState<number>(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

  // NEW: Selected discount state
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  // Store images for each dress instance (using instanceId)
  const [dressImages, setDressImages] = useState<{
    [instanceId: string]: File | null;
  }>({});

  // Store measurements for each dress instance (using instanceId)
  const [dressMeasurements, setDressMeasurements] = useState<{
    [instanceId: string]: any;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate unique instance ID
  const generateInstanceId = () => {
    return `dress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // NEW: Calculate discount amount
  const calculateDiscountedAmount = (baseAmount: number, discount: any) => {
    if (!discount) return baseAmount;

    return baseAmount - (baseAmount * discount?.discountPer) / 100;
  };

  // NEW: Handle discount selection
  const handleDiscountChange = (discount: any) => {
    setSelectedDiscount(discount);
    const discountedAmount = calculateDiscountedAmount(
      totalBeforeDiscount,
      discount
    );
    setTotalAfterDiscount(discountedAmount);
  };

  // NEW: Clear discount
  const clearDiscount = () => {
    setSelectedDiscount(null);
    setTotalAfterDiscount(totalBeforeDiscount);
  };

  const handleIncrease = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    const dressOBJ = allDresses.find((dress: any) => dress._id === id);

    // Create unique instance ID for this dress
    const instanceId = generateInstanceId();

    const newDress = {
      ...dressOBJ,
      instanceId: instanceId,
      dressStatus: "fabric picked",
      dressPic: "",
    };

    const newTotalBefore =
      totalBeforeDiscount + (dressOBJ?.dressPrice ? dressOBJ.dressPrice : 0);
    setTotalBeforeDiscount(newTotalBefore);

    // Recalculate with existing discount
    const newTotalAfter = calculateDiscountedAmount(
      newTotalBefore,
      selectedDiscount
    );
    setTotalAfterDiscount(newTotalAfter);

    setSelectedDresses((prev) => [...prev, newDress]);

    // Initialize empty measurement for this dress instance
    setDressMeasurements((prev) => ({
      ...prev,
      [instanceId]: {
        neck: { type: "Top", val: "" },
        bust: { type: "Top", val: "" },
        waist: { type: "Top", val: "" },
        armHole: { type: "Top", val: "" },
        shoulderW: { type: "Top", val: "" },
        armL: { type: "Top", val: "" },
        hip: { type: "Bottom", val: "" },
        thigh: { type: "Bottom", val: "" },
        rise: { type: "Bottom", val: "" },
        inseam: { type: "Bottom", val: "" },
        outseam: { type: "Bottom", val: "" },
      },
    }));
  };

  const handleDecrease = (id: string) => {
    const dressOBJ = allDresses.find((d: any) => d._id === id);
    if (!dressOBJ) return;

    const price = dressOBJ.dressPrice || 0;

    setQuantities((prev) => {
      const currentQty = prev[id] || 0;
      if (currentQty === 0) return prev;
      const nextQty = currentQty - 1;
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[id];
      } else {
        next[id] = nextQty;
      }
      return next;
    });

    // Remove the LAST instance of this dress from selectedDresses
    setSelectedDresses((prev) => {
      const lastIndex = prev.map((item) => item._id).lastIndexOf(id);
      if (lastIndex === -1) return prev;

      const copy = [...prev];
      const removedDress = copy[lastIndex];

      // Remove image and measurements for this specific instance
      setDressImages((prevImages) => {
        const newImages = { ...prevImages };
        delete newImages[removedDress.instanceId];
        return newImages;
      });

      setDressMeasurements((prevMeasurements) => {
        const newMeasurements = { ...prevMeasurements };
        delete newMeasurements[removedDress.instanceId];
        return newMeasurements;
      });

      copy.splice(lastIndex, 1);
      return copy;
    });

    const newTotalBefore = Math.max(0, totalBeforeDiscount - price);
    setTotalBeforeDiscount(newTotalBefore);

    // Recalculate with existing discount
    const newTotalAfter = calculateDiscountedAmount(
      newTotalBefore,
      selectedDiscount
    );
    setTotalAfterDiscount(newTotalAfter);
  };

  // Handle image upload for a specific dress instance
  const handleImageUpload = (instanceId: string, file: File | null) => {
    setDressImages((prev) => ({
      ...prev,
      [instanceId]: file,
    }));
  };

  // Handle measurement change for a specific dress instance
  const handleMeasurementChange = (
    instanceId: string,
    field: string,
    value: string
  ) => {
    setDressMeasurements((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        [field]: {
          ...prev[instanceId][field],
          val: value,
        },
      },
    }));
  };

  // Validate order before submission
  const validateOrder = (): boolean => {
    // Check if all dress instances have images
    for (const dress of selectedDresses) {
      if (!dressImages[dress.instanceId]) {
        toast.error(`Please upload image for ${dress.dressName}`);
        return false;
      }

      // Check if all measurements are filled
      const measurements = dressMeasurements[dress.instanceId];
      if (!measurements) {
        toast.error(`Please fill measurements for ${dress.dressName}`);
        return false;
      }

      const requiredFields = [
        "neck",
        "bust",
        "waist",
        "armHole",
        "shoulderW",
        "armL",
        "hip",
        "thigh",
        "rise",
        "inseam",
        "outseam",
      ];

      for (const field of requiredFields) {
        if (!measurements[field]?.val || measurements[field].val === "") {
          toast.error(
            `Please fill ${field} measurement for ${dress.dressName}`
          );
          return false;
        }
      }
    }

    return true;
  };

  // Submit order
  const handleConfirmOrder = async () => {
    if (!validateOrder()) return;

    setIsSubmitting(true);

    try {
      // Prepare order data
      const dressesData = selectedDresses.map((dress) => ({
        dressId: dress._id,
        dressName: dress.dressName,
        dressPrice: dress.dressPrice,
        dressType: dress.dressType,
        dressStatus: dress.dressStatus,
        measurement: dressMeasurements[dress.instanceId],
      }));

      const orderData = {
        dresses: dressesData,
        address: addressInfo._id,
        amountBeforeDiscount: totalBeforeDiscount,
        amountAfterDiscount: totalAfterDiscount,
        extraCharges: extraCharges,
        userId: selectedUser._id,
        remarks: remarks,
        discountId: selectedDiscount?._id || null,
      };

      // Prepare images array (maintain order matching dresses array)
      const imagesArray = selectedDresses.map(
        (dress) => dressImages[dress.instanceId] as File
      );

      // Call API
      const { response, status } = await CreateOrderWithImages(
        orderData,
        imagesArray
      );

      if (status === 201) {
        toast.success("Order created successfully!");

        // Reset form
        setSelectedDresses([]);
        setQuantities({});
        setDressImages({});
        setDressMeasurements({});
        setTotalBeforeDiscount(0);
        setTotalAfterDiscount(0);
        setExtraCharges(0);
        setRemarks("");
        setSelectedDiscount(null);

        // Close modal
        (document.getElementById("model") as HTMLDialogElement)?.close();
      } else {
        toast.error(response?.message || "Failed to create order");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error("An error occurred while creating the order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Address Info
  const GetAddressInfo = async (userId: string) => {
    const { response, status } = await FetchAddress(userId);
    if (status === 200) {
      setAddressInfo(response[0]);
      toast.success("Address fetched successfully!");
    }
  };

  const GetAllDresses = async () => {
    const { response, status } = await FetchAllDresses();
    if (status === 200) {
      setAllDresses(response?.dresses);
      toast.success("Dresses fetched successfully!");
    }
  };

  // Renamed local function so it doesn't shadow the imported FetchAllDicounts
  const FetchAllDicountsLocal = async () => {
    const { response, status } = await FetchAllDicounts();
    if (status === 200) {
      setAllDiscounts(response?.data);
      toast.success("Discounts fetched successfully!");
    }
  };

  useEffect(() => {
    if (selectedUser) {
      GetAddressInfo(selectedUser?._id);
      GetAllDresses();
      FetchAllDicountsLocal();
    }
  }, [selectedUser]);

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
                <div className="relative overflow-hidden bg-gray-50">
                  {dress?.dressType && (
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 ${
                          dress?.dressType === "No Lining"
                            ? "bg-red-500"
                            : "bg-sky-500"
                        } text-white text-xs font-semibold rounded-full shadow-lg`}
                      >
                        {dress.dressType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {dress?.dressName}
                  </h3>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{dress?.dressPrice?.toLocaleString("en-IN")}
                    </p>
                  </div>

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
              className="btn btn-md font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400 transition-all duration-200"
            >
              Create Order
            </button>
          </div>
        )}

        <dialog id="model" className="modal">
          <div className="modal-box max-w-4xl bg-white rounded-2xl shadow-xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
                ✕
              </button>
            </form>

            <h3 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-2">
              🧾 Order Summary
            </h3>

            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">
                  Customer Details
                </h4>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span>{" "}
                  {selectedUser?.firstname}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Mobile:</span>{" "}
                  {selectedUser?.mobile}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Address:</span>{" "}
                  {addressInfo?.address}, {addressInfo?.city},{" "}
                  {addressInfo?.state}, {addressInfo?.country} -{" "}
                  {addressInfo?.pinCode}
                </p>
              </div>

              {/* Dresses Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">
                  Dresses ({selectedDresses?.length})
                </h4>

                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {selectedDresses.map((dress, index) => (
                    <div
                      key={dress.instanceId}
                      className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-800">
                            {dress.dressName} #{index + 1}
                          </h5>
                          <p className="text-sm text-gray-600">
                            ₹{dress.dressPrice}
                          </p>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Dress Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              dress.instanceId,
                              e.target.files?.[0] || null
                            )
                          }
                          className="file-input file-input-bordered file-input-sm w-full"
                          required
                        />
                        {dressImages[dress.instanceId] && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {dressImages[dress.instanceId]?.name}
                          </p>
                        )}
                      </div>

                      {/* Measurements Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                          { key: "neck", label: "Neck" },
                          { key: "bust", label: "Bust" },
                          { key: "waist", label: "Waist" },
                          { key: "armHole", label: "Armhole" },
                          { key: "shoulderW", label: "Shoulder W" },
                          { key: "armL", label: "Arm Length" },
                          { key: "hip", label: "Hip" },
                          { key: "thigh", label: "Thigh" },
                          { key: "rise", label: "Rise" },
                          { key: "inseam", label: "Inseam" },
                          { key: "outseam", label: "Outseam" },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {label} *
                            </label>
                            <input
                              className="input input-sm input-bordered w-full text-sm"
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={
                                dressMeasurements[dress.instanceId]?.[key]
                                  ?.val || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  dress.instanceId,
                                  key,
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW: Discount Selection Section */}
              {Array.isArray(allDiscounts) && allDiscounts.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">
                    Apply Discount
                  </h4>
                  <div className="space-y-3">
                    {/* No discount option */}
                    <label className="flex items-center p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="radio"
                        name="discount"
                        className="radio radio-primary mr-3"
                        checked={!selectedDiscount}
                        onChange={clearDiscount}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">No Discount</p>
                        <p className="text-xs text-gray-500">Original price</p>
                      </div>
                    </label>

                    {/* Available discounts */}
                    {allDiscounts.map((discount: any) => (
                      <label
                        key={discount._id}
                        className={`flex items-center p-3 bg-white border-2 rounded-lg cursor-pointer hover:border-blue-300 transition-colors ${
                          selectedDiscount?._id === discount._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="discount"
                          className="radio radio-primary mr-3"
                          checked={selectedDiscount?._id === discount._id}
                          onChange={() => handleDiscountChange(discount)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">
                              {discount?.discountDesc}
                            </p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {discount.discountPer}% OFF
                            </span>
                          </div>
                          {discount.discountDesc && (
                            <p className="text-xs text-gray-500 mt-1">
                              {discount.discountDesc}
                            </p>
                          )}
                          {selectedDiscount?._id === discount._id && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              You save: ₹
                              {(
                                totalBeforeDiscount - totalAfterDiscount
                              ).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">
                  Billing Summary
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Total Before Discount:</span>{" "}
                    ₹{totalBeforeDiscount.toLocaleString("en-IN")}
                  </p>

                  {selectedDiscount && (
                    <p className="text-green-600">
                      <span className="font-medium">Discount Applied:</span>{" "}
                      {selectedDiscount.discountDesc} - You saved ₹
                      {(
                        totalBeforeDiscount - totalAfterDiscount
                      ).toLocaleString("en-IN")}
                    </p>
                  )}

                  <p className="text-lg font-semibold">
                    <span className="font-medium">Total After Discount:</span> ₹
                    {totalAfterDiscount.toLocaleString("en-IN")}
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="font-medium">Extra Charges:</label>
                    <input
                      type="number"
                      className="input input-sm input-bordered w-32 text-sm"
                      placeholder="₹0"
                      value={extraCharges}
                      onChange={(e) => setExtraCharges(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Remarks:</label>
                    <textarea
                      placeholder="Add any special instructions..."
                      className="textarea textarea-bordered w-full mt-1 text-sm"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="pt-2 border-t mt-3">
                    <p className="text-lg font-bold text-gray-800">
                      Final Total: ₹
                      {(totalAfterDiscount + extraCharges).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    </main>
  );
};

export default CreateOrder;
