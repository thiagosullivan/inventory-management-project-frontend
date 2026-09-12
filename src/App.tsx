import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import ForgotPassword from "./Pages/ForgotPassword";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default App;
