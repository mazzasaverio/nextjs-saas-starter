import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "./_components/navbar";

const PlarformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <div className="h-full">
        <Navbar />
        <div className="h-full py-20">{children}</div>
      </div>
    </ClerkProvider>
  );
};

export default PlarformLayout;
