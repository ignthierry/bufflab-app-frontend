"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PlusCircle, ClipboardList, Sparkles, Tags, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bufflab_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("bufflab_token");
    localStorage.removeItem("bufflab_user");
    router.push("/login");
  };

  if (!isAuthorized) {
    return null; // Return nothing while checking auth to prevent flash of content
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "New Order",
      href: "/orders/new",
      icon: PlusCircle,
    },
    {
      label: "Queue",
      href: "/orders",
      icon: ClipboardList,
    },
    {
      label: "Harga",
      href: "/services",
      icon: Tags,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans pb-20 md:pb-0 md:pl-64">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-zinc-200/80 p-6 z-30">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 bg-brand-secondary/10 rounded-xl border border-brand-secondary/20 text-brand-secondary">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg tracking-tight text-brand-primary">
              BUFFLAB
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
              BOOMS v2.0
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                  isActive
                    ? "bg-brand-secondary/5 text-brand-secondary border-brand-secondary/20 shadow-brand-ambient"
                    : "text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-brand-primary"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center font-bold text-xs text-white">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-brand-primary">Admin Kasir</p>
              <span className="inline-flex items-center gap-1 text-[9px] text-brand-secondary font-bold uppercase tracking-wider mt-0.5">
                ● Live Workshop
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Top Header for Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-secondary/10 rounded-lg border border-brand-secondary/20 text-brand-secondary">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base tracking-tight text-brand-primary">
              BUFFLAB
            </h1>
            <span className="text-[8px] text-zinc-400 uppercase tracking-widest block -mt-1 font-bold">
              BOOMS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[9px] text-brand-secondary font-bold bg-brand-secondary/10 border border-brand-secondary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Surabaya Outlet
          </span>
          <button 
            onClick={handleLogout}
            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-zinc-200/80 px-6 py-2 flex justify-around items-center z-30 shadow-brand-ambient">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-205 ${
                isActive ? "text-brand-secondary scale-105" : "text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive ? "bg-brand-secondary/10 border border-brand-secondary/20" : "bg-transparent"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
