"use client";

import { Layout } from "lucide-react";
import { SidebarItem } from "./sidebar-item";

const userRoutes = [
  {
    icon: Layout,
    label: "Home",
    href: "/home",
  },
];

export const SidebarRoutes = () => {
  return (
    <div className="flex flex-col w-full">
      {userRoutes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
