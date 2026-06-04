"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  User, 
  Smartphone, 
  Sparkles, 
  Trash2, 
  Plus, 
  Camera, 
  CreditCard, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ClipboardCheck,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { fetchServices, createOrder, getWhatsAppLink, type Service, type CreateOrderPayload } from "@/lib/api";

interface ShoeItem {
  id: string;
  brand: string;
  model: string;
  color: string;
  material: string;
  size: string;
  conditionNotes: string;
  photoBase64: string; // Compressed
  photoStats: { originalSizeKb: number; compressedSizeKb: number } | null;
  serviceId: number;
}

export default function NewOrder() {
  const [step, setStep] = useState(1);
  
  // Services from API
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Items in this order
  const [items, setItems] = useState<ShoeItem[]>([]);
  
  // Payment info
  const [amountPaid, setAmountPaid] = useState<string>("0");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "partial" | "paid">("unpaid");

  // Success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemPhotoIndex, setActiveItemPhotoIndex] = useState<string | null>(null);

  // --- Fetch services from API on mount ---
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const services = await fetchServices();
        setAvailableServices(services);
      } catch (err: any) {
        console.error("Failed to load services", err);
        setServicesError(err.message || "Gagal memuat daftar layanan");
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  // --- UAT-04: AntiGravity State (Local Storage Draft Save) ---
  useEffect(() => {
    // Load drafts on mount
    const savedDraft = localStorage.getItem("booms_order_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
        if (parsed.items) setItems(parsed.items);
        if (parsed.amountPaid) setAmountPaid(parsed.amountPaid);
        if (parsed.paymentStatus) setPaymentStatus(parsed.paymentStatus);
        if (parsed.step) setStep(parsed.step);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  // Save draft whenever state changes
  useEffect(() => {
    const draft = {
      customerName,
      whatsappNumber,
      items,
      amountPaid,
      paymentStatus,
      step
    };
    localStorage.setItem("booms_order_draft", JSON.stringify(draft));
  }, [customerName, whatsappNumber, items, amountPaid, paymentStatus, step]);

  const clearDraft = () => {
    localStorage.removeItem("booms_order_draft");
    setCustomerName("");
    setWhatsappNumber("");
    setItems([]);
    setAmountPaid("0");
    setPaymentStatus("unpaid");
    setStep(1);
  };

  // --- UAT-01: WhatsApp Auto-formatting ---
  const handleWhatsappBlur = () => {
    let num = whatsappNumber.trim();
    if (!num) return;

    if (num.startsWith("0")) {
      num = "62" + num.slice(1);
    } else if (num.startsWith("+")) {
      num = num.slice(1);
      if (num.startsWith("0")) {
        num = "62" + num.slice(1);
      }
    } else if (!num.startsWith("62") && num.length > 5) {
      num = "62" + num;
    }

    num = num.replace(/\D/g, "");
    setWhatsappNumber(num);
  };

  // --- UAT-02: Camera Capture & Image Auto-Compression ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeItemPhotoIndex) return;

    const file = files[0];
    const originalSizeKb = Math.round(file.size / 1024);

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
          
          const head = "data:image/jpeg;base64,".length;
          const compressedSizeKb = Math.round(((base64.length - head) * 3) / 4 / 1024);

          setItems(prev => prev.map(item => {
            if (item.id === activeItemPhotoIndex) {
              return {
                ...item,
                photoBase64: base64,
                photoStats: { originalSizeKb, compressedSizeKb }
              };
            }
            return item;
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoUpload = (itemId: string) => {
    setActiveItemPhotoIndex(itemId);
    fileInputRef.current?.click();
  };

  const totalBill = items.reduce((sum, item) => {
    const service = availableServices.find(s => s.id === item.serviceId);
    return sum + (service ? service.price : 0);
  }, 0);

  const parsedAmountPaid = parseFloat(amountPaid.replace(/[^0-9]/g, "")) || 0;
  const changeOrDebt = totalBill - parsedAmountPaid;

  const handleAddShoe = () => {
    const defaultServiceId = availableServices.length > 0 ? availableServices[0].id : 1;
    const newItem: ShoeItem = {
      id: Math.random().toString(36).substr(2, 9),
      brand: "",
      model: "",
      color: "",
      material: "Canvas",
      size: "",
      conditionNotes: "",
      photoBase64: "",
      photoStats: null,
      serviceId: defaultServiceId,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, fields: Partial<ShoeItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...fields } : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePaymentStatusClick = (status: "unpaid" | "partial" | "paid") => {
    setPaymentStatus(status);
    if (status === "paid") {
      setAmountPaid(totalBill.toString());
    } else if (status === "unpaid") {
      setAmountPaid("0");
    }
  };

  const handleFormSubmit = async () => {
    if (!customerName.trim() || !whatsappNumber.trim()) {
      alert("Harap lengkapi nama dan nomor WhatsApp customer!");
      setStep(1);
      return;
    }
    if (items.length === 0) {
      alert("Harap tambahkan minimal 1 sepatu!");
      setStep(2);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload: CreateOrderPayload = {
        customer: { name: customerName, whatsapp_number: whatsappNumber },
        order_details: { amount_paid: parsedAmountPaid, payment_status: paymentStatus },
        items: items.map(item => ({
          service_id: item.serviceId,
          brand: item.brand,
          model: item.model,
          color: item.color,
          material: item.material,
          size: item.size ? parseInt(item.size) : null,
          initial_condition_notes: item.conditionNotes,
          photo_base64: item.photoBase64,
        }))
      };
      const result = await createOrder(payload);
      setCreatedInvoice(result.invoice_number);
      localStorage.removeItem("booms_order_draft");
    } catch (err: any) {
      console.error("Failed to create order", err);
      alert("Gagal membuat order: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Loading state for services
  if (servicesLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 size={32} className="animate-spin text-brand-secondary" />
        <p className="text-sm font-bold text-zinc-500">Memuat daftar layanan...</p>
      </div>
    );
  }

  // Error state for services
  if (servicesError) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 max-w-sm w-full">
          <p className="text-sm font-bold text-red-600">Gagal Memuat Layanan</p>
          <p className="text-xs text-red-500">{servicesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <h2 className="text-lg font-display font-extrabold text-brand-primary">
          Terima Sepatu Baru
        </h2>
        <span className="text-[10px] font-bold text-brand-secondary bg-brand-secondary/10 border border-brand-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Langkah {step} dari 3
        </span>
      </div>

      {/* Steps Visual Indicator */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            onClick={() => items.length > 0 || s <= step ? setStep(s) : null}
            className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
              step >= s 
                ? "bg-brand-secondary shadow-sm" 
                : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      {/* Hidden photo input file element */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef} 
        onChange={handlePhotoUpload}
        className="hidden" 
      />

      {/* --- STEP 1: CUSTOMER DETAILS --- */}
      {step === 1 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-brand-ambient animate-fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-150">
            <div className="p-2 bg-brand-secondary/5 text-brand-secondary rounded-lg">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-brand-primary">Profil Pelanggan</h3>
              <p className="text-xs text-zinc-500 font-medium">Nomor WhatsApp sebagai pencatatan riwayat unik</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Nomor WhatsApp Customer *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Smartphone size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  onBlur={handleWhatsappBlur}
                  className="w-full bg-white border border-zinc-200 hover:border-zinc-350 focus:border-brand-secondary text-sm rounded-lg pl-10 pr-4 py-2.5 text-brand-primary outline-none transition-all placeholder:text-zinc-400 font-medium"
                />
              </div>
              <p className="text-[9px] text-zinc-400 font-medium italic">
                UAT-01: Masukkan '08' untuk otomatis diubah menjadi format '628' saat blur.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Nama Lengkap Customer *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Masukkan nama customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 hover:border-zinc-350 focus:border-brand-secondary text-sm rounded-lg pl-10 pr-4 py-2.5 text-brand-primary outline-none transition-all placeholder:text-zinc-400 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between gap-4">
            <button
              onClick={clearDraft}
              className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-brand-primary text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Reset Draft
            </button>
            <button
              onClick={() => {
                if (customerName.trim() && whatsappNumber.trim()) setStep(2);
                else alert("Harap lengkapi nama dan WA customer!");
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-secondary hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient"
            >
              Lanjutkan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 2: SHOE ITEMS DETAILS --- */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 relative shadow-brand-ambient">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                <span className="text-xs font-bold text-brand-secondary uppercase tracking-widest flex items-center gap-1.5 font-display">
                  <Sparkles size={14} /> Sepatu #{idx + 1}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-zinc-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Photo Upload Container */}
              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-2xl p-4 bg-zinc-50/50 relative overflow-hidden group">
                {item.photoBase64 ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <img 
                      src={item.photoBase64} 
                      alt="Kondisi awal sepatu" 
                      className="max-h-48 object-contain rounded-xl border border-zinc-200"
                    />
                    <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>Asli: {item.photoStats?.originalSizeKb} KB</span>
                      <span className="text-brand-secondary">Kompresi: {item.photoStats?.compressedSizeKb} KB</span>
                    </div>
                    <button
                      onClick={() => triggerPhotoUpload(item.id)}
                      className="mt-1.5 flex items-center gap-1 px-3 py-1.5 bg-white text-zinc-650 font-bold text-xs uppercase rounded-lg border border-zinc-200 hover:text-brand-primary shadow-sm"
                    >
                      <Camera size={12} /> Ambil Ulang Foto
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => triggerPhotoUpload(item.id)}
                    className="flex flex-col items-center gap-2 text-zinc-550 hover:text-brand-secondary cursor-pointer py-4"
                  >
                    <div className="p-3 bg-white border border-zinc-200 rounded-2xl text-brand-secondary shadow-sm group-hover:scale-105 transition-transform">
                      <Camera size={22} />
                    </div>
                    <span className="text-xs font-bold">Foto Kondisi Fisik Sepatu *</span>
                    <p className="text-[10px] text-zinc-400 font-medium text-center max-w-[280px]">
                      UAT-02: Sistem otomatis memperkecil & mengkompresi gambar sebelum dikirim.
                    </p>
                  </div>
                )}
              </div>

              {/* Shoe Attributes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Brand *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Nike, Adidas"
                    value={item.brand}
                    onChange={(e) => handleUpdateItem(item.id, { brand: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Model/Seri *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jordan 1, Ultraboost"
                    value={item.model}
                    onChange={(e) => handleUpdateItem(item.id, { model: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Warna *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Putih, Hitam-Merah"
                    value={item.color}
                    onChange={(e) => handleUpdateItem(item.id, { color: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Ukuran (Size)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 42"
                    value={item.size}
                    onChange={(e) => handleUpdateItem(item.id, { size: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Bahan Utama (Material) *</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["Canvas", "Suede", "Leather", "Knit", "Mesh", "Nubuck"].map((mat) => (
                      <button
                        key={mat}
                        onClick={() => handleUpdateItem(item.id, { material: mat })}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                          item.material === mat
                            ? "bg-brand-secondary/5 text-brand-secondary border-brand-secondary/35"
                            : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Layanan Perawatan (Services) *</label>
                  <select
                    value={item.serviceId}
                    onChange={(e) => handleUpdateItem(item.id, { serviceId: parseInt(e.target.value) })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors font-semibold"
                  >
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.service_name} - {formatRupiah(s.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Catatan Kondisi Awal</label>
                  <textarea
                    placeholder="Contoh: Noda tanah parah di bagian tumit kanan, yellowing pada midsole."
                    value={item.conditionNotes}
                    rows={2}
                    onChange={(e) => handleUpdateItem(item.id, { conditionNotes: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-xs rounded-lg p-2.5 text-brand-primary outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddShoe}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white hover:bg-zinc-50/50 text-brand-primary hover:text-brand-secondary border border-zinc-200 rounded-2xl transition-all group font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus size={16} className="text-brand-secondary group-hover:scale-110 transition-transform" />
            Tambahkan Sepatu Lainnya
          </button>

          <div className="pt-4 border-t border-zinc-200 flex justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-600 font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-200 shadow-sm transition-colors"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
            <button
              onClick={() => {
                if (items.length === 0) {
                  alert("Harap tambahkan minimal 1 sepatu!");
                  return;
                }
                const missingFields = items.some(item => !item.brand.trim() || !item.model.trim() || !item.photoBase64);
                if (missingFields) {
                  alert("Harap lengkapi Brand, Model, dan Foto untuk setiap item!");
                  return;
                }
                setStep(3);
              }}
              className="flex items-center gap-1 px-6 py-2.5 bg-brand-secondary hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient"
            >
              Lanjutkan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: TRANSACTION & SUMMARY --- */}
      {step === 3 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-brand-ambient animate-fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-150">
            <div className="p-2 bg-brand-secondary/5 text-brand-secondary rounded-lg">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-brand-primary">Pembayaran & Ringkasan</h3>
              <p className="text-xs text-zinc-500 font-medium">Rincian biaya dan print digital invoice</p>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3.5 shadow-inner">
            <div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Customer</span>
              <p className="text-xs font-bold text-brand-primary">{customerName} ({whatsappNumber})</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Daftar Sepatu ({items.length} pasang)</span>
              {items.map((item, idx) => {
                const service = availableServices.find(s => s.id === item.serviceId);
                return (
                  <div key={item.id} className="flex justify-between items-center text-xs text-zinc-600 pb-1.5 border-b border-zinc-200/50 last:border-b-0 last:pb-0">
                    <span className="font-semibold text-zinc-500">
                      #{idx + 1} {item.brand} {item.model} ({item.material})
                    </span>
                    <span className="font-mono text-brand-primary font-bold">
                      {service ? formatRupiah(service.price) : "Rp 0"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-xs font-bold text-brand-primary">
              <span>Total Tagihan</span>
              <span className="font-mono text-brand-secondary text-base">{formatRupiah(totalBill)}</span>
            </div>
          </div>

          {/* Payment Status Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Status Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "unpaid", label: "Belum Bayar", bg: "hover:border-red-500/40 border-red-200 text-red-600 bg-red-50/30", activeBg: "bg-red-50 border-red-500 text-red-600" },
                { key: "partial", label: "DP (Uang Muka)", bg: "hover:border-amber-500/40 border-amber-200 text-amber-600 bg-amber-50/30", activeBg: "bg-amber-50 border-amber-500 text-amber-600" },
                { key: "paid", label: "Lunas", bg: "hover:border-emerald-500/40 border-emerald-200 text-emerald-600 bg-emerald-50/30", activeBg: "bg-emerald-50 border-emerald-550 text-emerald-600" }
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => handlePaymentStatusClick(s.key as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    paymentStatus === s.key ? s.activeBg : `bg-white border-zinc-200 text-zinc-500 ${s.bg}`
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paid input (only for partial payment) */}
          {paymentStatus === "partial" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">DP yang Dibayarkan</label>
              <input
                type="text"
                placeholder="Contoh: 20000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-white border border-zinc-200 focus:border-brand-secondary text-sm font-mono rounded-lg p-2.5 text-brand-primary outline-none transition-colors"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold px-1 uppercase tracking-wider">
                <span>Sisa Tagihan:</span>
                <span className="font-mono text-zinc-600">{formatRupiah(changeOrDebt)}</span>
              </div>
            </div>
          )}

          {/* WhatsApp Text Preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Preview Pesan WhatsApp (M5 Gateway)</span>
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-[10px] text-zinc-500 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
              {`Halo *${customerName || "Customer"}*, Terima kasih telah mempercayakan sepatu Anda di Bufflab Clean Shoes Surabaya! 🙏\n\n` +
              `Berikut adalah detail pesanan Anda:\n` +
              `🧾 No. Invoice: *INV-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-XXXX*\n` +
              `👟 Item: *${items.map(i => `${i.brand} ${i.model}`).join(", ")}*\n` +
              `🛠️ Layanan: *${items.map(i => availableServices.find(s => s.id === i.serviceId)?.service_name).join(", ")}*\n` +
              `💰 Total: *${formatRupiah(totalBill)}* (Status: *${paymentStatus === "paid" ? "Lunas" : paymentStatus === "partial" ? `DP ${formatRupiah(parsedAmountPaid)}` : "Belum Bayar"}*)\n\n` +
              `Estimasi pengerjaan selesai dalam *3-4* hari kerja. Anda dapat memantau status sepatu Anda melalui link berikut: http://localhost:3000/invoice/INV-XXXX`}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex justify-between gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-600 font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-200 shadow-sm transition-colors"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
            
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-secondary hover:bg-brand-accent active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand-ambient disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan Order...</span>
                </>
              ) : (
                <>
                  <ClipboardCheck size={16} />
                  Simpan & Kirim Invoice WA
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdInvoice && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-brand-ambient animate-slide-up">
            <div className="w-16 h-16 bg-brand-secondary/5 text-brand-secondary rounded-full flex items-center justify-center mx-auto border border-brand-secondary/20">
              <Check size={32} />
            </div>

            <div className="space-y-1">
              <h4 className="font-display text-base font-extrabold text-brand-primary">Order Berhasil Disimpan!</h4>
              <p className="text-xs text-zinc-500 font-medium">Kirim Bukti Terima (Invoice) ke WhatsApp customer.</p>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl shadow-inner">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">No. Invoice</span>
              <span className="text-sm font-bold text-brand-primary font-mono">{createdInvoice}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={getWhatsAppLink(
                  whatsappNumber,
                  `Halo *${customerName}*, Terima kasih telah mempercayakan sepatu Anda di Bufflab Clean Shoes Surabaya! 🙏\n\n` +
                  `Berikut adalah detail pesanan Anda:\n` +
                  `🧾 No. Invoice: *${createdInvoice}*\n` +
                  `👟 Item: *${items.map(i => `${i.brand} ${i.model || ""}`).join(", ")}*\n` +
                  `🛠️ Layanan: *${items.map(i => availableServices.find(s => s.id === i.serviceId)?.service_name).join(", ")}*\n` +
                  `💰 Total: *${formatRupiah(totalBill)}* (Status: *${paymentStatus === "paid" ? "Lunas" : paymentStatus === "partial" ? `DP ${formatRupiah(parsedAmountPaid)}` : "Belum Bayar"}*)\n\n` +
                  `Estimasi pengerjaan selesai dalam *3-4* hari kerja. Anda dapat memantau status sepatu Anda melalui link berikut: ${window.location.origin}/invoice/${createdInvoice}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                💬 Kirim Invoice via WhatsApp
              </a>
              <Link
                href={`/invoice/${createdInvoice}`}
                className="w-full py-2.5 bg-brand-secondary hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Buka Link Invoice Digital
              </Link>
              <button
                onClick={() => {
                  setCreatedInvoice(null);
                  clearDraft();
                }}
                className="w-full py-2.5 bg-white hover:bg-zinc-50 text-zinc-650 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-zinc-200 shadow-sm"
              >
                Buat Order Baru Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
