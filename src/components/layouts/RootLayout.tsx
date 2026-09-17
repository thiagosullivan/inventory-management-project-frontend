import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../header/Header";
import Footer from "../Footer";

export default function RootLayout() {
  return (
    <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300 p-5">
      <Sidebar />
      <main className="flex-1 pl-5">
        <Header />
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
