const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ─── Generic Fetch Helper ────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const token = typeof window !== "undefined" ? localStorage.getItem("bufflab_token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `API Error: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// ─── Type Definitions ────────────────────────────────────────────────────

export interface Service {
  id: number;
  service_name: string;
  price: number;
  estimated_days: number;
}

export interface Customer {
  id: number;
  name: string;
  whatsapp_number: string;
  orders_count?: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  service_id: number;
  brand: string;
  model: string | null;
  color: string;
  material: string;
  size: number | null;
  initial_condition_notes: string | null;
  photo_path: string | null;
  service?: Service;
}

export interface Order {
  id: number;
  invoice_number: string;
  customer_id: number;
  total_price: number;
  amount_paid: number;
  payment_status: "unpaid" | "partial" | "paid";
  order_status: "pending" | "processing" | "ready" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface DashboardStats {
  today_revenue: number;
  active_queue: number;
  ready_count: number;
  completed_today: number;
  recent_orders: Order[];
}

export interface CreateOrderPayload {
  customer: {
    name: string;
    whatsapp_number: string;
  };
  order_details: {
    amount_paid: number;
    payment_status: "unpaid" | "partial" | "paid";
  };
  items: {
    service_id: number;
    brand: string;
    model: string;
    color: string;
    material: string;
    size: number | null;
    initial_condition_notes: string;
    photo_base64: string;
  }[];
}

// ─── API Functions ───────────────────────────────────────────────────────

/** Fetch dashboard statistics (today's revenue, queue counts, recent orders) */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await apiFetch<{ data: DashboardStats }>("/dashboard/stats");
  return res.data;
}

/** Fetch all available services */
export async function fetchServices(): Promise<Service[]> {
  const res = await apiFetch<{ data: Service[] }>("/services");
  return res.data;
}

/** Search customer by WhatsApp number */
export async function searchCustomer(
  whatsapp: string
): Promise<Customer | null> {
  try {
    const res = await apiFetch<{ data: Customer | null }>(
      `/customers/search?whatsapp=${encodeURIComponent(whatsapp)}`
    );
    return res.data;
  } catch {
    return null;
  }
}

/** Fetch orders list with optional filters */
export async function fetchOrders(params?: {
  status?: string;
  search?: string;
}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await apiFetch<{ data: Order[] }>(`/orders${qs ? `?${qs}` : ""}`);
  return res.data;
}

/** Create a new order */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await apiFetch<{ data: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** Get a single order by ID */
export async function fetchOrder(id: number): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/orders/${id}`);
  return res.data;
}

/** Get a single order by invoice number (public) */
export async function fetchInvoice(invoiceNumber: string): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(
    `/invoice/${encodeURIComponent(invoiceNumber)}`
  );
  return res.data;
}

/** Update an order's status */
export async function updateOrderStatus(
  id: number,
  status: Order["order_status"]
): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ order_status: status }),
  });
  return res.data;
}

/** Helper: Build photo URL from photo_path */
export function getPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  // Laravel serves storage files via /storage/ symlink
  const baseUrl = API_URL.replace("/api/v1", "");
  return `${baseUrl}/storage/${photoPath}`;
}

/** Helper: Build wa.me link */
export function getWhatsAppLink(
  whatsappNumber: string,
  message: string
): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Update an order's payment status */
export async function updateOrderPayment(
  id: number,
  payload: { payment_status: "unpaid" | "partial" | "paid"; amount_paid: number }
): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** Update a service price */
export async function updateServicePrice(
  id: number,
  price: number
): Promise<Service> {
  const res = await apiFetch<{ data: Service }>(`/services/${id}/price`, {
    method: "PATCH",
    body: JSON.stringify({ price }),
  });
  return res.data;
}

/** Login */
export async function login(username: string, password: string): Promise<{ user: any; token: string }> {
  const res = await apiFetch<{ data: { user: any; token: string } }>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return res.data;
}
