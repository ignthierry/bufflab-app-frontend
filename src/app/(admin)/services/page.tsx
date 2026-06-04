"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Tags, Save, X, Edit2 } from "lucide-react";
import { fetchServices, updateServicePrice, type Service } from "@/lib/api";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchServices();
      setServices(data);
    } catch (err: any) {
      console.error("Failed to load services", err);
      setError(err.message || "Gagal memuat daftar layanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditPrice(service.price.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleSave = async (id: number) => {
    const priceNum = parseInt(editPrice, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Harga tidak valid");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateServicePrice(id, priceNum);
      
      setServices(prev => prev.map(s => 
        s.id === id ? { ...s, price: updated.price } : s
      ));
      
      setEditingId(null);
    } catch (err: any) {
      console.error("Failed to save price", err);
      alert("Gagal menyimpan harga: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-display font-extrabold text-brand-primary flex items-center gap-2">
          <Tags size={24} className="text-brand-secondary" /> Master Harga Layanan
        </h2>
        <p className="text-sm text-zinc-500 font-medium">
          Kelola daftar layanan dan ubah harga cuci sepatu Anda.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-brand-ambient">
            <Loader2 size={32} className="mx-auto text-brand-secondary animate-spin" />
            <p className="text-sm font-bold text-zinc-500">Memuat layanan...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-brand-ambient">
            <div className="p-4 mx-auto max-w-xs space-y-2">
              <p className="text-sm font-bold text-red-600">Gagal Memuat Data</p>
              <p className="text-xs text-red-500">{error}</p>
              <button
                onClick={loadServices}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-2 shadow-brand-ambient">
            <Tags size={32} className="mx-auto text-zinc-350" />
            <p className="text-sm font-bold text-zinc-500">Belum ada layanan</p>
          </div>
        ) : (
          services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-brand-secondary/25 transition-all shadow-brand-ambient flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-brand-primary">
                  {service.service_name}
                </h3>
                <span className="text-[11px] text-zinc-500 font-medium bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-md inline-block">
                  Estimasi: {service.estimated_days} hari
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {editingId === service.id ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">Rp</span>
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full sm:w-32 bg-white border border-brand-secondary/30 focus:border-brand-secondary rounded-xl py-1.5 pl-8 pr-3 text-sm font-bold text-brand-primary outline-none transition-colors"
                        disabled={isSaving}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => handleSave(service.id)}
                      disabled={isSaving}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button 
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
                    <span className="font-mono text-brand-primary font-extrabold text-sm">
                      {formatRupiah(service.price)}
                    </span>
                    <button 
                      onClick={() => startEdit(service)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-brand-secondary/10 border border-zinc-200 hover:border-brand-secondary/30 text-zinc-600 hover:text-brand-secondary text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
