import "./App.css";
import { RouterProvider } from "react-router-dom";
import route from "./router"; // Adjusted import path if needed

function App() {
  return <RouterProvider router={route} />;
}

export default App;
