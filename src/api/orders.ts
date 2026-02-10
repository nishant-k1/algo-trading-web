import { apiGet, apiPost } from "./client";

export interface OrderRow {
  id: number;
  client_order_id: string;
  broker_order_id: string | null;
  symbol: string;
  exchange: string;
  side: string;
  quantity: number;
  product: string;
  order_type: string;
  status: string;
  paper_live: string;
  filled_quantity: number;
  average_price: number | null;
  created_at: string | null;
}

export function listOrders() {
  return apiGet<OrderRow[]>("/api/orders");
}

export function cancelOrderPaper(orderId: number) {
  return apiPost<{ ok: boolean; message: string }>("/api/orders/cancel", { order_id: orderId });
}

export function cancelOrderLive(brokerOrderId: string) {
  return apiPost<{ ok: boolean; message: string }>("/api/orders/cancel", {
    broker_order_id: brokerOrderId,
  });
}
