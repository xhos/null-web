"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Receipt,
  Landmark,
  Tag,
  Zap,
  LogOut,
  Settings,
  Moon,
  Sun,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navigationItems = [
  { title: "transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "receipts", url: "/receipts", icon: Receipt },
  { title: "accounts", url: "/accounts", icon: Landmark },
  { title: "categories", url: "/categories", icon: Tag },
  { title: "rules", url: "/rules", icon: Zap },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="z-50">
      <SidebarHeader className="px-2 pt-3 pb-2">
        <Link
          href="/"
          className="group/logo flex h-6 items-center pl-1 origin-left transition-transform duration-300 ease-out hover:scale-105"
        >
          <div className="relative h-5 w-[23px] overflow-hidden transition-[width] duration-200 ease-linear group-data-[state=expanded]:w-[50px]">
            <svg
              viewBox="0 0 46.075348 18.370054"
              className="absolute inset-0 h-5 w-auto shrink-0 text-sidebar-foreground"
              fill="currentColor"
            >
              <g transform="translate(-32.954276,94.256831)">
                <path d="M 35.506346,-94.256824 H 32.95428 v 18.370064 h 2.52799 v -14.277127 l 5.970873,7.77658 v 6.500547 h 2.552066 l -0.0036,-7.262271" />
                <path d="m 51.366197,-75.88676 h 2.552066 v -18.370064 h -2.52799 v 14.277127 l -5.970873,-7.77658 v -6.500547 h -2.552066 l 0.0036,7.262271" />
                <path d="m 70.506688,-78.17399 v -16.082834 h -2.52799 v 18.370064 h 11.050929 v -2.28723 z" />
                <path d="m 57.951007,-78.17399 v -16.082834 h -2.527991 v 18.370064 h 11.050929 v -2.28723 z" />
              </g>
            </svg>
            <svg
              viewBox="0 0 46.075348 18.370054"
              className="absolute inset-0 h-5 w-auto shrink-0 text-accent transition-[clip-path] duration-300 ease-out [clip-path:inset(100%_0_0_0)] group-hover/logo:[clip-path:inset(0_0_0_0)]"
              fill="currentColor"
            >
              <g transform="translate(-32.954276,94.256831)">
                <path d="M 35.506346,-94.256824 H 32.95428 v 18.370064 h 2.52799 v -14.277127 l 5.970873,7.77658 v 6.500547 h 2.552066 l -0.0036,-7.262271" />
                <path d="m 51.366197,-75.88676 h 2.552066 v -18.370064 h -2.52799 v 14.277127 l -5.970873,-7.77658 v -6.500547 h -2.552066 l 0.0036,7.262271" />
                <path d="m 70.506688,-78.17399 v -16.082834 h -2.52799 v 18.370064 h 11.050929 v -2.28723 z" />
                <path d="m 57.951007,-78.17399 v -16.082834 h -2.527991 v 18.370064 h 11.050929 v -2.28723 z" />
              </g>
            </svg>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link
                        href={item.url}
                        className="font-mono text-xs"
                        onClick={(e) => {
                          if (isActive) e.preventDefault();
                        }}
                      >
                        <Icon className="!size-3.5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={displayName}
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-sidebar-border bg-sidebar font-mono text-[10px] text-sidebar-foreground">
                    {userInitial}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden">
                      <div className="truncate font-mono text-xs">{displayName}</div>
                      <ChevronsUpDown className="!size-3 shrink-0 text-muted-foreground" />
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                <div className="px-2 py-1.5">
                  <div className="font-mono text-xs font-medium">{displayName}</div>
                  {user?.email && (
                    <div className="font-mono text-[10px] text-muted-foreground">{user.email}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="font-mono text-xs"
                >
                  {theme === "dark" ? <Sun className="!size-3.5" /> : <Moon className="!size-3.5" />}
                  <span>{theme === "dark" ? "light mode" : "dark mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="font-mono text-xs"
                >
                  <Settings className="!size-3.5" />
                  <span>settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="font-mono text-xs"
                >
                  <LogOut className="!size-3.5" />
                  <span>sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
