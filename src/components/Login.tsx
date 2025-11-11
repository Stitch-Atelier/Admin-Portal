import { useEffect, useState } from "react";
import useUserStore from "../../store/user";
import { LoginAdmin } from "../services/requests";
import toast from "react-hot-toast";
import { OTPWidget } from "@msg91comm/sendotp-sdk";

const Login = () => {
  const [mobile, setMobile] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const { setUser } = useUserStore();

  const [reqID, setReqID] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  // Initialize Widget on Mount
  useEffect(() => {
    const widgetId = import.meta.env.VITE_MSG91_WIDGET_ID;
    const authKey = import.meta.env.VITE_MSG91_AUTH_KEY;

    if (!widgetId || !authKey) {
      toast.error("MSG91 credentials not configured");
      return;
    }

    OTPWidget.initializeWidget(widgetId, authKey);
  }, []);

  // Send OTP - But first check if user exists and is admin
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Check if user exists and is admin
      const { response: loginResponse, status } = await LoginAdmin(mobile);

      if (status !== 200) {
        toast.error("User not found. Please check your mobile number.");
        setLoading(false);
        return;
      }

      if (!loginResponse?.user) {
        toast.error("User not found. Please check your mobile number.");
        setLoading(false);
        return;
      }

      if (loginResponse.user.role !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      // STEP 2: User exists and is admin, now send OTP
      const data = {
        identifier: `91${mobile}`,
      };

      const otpResponse = await OTPWidget.sendOTP(data);

      if (otpResponse?.type === "success") {
        setReqID(otpResponse?.message);
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        toast.error(otpResponse?.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Login/OTP Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    if (!reqID) {
      toast.error("Request ID not found. Please resend OTP.");
      return;
    }

    setVerifying(true);

    try {
      const body = {
        reqId: reqID,
        otp: otp,
      };

      const otpResponse = await OTPWidget.verifyOTP(body);

      if (otpResponse?.type === "success") {
        toast.success("OTP verified successfully!");

        // Now call your login API
        const { response, status } = await LoginAdmin(mobile);

        if (status === 200 && response?.user?.role === "admin") {
          setUser(response);
          toast.success("Login Successful!");
        } else if (status === 200 && response?.user?.role !== "admin") {
          toast.error("Access denied. Admin privileges required.");
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else {
        toast.error(otpResponse?.message || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      toast.error(
        error?.message || "OTP verification failed. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setOtp("");
    setReqID("");
    setOtpSent(false);

    // Small delay for better UX
    setTimeout(() => {
      handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  // Reset form
  const handleBackToMobile = () => {
    setOtp("");
    setReqID("");
    setOtpSent(false);
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        {/* Left Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-2 text-gray-600">
            Manage orders, users and more with ease.
          </p>
        </div>

        {/* Login Card */}
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl border border-gray-100">
          {!otpSent ? (
            // STEP 1: Mobile Number Form
            <form onSubmit={handleSendOtp} className="card-body">
              {/* Title */}
              <div>
                <h2 className="text-center text-2xl font-bold">
                  Stitch Ateliers Admin
                </h2>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Enter your mobile number to receive OTP
                </p>
              </div>

              {/* Mobile Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold pb-2">
                    Mobile Number
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">+91</span>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="input input-bordered flex-1"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn text-white btn-success hover:scale-105 transition-transform duration-200"
                  disabled={loading || mobile.length !== 10}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // STEP 2: OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="card-body">
              {/* Title */}
              <div>
                <h2 className="text-center text-2xl font-bold">Verify OTP</h2>
                <p className="text-center text-sm text-gray-500 mt-2">
                  OTP sent to +91 {mobile}
                </p>
              </div>

              {/* OTP Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold pb-2">
                    Enter OTP
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit OTP"
                  className="input input-bordered text-center text-lg tracking-widest"
                  required
                  disabled={verifying}
                  autoFocus
                />
              </div>

              {/* Resend OTP */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={loading || verifying}
                >
                  Resend OTP
                </button>
              </div>

              {/* Verify Button */}
              <div className="form-control mt-4">
                <button
                  type="submit"
                  className="btn text-white btn-success hover:scale-105 transition-transform duration-200"
                  disabled={verifying || otp.length < 4}
                >
                  {verifying ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </button>
              </div>

              {/* Back Button */}
              <div className="form-control mt-2">
                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className="btn btn-ghost btn-sm"
                  disabled={verifying}
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
