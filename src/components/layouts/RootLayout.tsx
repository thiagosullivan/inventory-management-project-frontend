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
      <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300 md:p-3 lg:pl-5 lg:pt-5 lg:pb-0 lg:pr-0">
        <SidebarDesktop />
        <SidebarMobile />
        <div className="flex-1 min-w-0 flex flex-col">
          <SidebarTrigger className="-ml-1 hidden md:block lg:hidden" />
          <HeaderMobile />
          <Header />
          <EmailVerificationBanner />
          <main className="flex-1 overflow-y-auto lg:px-5">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
