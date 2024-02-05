import { NavbarRoutes } from "./navbar-routes";

import { MobileSidebar } from "./mobile-sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
const font = Poppins({ weight: "600", subsets: ["latin"] });

export const Navbar = () => {
  return (
    // <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
    <header className="w-full fixed  z-50 flex justify-between items-center py-2 px-4 h-16 border-b border-primary/10 bg-secondary">
      <MobileSidebar />

      <Link href="/home">
        <h1
          className={cn(
            "hidden md:block text-xl md:text-3xl font-bold text-primary",
            font.className
          )}
        >
          Logo
        </h1>
      </Link>

      <NavbarRoutes />
    </header>
  );
};
