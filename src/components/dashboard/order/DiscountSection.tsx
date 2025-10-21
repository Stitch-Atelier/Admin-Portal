const DiscountSection = ({ onChange }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange((prev: any) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium mb-2">Discounts</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-1 text-sm">Stitch Rewards</label>
          <input
            type="number"
            className="w-full border rounded-md p-2"
            placeholder="₹ amount"
            onChange={(e) => handleChange("stitchRewards", e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-sm">Occasional Discount</label>
          <input
            type="number"
            className="w-full border rounded-md p-2"
            placeholder="₹ amount"
            onChange={(e) => handleChange("occasion", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;
