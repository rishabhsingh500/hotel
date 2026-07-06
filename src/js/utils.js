export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatRating = (rating) => Number(rating || 0).toFixed(1);

export function debounce(callback, delay = 350) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

export function summarizeHotels(hotels) {
  if (!hotels.length) {
    return {
      averagePrice: "--",
      averageRating: "--",
    };
  }

  const totals = hotels.reduce(
    (summary, hotel) => ({
      price: summary.price + Number(hotel.price || 0),
      rating: summary.rating + Number(hotel.rating || 0),
    }),
    { price: 0, rating: 0 },
  );

  return {
    averagePrice: formatCurrency(totals.price / hotels.length),
    averageRating: formatRating(totals.rating / hotels.length),
  };
}
