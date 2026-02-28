"use client";

import { format } from "date-fns";
import Link from "next/link";
import "@workspace/ui/globals.css";
import { Button } from "@workspace/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Providers } from "@/components/providers";
import { logoutUser } from "@/lib/auth-api";

const logout = async () => {
  try {
    await logoutUser();
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to logout");
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Work Navigatin</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="flex flex-col gap-2 p-3 font-semibold">
            <Link href="/AddWorkKanban">Add Work</Link>
            <Link href="/Dash">Dashboard</Link>
          </SidebarContent>

          <Button
            className="bg-white hover:bg-gray-100"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </Sidebar>
        <main className="w-full flex-1 bg-white">
          <div className="border-gray-200 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-gray-600 text-sm">
                  {format(new Date(), "EEE MMM dd h:mm a")}
                </div>
              </div>
              <SidebarTrigger className="text-gray-600 hover:text-black" />
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </Providers>
  );
}
