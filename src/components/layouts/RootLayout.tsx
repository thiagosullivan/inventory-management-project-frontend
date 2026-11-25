import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../header/Header";
import Footer from "../Footer";
import { EmailVerificationBanner } from "../auth/EmailVerificationBanner";

export default function RootLayout() {
  return (
    <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300 p-3 lg:pl-5 lg:pt-5 lg:pb-0 lg:pr-0">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto px-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
