import { Link } from "react-router-dom";
import { LogoutAdmin } from "../../services/requests";
import { FetchNewBookings } from "../../services/requests";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  const fetchBookingCount = async () => {
    try {
      const { status, data } = await FetchNewBookings();
      if (status === 200) setNewBookingsCount(data.length);
    } catch {
      // silently fail — don't disrupt nav on error
    }
  };

  useEffect(() => {
    fetchBookingCount();
    // Poll every 30s for new bookings badge
    const interval = setInterval(fetchBookingCount, 120000); // poll every 2 mins
    return () => clearInterval(interval);
  }, []);

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
            className="p-2 hover:underline hover:underline-offset-2 hover:font-semibold transition-all"
          >
            Stitch Ateliers
          </Link>
        </h1>
      </div>
      <div className="flex items-center gap-4 mr-4">
        <ul className="flex items-center gap-4">
          <Link
            to="/dashboard/order/create"
            className="p-2 hover:underline hover:underline-offset-2 hover:font-semibold transition-all"
          >
            Add Order
          </Link>
          <Link
            to="/dashboard/order/find-order"
            className="p-2 hover:underline hover:underline-offset-2 hover:font-semibold transition-all"
          >
            Find Order
          </Link>
          {/* ── Bookings link with live badge ── */}
          <Link
            to="/dashboard/bookings"
            className="p-2 hover:underline hover:underline-offset-2 hover:font-semibold transition-all relative"
          >
            Bookings
            {newBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {newBookingsCount > 9 ? "9+" : newBookingsCount}
              </span>
            )}
          </Link>
          <Link
            to="/dashboard/order/queries"
            className="p-2 hover:underline hover:underline-offset-2 hover:font-semibold transition-all"
          >
            Order Queries
          </Link>
        </ul>
        <button
          onClick={handleLogout}
          className="btn btn-sm bg-red-500 text-white border-none"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;