import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  GetMasterMeasurement,
  AddMasterMeasurement,
  UpdateMasterMeasurement,
} from "../../../services/requests";

interface Props {
  userId: string;
}

type MeasurementField = {
  type: "Top" | "Bottom";
  val: string;
};

type MeasurementState = Record<string, MeasurementField>;

const EMPTY_MEASUREMENT: MeasurementState = {
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
};

const MasterMeasurement = ({ userId }: Props) => {
  const [measurement, setMeasurement] =
    useState<MeasurementState>(EMPTY_MEASUREMENT);
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ----------------------------------------
     FETCH MEASUREMENT
  ----------------------------------------- */
  useEffect(() => {
    if (!userId) {
      setMeasurement(EMPTY_MEASUREMENT);
      setIsExisting(false);
      return;
    }

    const fetchMeasurement = async () => {
      setLoading(true);
      try {
        const res = await GetMasterMeasurement(userId);

        const dbMeasurement = res.data?.measurement?.measurement;

        if (!dbMeasurement) {
          setMeasurement(EMPTY_MEASUREMENT);
          setIsExisting(false);
          return;
        }

        setMeasurement({
          ...EMPTY_MEASUREMENT,
          ...dbMeasurement,
        });

        setIsExisting(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setMeasurement(EMPTY_MEASUREMENT);
          setIsExisting(false);
        } else {
          toast.error("Failed to fetch master measurement");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurement();
  }, [userId]);

  /* ----------------------------------------
     HANDLERS
  ----------------------------------------- */
  const handleChange = (key: string, value: string) => {
    setMeasurement((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        val: value,
      },
    }));
  };

  const validate = () => {
    for (const key of Object.keys(EMPTY_MEASUREMENT)) {
      if (!measurement[key].val) {
        toast.error(`Please fill ${key}`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = { userId, measurement };

      if (isExisting) {
        await UpdateMasterMeasurement(payload);
        toast.success("Master measurement updated successfully");
      } else {
        await AddMasterMeasurement(payload);
        toast.success("Master measurement saved successfully");
        setIsExisting(true);
      }
    } catch {
      toast.error("Failed to save master measurement");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <section className="max-w-6xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Master Measurement</h2>
      <p className="text-sm text-gray-500 mb-6">
        This measurement will be reused for future orders.
      </p>

      {loading ? (
        <p className="text-gray-600">Loading measurement...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.keys(EMPTY_MEASUREMENT).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                  {key}
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input input-sm input-bordered w-full"
                  value={measurement[key].val}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              {saving
                ? "Saving..."
                : isExisting
                  ? "Update Master Measurement"
                  : "Save Master Measurement"}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default MasterMeasurement;
