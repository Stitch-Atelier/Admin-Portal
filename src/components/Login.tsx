import { useState } from "react";
import useUserStore from "../../store/user";
import { LoginAdmin } from "../services/requests";
import toast from "react-hot-toast";

const Login = () => {
  const [mobile, setMobile] = useState<string>("");
  const { setUser } = useUserStore();

  // Handle Login Button Click
  const handleLoginBtn = async (e: any) => {
    e.preventDefault();

    //  Call Login API
    const { response, status } = await LoginAdmin(mobile);

    if (status === 200 && response?.user?.role === "admin") {
      setUser(response);
      toast.success("Login Successful!");
    }
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
          <form onSubmit={handleLoginBtn} className="card-body">
            {/* Title */}
            <div>
              <h2 className="text-center text-2xl font-bold">
                Stitch Ateliers Admin
              </h2>
            </div>

            {/* Mobile Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold pb-2">
                  Mobile Number
                </span>
              </label>
              <input
                type="tel"
                placeholder="Enter mobile number"
                className="input input-bordered"
                pattern="[0-9]{10}"
                maxLength={10}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold pb-2">OTP</span>
              </label>
              <input
                type="number"
                placeholder="Enter OTP"
                className="input input-bordered"
                // required
              />
            </div>

            {/* Login Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn text-white btn-success hover:scale-105 transition-transform duration-200"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
