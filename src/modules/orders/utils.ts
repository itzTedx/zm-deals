export function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
    case "delivered":
      return "bg-green-100 text-green-800";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusDescription(status: string) {
  switch (status) {
    case "pending":
      return "Your order is being processed";
    case "confirmed":
      return "Your order has been confirmed";
    case "processing":
      return "Your order is being prepared";
    case "shipped":
      return "Your order is on its way";
    case "delivered":
      return "Your order has been delivered";
    case "cancelled":
      return "Your order has been cancelled";
    case "failed":
      return "Your order failed to process";
    default:
      return "Order status unknown";
  }
}

export function formatPrice(price: number | string) {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(numericPrice);
}

export function formatDateTime(dateString: string | Date) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
