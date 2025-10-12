import PendingOrders from "./PendingOrders";
const Home = () => {
  return (
    <>
      <section className="grid grid-cols-2 my-10">
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
