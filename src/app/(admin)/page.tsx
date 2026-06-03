"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  ClipboardList,
  Loader2
} from "lucide-react";
import { fetchDashboardStats, type DashboardStats, type Order } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data dashboard");
      // Fallback mock data for offline/error state
      setStats({
        today_revenue: 0,
        active_queue: 0,
        ready_count: 0,
        completed_today: 0,
        recent_orders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const [greeting, setGreeting] = useState("Selamat Pagi");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Selamat Siang");
    else if (hour >= 17 && hour < 21) setGreeting("Selamat Sore");
    else if (hour >= 21 || hour < 5) setGreeting("Selamat Malam");
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
            Antrean
          </span>
        );
      case "processing":
        return (
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/15 px-2.5 py-0.5 rounded-full">
            Dicuci
          </span>
        );
      case "ready":
        return (
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
            Siap Ambil
          </span>
        );
      default:
        return (
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
            Selesai
          </span>
        );
    }
  };

  const getTimeDiff = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-brand-ambient relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/[0.02] blur-3xl rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-brand-secondary">
            <Sparkles size={16} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Operational Panel</span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-extrabold text-brand-primary">
            {greeting}, Admin!
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 font-medium">
            Yuk catat & pantau antrean pengerjaan sepatu pelanggan dengan presisi hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <Link
            href="/orders/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-secondary hover:bg-brand-accent active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient"
          >
            <PlusCircle size={14} />
            Order Baru
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
          <span>⚠️ {error}</span>
          <button onClick={loadStats} className="ml-auto text-red-700 font-bold underline">Coba Lagi</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-brand-ambient">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pendapatan Hari Ini</span>
            <div className="p-2 bg-brand-secondary/5 text-brand-secondary rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-brand-primary">
              {loading ? <Loader2 size={20} className="animate-spin" /> : formatRupiah(stats?.today_revenue || 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-brand-ambient">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Antrean Workshop</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-brand-primary">
              {loading ? <Loader2 size={20} className="animate-spin" /> : `${stats?.active_queue || 0} Pasang`}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-brand-ambient">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Siap Ambil (Ready)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-brand-primary">
              {loading ? <Loader2 size={20} className="animate-spin" /> : `${stats?.ready_count || 0} Pasang`}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-brand-ambient">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selesai Hari Ini</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-brand-primary">
              {loading ? <Loader2 size={20} className="animate-spin" /> : `${stats?.completed_today || 0} Pasang`}
            </h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/orders/new" 
          className="group flex items-center justify-between p-5 bg-white hover:bg-zinc-50/50 rounded-2xl border border-zinc-200/80 hover:border-brand-secondary/25 transition-all duration-200 shadow-brand-ambient"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-secondary/5 text-brand-secondary rounded-xl group-hover:scale-105 transition-transform duration-200">
              <PlusCircle size={22} />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-brand-primary">Terima Sepatu Baru</h4>
              <p className="text-xs text-zinc-500">Input order, foto kondisi awal, & invoice</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/orders" 
          className="group flex items-center justify-between p-5 bg-white hover:bg-zinc-50/50 rounded-2xl border border-zinc-200/80 hover:border-brand-secondary/25 transition-all duration-200 shadow-brand-ambient"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-secondary/5 text-brand-secondary rounded-xl group-hover:scale-105 transition-transform duration-200">
              <ClipboardList size={22} />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-brand-primary">Daftar Antrean Cuci</h4>
              <p className="text-xs text-zinc-500">Update status, cari customer, cetak WA</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-brand-ambient">
        <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/40">
          <div>
            <h3 className="font-display font-bold text-sm text-brand-primary">Order Terkini</h3>
            <p className="text-xs text-zinc-500">Update pengerjaan workshop terakhir</p>
          </div>
          <Link 
            href="/orders" 
            className="text-xs font-bold uppercase tracking-wider text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-brand-secondary" />
            </div>
          ) : stats?.recent_orders && stats.recent_orders.length > 0 ? (
            stats.recent_orders.map((order: Order) => (
              <div 
                key={order.id} 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-450 font-mono tracking-wider">
                      {order.invoice_number}
                    </span>
                    {getStatusBadge(order.order_status)}
                  </div>
                  <h4 className="font-bold text-brand-primary text-sm">
                    {order.customer?.name || "Customer"}
                  </h4>
                  <p className="text-xs text-zinc-550">
                    {order.items?.map(i => `${i.brand} ${i.model || ""}`).join(", ")}
                    {order.items?.[0]?.service && (
                      <span className="text-zinc-400"> • {order.items[0].service.service_name}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                    {getTimeDiff(order.created_at)}
                  </span>
                  <Link
                    href={`/invoice/${order.invoice_number}`}
                    className="px-4 py-2 bg-white hover:bg-zinc-50 text-brand-primary hover:text-brand-secondary font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-zinc-200 shadow-sm"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-zinc-400">
              Belum ada order hari ini. Mulai terima sepatu baru!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
