"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Smartphone, 
  MessageSquare, 
  Check, 
  Play, 
  CheckCircle2, 
  ExternalLink,
  Filter,
  Loader2,
  Camera,
  Trash2,
  X
} from "lucide-react";
import { fetchOrders, updateOrderStatus, updateOrderPayment, getWhatsAppLink, getPhotoUrl, type Order as ApiOrder } from "@/lib/api";

export default function OrdersQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [notificationTrigger, setNotificationTrigger] = useState<{
    show: boolean;
    whatsapp: string;
    message: string;
  } | null>(null);

  // Ready Modal states
  const [readyModalOrder, setReadyModalOrder] = useState<ApiOrder | null>(null);
  const [afterPhotos, setAfterPhotos] = useState<Record<number, string[]>>({});
  const readyFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadItemId, setActiveUploadItemId] = useState<number | null>(null);

  // --- Fetch orders from API ---
  const loadOrders = useCallback(async (status?: string, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOrders({
        status: status || undefined,
        search: search || undefined,
      });
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load orders", err);
      setError(err.message || "Gagal memuat daftar antrean");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders(activeFilter, searchQuery);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filter changes
  useEffect(() => {
    loadOrders(activeFilter, searchQuery);
  }, [activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadOrders(activeFilter, value);
    }, 300);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleStatusChange = async (id: number, newStatus: ApiOrder["order_status"], additionalItemsData?: any[]) => {
    try {
      const updatedOrder = await updateOrderStatus(id, newStatus, additionalItemsData);

      setOrders(prev => prev.map(order => {
        if (order.id === id) {
          const merged = { ...order, ...updatedOrder, order_status: newStatus };

          if (newStatus === "ready") {
            const customerName = merged.customer?.name || "Customer";
            const shoeDesc = merged.items && merged.items.length > 0
              ? merged.items.map((i: any) => `${i.brand} ${i.model || ""} (${i.color})`).join(", ")
              : "sepatu Anda";
            const whatsapp = merged.customer?.whatsapp_number || "";
            const sisaBayar = merged.total_price - merged.amount_paid;
            const msg = `Kabar baik *${customerName}*! Sepatu kesayangan Anda (*${shoeDesc}*) telah selesai kami rawat. ✨\n` +
              `🧾 No. Invoice: *${merged.invoice_number}*\n` +
              `Sekarang sepatu Anda sudah bersih, segar, dan siap diambil. Silakan melakukan pengambilan di outlet Bufflab Surabaya pada jam operasional.\n` +
              `*Catatan: Sisa tagihan yang harus dibayar saat pengambilan adalah ${formatRupiah(sisaBayar)}.*\n` +
              `Sampai jumpa di outlet! 📲`;
            setNotificationTrigger({
              show: true,
              whatsapp,
              message: msg
            });
          }

          return merged;
        }
        return order;
      }));
    } catch (err: any) {
      console.error("Failed to update status", err);
      alert("Gagal mengubah status: " + (err.message || "Terjadi kesalahan"));
    }
  };
  // --- Camera Logic for After Photos ---
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || activeUploadItemId === null) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 800;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          
          setAfterPhotos(prev => {
            const existing = prev[activeUploadItemId] || [];
            if (existing.length >= 3) {
              alert("Maksimal 3 foto per sepatu.");
              return prev;
            }
            return {
              ...prev,
              [activeUploadItemId]: [...existing, base64]
            };
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (readyFileInputRef.current) {
      readyFileInputRef.current.value = "";
    }
  };

  const triggerAfterPhotoUpload = (itemId: number) => {
    setActiveUploadItemId(itemId);
    readyFileInputRef.current?.click();
  };

  const handleRemoveAfterPhoto = (itemId: number, photoIndex: number) => {
    setAfterPhotos(prev => {
      const existing = prev[itemId] || [];
      const newPhotos = [...existing];
      newPhotos.splice(photoIndex, 1);
      return { ...prev, [itemId]: newPhotos };
    });
  };

  const submitReadyModal = async () => {
    if (!readyModalOrder) return;
    
    // Validasi: Pastikan setidaknya ada 1 foto untuk setiap item
    if (readyModalOrder.items) {
      for (const item of readyModalOrder.items) {
        const photos = afterPhotos[item.id] || [];
        if (photos.length === 0) {
          alert(`Harap unggah minimal 1 foto sesudah cuci untuk sepatu ${item.brand} ${item.model || ''}`);
          return;
        }
      }
    }

    const payloadItems = readyModalOrder.items?.map(item => ({
      id: item.id,
      after_photo_base64_array: afterPhotos[item.id] || []
    })) || [];

    await handleStatusChange(readyModalOrder.id, "ready", payloadItems);
    setReadyModalOrder(null);
    setAfterPhotos({});
  };

  const handlePaymentChange = async (id: number, newStatus: ApiOrder["payment_status"], amountPaid: number) => {
    try {
      const updatedOrder = await updateOrderPayment(id, {
        payment_status: newStatus,
        amount_paid: amountPaid,
      });

      setOrders(prev => prev.map(order => {
        if (order.id === id) {
          return { ...order, ...updatedOrder };
        }
        return order;
      }));
    } catch (err: any) {
      console.error("Failed to update payment status", err);
      alert("Gagal mengubah status pembayaran: " + (err.message || "Terjadi kesalahan"));
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusVisual = (status: ApiOrder["order_status"]) => {
    switch (status) {
      case "pending":
        return { label: "Antrean", color: "text-amber-705 bg-amber-50 border-amber-200" };
      case "processing":
        return { label: "Dicuci", color: "text-brand-secondary bg-brand-secondary/5 border-brand-secondary/20" };
      case "ready":
        return { label: "Siap Ambil", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
      case "completed":
        return { label: "Selesai", color: "text-zinc-550 bg-zinc-50 border-zinc-200" };
      default:
        return { label: "Batal", color: "text-red-700 bg-red-50 border-red-200" };
    }
  };

  const getPaymentBadge = (status: ApiOrder["payment_status"], amountPaid: number, total: number) => {
    switch (status) {
      case "paid":
        return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Lunas</span>;
      case "partial":
        return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">DP {formatRupiah(amountPaid)}</span>;
      default:
        return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-mono">Belum Bayar</span>;
    }
  };

  const getTimeDiff = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} hari lalu`;
    if (diffHours > 0) return `${diffHours} jam lalu`;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) return `${diffMinutes} menit lalu`;
    return "Baru saja";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-extrabold text-brand-primary">
          Daftar Antrean Sepatu
        </h2>

        {/* Custom Mobile Input Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama, No. WA, atau Invoice..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 hover:border-zinc-350 focus:border-brand-secondary text-sm rounded-lg pl-10 pr-4 py-2.5 text-brand-primary outline-none transition-colors placeholder:text-zinc-400 font-medium"
          />
        </div>

        {/* Filter Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "pending", label: "Antrean" },
            { id: "processing", label: "Dicuci" },
            { id: "ready", label: "Siap Ambil" },
            { id: "completed", label: "Selesai" },
            { id: "all", label: "Semua" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border uppercase tracking-wider ${
                activeFilter === tab.id
                  ? "bg-brand-secondary/5 text-brand-secondary border-brand-secondary/35"
                  : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-brand-ambient">
            <Loader2 size={32} className="mx-auto text-brand-secondary animate-spin" />
            <p className="text-sm font-bold text-zinc-500">Memuat antrean...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-brand-ambient">
            <div className="p-4 mx-auto max-w-xs space-y-2">
              <p className="text-sm font-bold text-red-600">Gagal Memuat Data</p>
              <p className="text-xs text-red-500">{error}</p>
              <button
                onClick={() => loadOrders(activeFilter, searchQuery)}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl space-y-2 shadow-brand-ambient">
            <Filter size={32} className="mx-auto text-zinc-350" />
            <p className="text-sm font-bold text-zinc-500">Tidak ada antrean ditemukan</p>
            <p className="text-xs text-zinc-400 font-medium">Coba ubah kata kunci pencarian Anda</p>
          </div>
        ) : (
          orders.map((order) => {
            const visual = getStatusVisual(order.order_status);
            const customerName = order.customer?.name || "Unknown";
            const whatsapp = order.customer?.whatsapp_number || "";
            const firstItem = order.items?.[0];
            const shoeDesc = firstItem ? `${firstItem.brand} ${firstItem.model || ""} (${firstItem.color})` : "-";
            const serviceDesc = order.items?.map(i => i.service?.service_name).filter(Boolean).join(", ") || "-";
            return (
              <div 
                key={order.id} 
                className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 hover:border-brand-secondary/25 transition-all shadow-brand-ambient"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-wider block">
                      {order.invoice_number}
                    </span>
                    <h3 className="font-bold text-sm text-brand-primary">
                      {customerName}
                    </h3>
                    <span className="text-[9px] text-zinc-400 font-medium">{getTimeDiff(order.created_at)}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${visual.color}`}>
                    {visual.label}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 text-xs text-zinc-600 shadow-inner">
                  <div className="flex justify-between">
                    <span className="font-bold text-brand-primary">{shoeDesc}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-450 font-medium">
                    <span>Layanan: {serviceDesc}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200">
                    <span>Total tagihan: <strong className="text-brand-primary font-mono font-bold">{formatRupiah(order.total_price)}</strong></span>
                    {getPaymentBadge(order.payment_status, order.amount_paid, order.total_price)}
                  </div>
                </div>

                {/* Actions Toggles for admin (Mobile touch targets) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-150 pt-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-450 font-medium">
                    <Smartphone size={12} className="text-zinc-400" />
                    <span>WA: {whatsapp}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/invoice/${order.invoice_number}`}
                      className="flex-1 sm:flex-initial text-center px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-brand-primary text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-colors bg-white"
                    >
                      Invoice
                    </Link>

                    {order.payment_status !== "paid" && (
                      <button
                        onClick={() => handlePaymentChange(order.id, "paid", order.total_price)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient active:scale-95 border border-emerald-600"
                      >
                        💵 Tandai Lunas
                      </button>
                    )}

                    {order.order_status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "processing")}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-secondary hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient active:scale-95"
                      >
                        <Play size={10} fill="currentColor" /> Mulai Cuci
                      </button>
                    )}

                    {order.order_status === "processing" && (
                      <button
                        onClick={() => {
                          setReadyModalOrder(order);
                          setAfterPhotos({});
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-secondary hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient active:scale-95"
                      >
                        <Check size={12} /> Set Siap Ambil
                      </button>
                    )}

                    {order.order_status === "ready" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "completed")}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient active:scale-95 border border-brand-primary"
                      >
                        <CheckCircle2 size={12} /> Diambil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Toast Trigger (Simulated WA Gateway Notification box) */}
      {notificationTrigger && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-brand-secondary/30 rounded-2xl p-5 shadow-brand-ambient z-50 animate-slide-up space-y-3.5 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-secondary flex items-center gap-1.5">
              <MessageSquare size={14} /> WhatsApp Gateway (M5 Auto-Sent)
            </span>
            <button 
              onClick={() => setNotificationTrigger(null)}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-brand-primary bg-zinc-50 border border-zinc-200 px-2 py-1 rounded"
            >
              Tutup
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Tujuan WhatsApp:</span>
            <span className="font-mono text-brand-primary font-bold">{notificationTrigger.whatsapp}</span>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Isi Pesan Notifikasi:</span>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-mono text-zinc-650 leading-relaxed whitespace-pre-wrap shadow-inner">
              {notificationTrigger.message}
            </div>
          </div>

          <div className="flex gap-2">
            <a 
              href={getWhatsAppLink(notificationTrigger.whatsapp, notificationTrigger.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2 bg-brand-secondary hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              Kirim Notifikasi WA Manual <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
      {/* Ready Modal for Uploading After Photos */}
      {readyModalOrder && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-brand-ambient animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-150 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-brand-primary">Foto Sesudah Cuci</h3>
                <p className="text-xs text-zinc-500 font-medium">No. Invoice: {readyModalOrder.invoice_number}</p>
              </div>
              <button 
                onClick={() => setReadyModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {readyModalOrder.items?.map((item, idx) => {
                const photos = afterPhotos[item.id] || [];
                return (
                  <div key={item.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-brand-primary">#{idx + 1} {item.brand} {item.model}</span>
                      {photos.length < 3 && (
                        <button
                          onClick={() => triggerAfterPhotoUpload(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white text-brand-secondary font-bold text-[10px] uppercase rounded-lg border border-zinc-200 hover:border-brand-secondary/50 shadow-sm transition-colors"
                        >
                          <Camera size={12} /> Tambah Foto
                        </button>
                      )}
                    </div>
                    
                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative group border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <img src={photo} alt="Setelah cuci" className="w-full h-24 object-cover" />
                            <button
                              onClick={() => handleRemoveAfterPhoto(item.id, pIdx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        onClick={() => triggerAfterPhotoUpload(item.id)}
                        className="flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-brand-secondary cursor-pointer py-6 bg-white border border-dashed border-zinc-300 rounded-xl transition-colors"
                      >
                        <Camera size={20} />
                        <span className="text-[10px] font-medium">Klik untuk upload foto (Wajib)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={submitReadyModal}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary hover:bg-brand-accent active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient"
              >
                Simpan & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input for after photos */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={readyFileInputRef} 
        onChange={handleAfterPhotoUpload}
        className="hidden" 
      />
    </div>
  );
}
