// import { Logo } from "./logo";
import Link from "next/link";
import { SidebarRoutes } from "./sidebar-routes";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({ weight: "600", subsets: ["latin"] });

export const Sidebar = () => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm z-80">
      <div className="p-6">
        <Link href="/">
          <h1 className={cn("  font-bold text-primary", font.className)}>
            Logo
          </h1>
        </Link>
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
    </div>
  );
};
