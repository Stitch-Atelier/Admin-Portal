import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-base-200 shadow-sm py-2">
      <div>
        <h1 className="btn btn-ghost text-xl">Stitch Ateliers</h1>
      </div>
      <div className="flex items-center gap-4 mr-4">
        <ul className="flex items-center gap-4">
          <Link
            to="/dashboard/customer/create"
            className="p-2 hover:underline hover:underline-offset-2  hover:font-semibold transition-all"
          >
            Create Customer
          </Link>
          <Link
            to="/dashboard/order/create"
            className="p-2 hover:underline hover:underline-offset-2  hover:font-semibold transition-all"
          >
            Create Order
          </Link>
        </ul>
        <button className="btn btn-sm bg-red-500 text-white border-none ">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
