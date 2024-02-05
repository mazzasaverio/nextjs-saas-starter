"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

// import { SearchInput } from "./search-input";

export const NavbarRoutes = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="flex gap-x-3 ml-auto ">
        <Link href="/home">
          <Button variant="outline" className="hidden md:block rounded-full">
            Home
          </Button>
        </Link>

        <ModeToggle />
        <div className="mt-1">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </>
  );
};
