"use client";

import {
  ChefHat,
  ExternalLink,
  FileDown,
  History,
  Laptop,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCircle,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Your Orders", href: "/orders", icon: History },
  { name: "Top Places", href: "/restaurants", icon: ChefHat },
  { name: "Export", href: "/export", icon: FileDown },
  { name: "Accounts", href: "/accounts", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* ... Mobile Mobile Toggle remain same ... */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-lg bg-background"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen transition-all border-r bg-background/50 backdrop-blur-xl lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full px-4 py-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="size-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">Foodly</h2>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 transition-colors">
                Intelligence
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto pt-6 space-y-4">
            <div className="flex items-center justify-between px-2 text-[10px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50">
                <button
                  type="button"
                  onClick={() => {
                    const modes = ["light", "dark", "system"];
                    const next =
                      modes[
                        (modes.indexOf(theme as string) + 1) % modes.length
                      ];
                    // biome-ignore lint/suspicious/noExplicitAny: Dynamic theme cycling
                    setTheme(next as any);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                  title={`Current: ${theme}. Click to cycle.`}
                >
                  {theme === "light" && <Sun className="size-3.5" />}
                  {theme === "dark" && <Moon className="size-3.5" />}
                  {theme === "system" && <Laptop className="size-3.5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/accounts"
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="Settings"
                >
                  <Settings className="size-4" />
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="GitHub"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
