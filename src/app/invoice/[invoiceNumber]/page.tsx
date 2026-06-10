"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  Sparkles, 
  Check, 
  Smartphone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Shirt,
  ImageIcon,
  Loader2,
  ExternalLink,
  X
} from "lucide-react";
import { fetchInvoice, getPhotoUrl, getWhatsAppLink, type Order } from "@/lib/api";

export default function PublicInvoice() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceNumber) return;
    loadInvoice();
  }, [invoiceNumber]);

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoice(invoiceNumber);
      setOrder(data);
    } catch (e: any) {
      setError(e.message || "Invoice tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-brand-primary">
        <Loader2 size={32} className="animate-spin text-brand-secondary" />
        <p className="text-xs text-zinc-550 mt-4 font-bold uppercase tracking-wider">Memuat Invoice Digital...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-brand-primary space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h3 className="font-display font-extrabold text-lg">Invoice Tidak Ditemukan</h3>
        <p className="text-sm text-zinc-500 max-w-xs font-medium">
          {error || "Periksa kembali tautan yang Anda terima atau hubungi Admin Bufflab Clean Shoes."}
        </p>
        <button 
          onClick={loadInvoice}
          className="text-xs font-bold text-brand-secondary underline"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const totalBill = Number(order.total_price) || 0;
  const amountPaid = Number(order.amount_paid) || 0;
  const remainingBalance = totalBill - amountPaid;

  const statuses = [
    { key: "pending", title: "Diterima", desc: "Sepatu masuk antrean" },
    { key: "processing", title: "Dicuci", desc: "Penanganan di workshop" },
    { key: "ready", title: "Siap Ambil", desc: "Pengerjaan selesai" },
    { key: "completed", title: "Selesai", desc: "Sudah diambil customer" }
  ];

  const getStatusIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return statuses.findIndex(s => s.key === status);
  };

  const currentStatusIdx = getStatusIndex(order.order_status);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Digital Receipt Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 relative overflow-hidden shadow-brand-ambient">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-secondary to-brand-accent"></div>

          {/* Shop Header */}
          <div className="flex justify-between items-start pb-6 border-b border-zinc-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="relative w-10 h-10">
                  <Image 
                    src="/logo.png" 
                    alt="Bufflab Logo" 
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
                <h1 className="font-display font-black text-2xl text-brand-primary tracking-tight">BUFFLAB</h1>
              </div>
              <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Surabaya Shoecare Specialist</p>
            </div>
            
            <span className="text-[9px] text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/15 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Invoice Digital
            </span>
          </div>

          {/* Invoice Info Details */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-zinc-150 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-450 block font-bold uppercase tracking-wider text-[9px]">Nomor Invoice</span>
              <span className="font-bold text-brand-primary font-mono text-sm">{order.invoice_number}</span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-450 block font-bold uppercase tracking-wider text-[9px]">Tanggal Terima</span>
              <span className="font-semibold text-zinc-600 flex items-center gap-1">
                <Calendar size={12} className="text-zinc-400" /> {formatDate(order.created_at)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-450 block font-bold uppercase tracking-wider text-[9px]">Pelanggan</span>
              <span className="font-bold text-brand-primary">{order.customer?.name || "-"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-450 block font-bold uppercase tracking-wider text-[9px]">No. WhatsApp</span>
              <span className="font-semibold text-zinc-650 flex items-center gap-1">
                <Smartphone size={12} className="text-zinc-400" /> {order.customer?.whatsapp_number || "-"}
              </span>
            </div>
          </div>

          {/* Status Tracker Timeline */}
          <div className="py-6 border-b border-zinc-150">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-5">Status Pengerjaan Sepatu</h4>
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-150">
              {statuses.map((step, idx) => {
                const isCompleted = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <span 
                      className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-bold transition-all ${
                        isCompleted 
                          ? "bg-brand-secondary text-white border-brand-secondary shadow-sm" 
                          : "bg-white text-zinc-400 border-zinc-200"
                      }`}
                    >
                      {isCompleted ? <Check size={12} /> : idx + 1}
                    </span>

                    <div className="space-y-0.5 animate-fade-in">
                      <h5 
                        className={`text-xs font-bold transition-colors font-display ${
                          isCurrent ? "text-brand-secondary" : isCompleted ? "text-brand-primary" : "text-zinc-400"
                        }`}
                      >
                        {step.title}
                        {isCurrent && (
                          <span className="ml-2 inline-flex w-1.5 h-1.5 bg-brand-secondary rounded-full animate-ping" />
                        )}
                      </h5>
                      <p className="text-[10px] text-zinc-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shoes and Conditions */}
          <div className="py-6 border-b border-zinc-150 space-y-4">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Sepatu & Kondisi Fisik</h4>
            
            <div className="space-y-4">
              {order.items?.map((item, idx) => {
                const photoUrl = getPhotoUrl(item.photo_path);
                return (
                  <div key={item.id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-xs font-bold text-brand-primary">
                      <span className="flex items-center gap-1.5">
                        <Shirt size={14} className="text-brand-secondary" /> Sepatu #{idx + 1}: {item.brand} {item.model || ""}
                      </span>
                      {item.size && (
                        <span className="text-[9px] bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-550 font-mono">
                          Size {item.size}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-bold">Warna & Bahan</span>
                          <span className="font-bold text-zinc-650">{item.color} • {item.material}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-bold">Layanan</span>
                          <span className="font-bold text-brand-secondary">{item.service?.service_name || "-"}</span>
                        </div>
                      </div>
                      
                      {item.initial_condition_notes && (
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-bold">Catatan Kondisi</span>
                          <p className="text-zinc-550 italic font-medium leading-relaxed">
                            &ldquo;{item.initial_condition_notes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-200/60 space-y-4">
                      <div>
                        <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-bold mb-2">Foto Sebelum Cuci</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {item.photo_paths && item.photo_paths.length > 0 ? (
                            item.photo_paths.map((p, i) => (
                              <img 
                                key={i} 
                                src={getPhotoUrl(p) || ""} 
                                alt="Sebelum cuci" 
                                className="w-24 h-24 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setSelectedImage(getPhotoUrl(p) || "")}
                              />
                            ))
                          ) : photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={`${item.brand} sebelum cuci`} 
                              className="w-24 h-24 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => setSelectedImage(photoUrl)}
                            />
                          ) : (
                            <div className="w-24 h-24 border border-zinc-200 rounded-xl flex items-center justify-center bg-white shrink-0 text-zinc-350 shadow-sm">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                      </div>

                      {item.after_photo_paths && item.after_photo_paths.length > 0 && (
                        <div>
                          <span className="text-brand-secondary block text-[9px] uppercase tracking-wider font-bold mb-2">Foto Sesudah Cuci ✨</span>
                          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {item.after_photo_paths.map((p, i) => (
                              <img 
                                key={i} 
                                src={getPhotoUrl(p) || ""} 
                                alt="Sesudah cuci" 
                                className="w-24 h-24 object-cover rounded-xl border border-zinc-200 shrink-0 shadow-sm ring-1 ring-brand-secondary/20 cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setSelectedImage(getPhotoUrl(p) || "")}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Billing Details */}
          <div className="pt-6 space-y-4 text-xs">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rincian Pembayaran</h4>
            
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-2.5 shadow-inner">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-zinc-500 font-medium">
                  <span>{item.service?.service_name || "Layanan"} — {item.brand} {item.model || ""}</span>
                  <span className="font-mono text-brand-primary font-bold">{formatRupiah(Number(item.service?.price || 0))}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-brand-primary">
                <span>Total Biaya</span>
                <span className="font-mono">{formatRupiah(totalBill)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-zinc-450 font-bold uppercase tracking-wider">
                <span>Sudah Dibayar ({order.payment_status === "paid" ? "Lunas" : order.payment_status === "partial" ? "DP" : "Belum Bayar"})</span>
                <span className="font-mono text-zinc-650">{formatRupiah(amountPaid)}</span>
              </div>

              {remainingBalance > 0 && (
                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-red-650">
                  <span>Sisa Tagihan</span>
                  <span className="font-mono text-base">{formatRupiah(remainingBalance)}</span>
                </div>
              )}

              {remainingBalance <= 0 && (
                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-emerald-600">
                  <span>Sisa Tagihan</span>
                  <span className="text-[9px] uppercase tracking-widest bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full font-bold">LUNAS</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Contact Button */}
        {order.customer?.whatsapp_number && order.order_status === "ready" && remainingBalance > 0 && (
          <a
            href={getWhatsAppLink(
              order.customer.whatsapp_number,
              `Halo Admin Bufflab, saya ${order.customer.name} ingin mengambil sepatu saya. No. Invoice: ${order.invoice_number}. Terima kasih!`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-3 bg-brand-secondary hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-brand-ambient"
          >
            <ExternalLink size={14} /> Hubungi Bufflab via WhatsApp
          </a>
        )}

        {/* Footer */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl text-center text-[10px] text-zinc-500 space-y-2 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-brand-primary">
            <MapPin size={12} className="text-brand-secondary" />
            <span className="font-bold uppercase tracking-wider">BUFFLAB CLEAN SHOES - SURABAYA OUTLET</span>
          </div>
          <p className="leading-relaxed font-medium text-zinc-450">
            Harap tunjukkan link invoice digital ini kepada kasir kami saat melakukan pengambilan sepatu. 
            Terima kasih atas kepercayaan Anda! ✨
          </p>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-zinc-300 p-2 bg-black/50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
