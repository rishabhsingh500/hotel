const API_BASE_URL = "https://demohotelsapi.pythonanywhere.com/hotels/";

export async function fetchHotels(filters = {}) {
  const url = new URL(API_BASE_URL);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value).trim());
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Hotel API returned ${response.status}`);
  }

  const payload = await response.json();
  return {
    hotels: Array.isArray(payload.data) ? payload.data : [],
    count: payload.count ?? 0,
    returned: payload.returned ?? 0,
    message: payload.message ?? "Hotels loaded",
  };
}
