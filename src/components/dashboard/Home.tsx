import PendingOrders from "./PendingOrders";
const Home = () => {
  return (
    <>
      <div className="m-8 flex justify-start gap-4">
        <button className="btn btn-sm bg-blue-700 text-white">
          Create User
        </button>
        <button className="btn btn-sm">Create Order</button>
      </div>
      <section className="grid grid-cols-2">
        <div className="mx-8 border p-8 rounded shadow ">
          <h1 className="pb-4 font-semibold">Pending Orders</h1>
          <PendingOrders />
        </div>
        <div className="mx-8 border p-8 rounded shadow ">
          <h1 className="pb-4 font-semibold">Sales </h1>
          <PendingOrders />
        </div>
      </section>
    </>
  );
};

export default Home;
