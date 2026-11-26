import { Outlet } from "react-router-dom";
import SidebarDesktop from "../Sidebar";
import Header from "../header/Header";
import Footer from "../Footer";
import { EmailVerificationBanner } from "../auth/EmailVerificationBanner";
import { SidebarMobile } from "../sidebar/SidebarMobile";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { HeaderMobile } from "../header/HeaderMobile";

export default function RootLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        <SidebarDesktop />
        <SidebarMobile />
        <div className="flex-1 min-w-0 flex flex-col">
          <SidebarTrigger className=" mx-4 mt-2 hidden md:block lg:hidden" />
          <HeaderMobile />
          <Header />
          <EmailVerificationBanner />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
