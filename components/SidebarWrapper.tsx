"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  
  // Hide sidebar on landing page, login page, and join page
  const hideSidebar = pathname === "/" || pathname === "/login" || pathname.startsWith("/join");
  
  if (hideSidebar) return null;
  
  return <Sidebar />;
}
