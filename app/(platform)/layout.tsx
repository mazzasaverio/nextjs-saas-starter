import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "./_components/navbar";
import { ModalProvider } from "@/components/providers/modal-provider";
import { Sidebar } from "./_components/sidebar";
const PlarformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <div className="h-full">
        <Navbar />
        <div className="hidden md:flex h-full w-56 flex-col inset-y-0 z-50 mt-[heightOfNavbar]">
          <Sidebar />
        </div>
        <main className="md:pl-56 pt-[80px] h-full">
          <ModalProvider />
          {children}
        </main>
        {/* <div className="h-full py-20">
         
        </div> */}
      </div>
    </ClerkProvider>
  );
};

export default PlarformLayout;
