import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../header/Header";
import Footer from "../Footer";
import { EmailVerificationBanner } from "../auth/EmailVerificationBanner";

export default function RootLayout() {
  return (
    <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300 pl-5 pt-5">
      <Sidebar />
      <main className="flex-1 flex flex-col pl-5 overflow-y-auto">
        <Header />
        <EmailVerificationBanner />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
