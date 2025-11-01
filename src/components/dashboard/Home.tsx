import PendingOrders from "./PendingOrders";
import CompletedOrders from "./CompletedOrders";
const Home = () => {
  return (
    <>
      <section className="grid my-10 space-y-4">
        <div className="mx-8 border p-8 rounded shadow ">
          <PendingOrders />
        </div>
        <div className="mx-8 border p-8 rounded shadow ">
          <CompletedOrders />
        </div>
      </section>
    </>
  );
};

export default Home;
