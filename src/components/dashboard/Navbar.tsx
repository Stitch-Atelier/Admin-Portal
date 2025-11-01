import { Link } from "react-router-dom";
import { LogoutAdmin } from "../../services/requests";
import toast from "react-hot-toast";

const Navbar = () => {
  const handleLogout = async () => {
    try {
      await LogoutAdmin();
      localStorage.removeItem("user-storage");
      toast.success("Logging Out...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Logout Failed");
    }
  };

  return (
    <div className="flex justify-between items-center bg-base-200 shadow-sm py-2">
      <div className="px-4 font-bold">
        <h1 className="text-xl">
          <Link
            to="/dashboard"
            className="p-2 hover:underline hover:underline-offset-2  hover:font-semibold transition-all"
          >
            Stitch Ateliers
          </Link>
        </h1>
      </div>
      <div className="flex items-center gap-4 mr-4">
        <ul className="flex items-center gap-4">
          <Link
            to="/dashboard/order/create"
            className="p-2 hover:underline hover:underline-offset-2  hover:font-semibold transition-all"
          >
            Add Order
          </Link>
        </ul>
        <button
          onClick={handleLogout}
          className="btn btn-sm bg-red-500 text-white border-none "
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
