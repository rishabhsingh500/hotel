import { fetchHotels } from "./api.js";
import { debounce, escapeHtml, formatCurrency, formatRating, summarizeHotels } from "./utils.js";

const form = document.querySelector("#filtersForm");
const hotelGrid = document.querySelector("#hotelGrid");
const template = document.querySelector("#hotelCardTemplate");
const emptyState = document.querySelector("#emptyState");
const locationSelect = document.querySelector("#locationSelect");
const resultCount = document.querySelector("#resultCount");
const averagePrice = document.querySelector("#averagePrice");
const averageRating = document.querySelector("#averageRating");
const activeFilters = document.querySelector("#activeFilters");
const dialog = document.querySelector("#hotelDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector("#closeDialog");
const clearFilters = document.querySelector("#clearFilters");
const themeToggle = document.querySelector("#themeToggle");

const cityOptions = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Goa",
  "Gurgaon",
  "Hyderabad",
  "Jaipur",
  "Kolkata",
  "Mumbai",
  "Noida",
  "Pune",
];

const state = {
  hotels: [],
  totalCount: 0,
  isLoading: false,
};

function getFilters() {
  const values = Object.fromEntries(new FormData(form).entries());
  return {
    search: values.search,
    location: values.location,
    order_by: values.order_by || "-rating",
    min_price: values.min_price,
    max_price: values.max_price,
    min_rating: values.min_rating,
    limit: 24,
  };
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  hotelGrid.classList.toggle("is-loading", isLoading);

  if (isLoading) {
    hotelGrid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton-card"></div>').join("");
    emptyState.classList.add("hidden");
  }
}

function updateSummary(hotels) {
  const summary = summarizeHotels(hotels);
  resultCount.textContent = state.totalCount;
  averagePrice.textContent = summary.averagePrice;
  averageRating.textContent = summary.averageRating;
}

function updateActiveFilters(filters) {
  const labels = [];

  if (filters.search) labels.push(`"${filters.search}"`);
  if (filters.location) labels.push(filters.location);
  if (filters.min_price || filters.max_price) {
    labels.push(`${filters.min_price || "0"}-${filters.max_price || "any"} INR`);
  }
  if (filters.min_rating) labels.push(`${filters.min_rating}+ rating`);

  activeFilters.textContent = labels.length ? `Filtered by ${labels.join(" | ")}` : "Showing best matches";
}

function renderHotels(hotels) {
  hotelGrid.innerHTML = "";
  emptyState.classList.toggle("hidden", hotels.length > 0);

  hotels.forEach((hotel) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const image = card.querySelector(".hotel-image");
    const imageButton = card.querySelector(".image-button");
    const detailsButton = card.querySelector(".details-button");

    image.src = hotel.thumbnail;
    image.alt = `${hotel.name} in ${hotel.location}`;
    card.querySelector("h3").textContent = hotel.name;
    card.querySelector(".hotel-location").textContent = hotel.location;
    card.querySelector(".rating-pill").textContent = `Rating ${formatRating(hotel.rating)}`;
    card.querySelector(".hotel-description").textContent = hotel.description;
    card.querySelector(".hotel-price").textContent = `${formatCurrency(hotel.price)} / night`;

    imageButton.addEventListener("click", () => openHotelDialog(hotel));
    detailsButton.addEventListener("click", () => openHotelDialog(hotel));
    hotelGrid.append(card);
  });
}

function openHotelDialog(hotel) {
  const gallery = [hotel.thumbnail, ...(hotel.photos || []).slice(0, 4)];
  const safeHotel = {
    name: escapeHtml(hotel.name),
    location: escapeHtml(hotel.location),
    description: escapeHtml(hotel.description),
  };

  dialogContent.innerHTML = `
    <div class="dialog-gallery">
      ${gallery
        .map(
          (photo, index) =>
            `<img src="${escapeHtml(photo)}" alt="${safeHotel.name} photo ${index + 1}" loading="lazy" />`,
        )
        .join("")}
    </div>
    <div class="dialog-body">
      <div>
        <p class="eyebrow">${safeHotel.location}</p>
        <h2 id="dialogTitle">${safeHotel.name}</h2>
      </div>
      <div class="dialog-meta">
        <span>Rating ${formatRating(hotel.rating)}</span>
        <span>${formatCurrency(hotel.price)} / night</span>
      </div>
      <p>${safeHotel.description}</p>
      <button class="primary-button dialog-book" type="button">Reserve stay</button>
    </div>
  `;
  dialog.showModal();
}

async function loadHotels() {
  const filters = getFilters();
  updateActiveFilters(filters);
  setLoading(true);

  try {
    const { hotels, count } = await fetchHotels(filters);
    state.hotels = hotels;
    state.totalCount = count;
    renderHotels(hotels);
    updateSummary(hotels);
  } catch (error) {
    hotelGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = "Unable to load hotels";
    emptyState.querySelector("p").textContent = "Please check your connection and try again.";
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function populateCities() {
  cityOptions.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    locationSelect.append(option);
  });
}

function initializeTheme() {
  const savedTheme = window.localStorage.getItem("stayfinder-theme");
  if (savedTheme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("stayfinder-theme", nextTheme);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadHotels();
});

form.addEventListener("input", debounce(loadHotels));
form.addEventListener("change", loadHotels);

clearFilters.addEventListener("click", () => {
  form.reset();
  loadHotels();
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

populateCities();
initializeTheme();
loadHotels();
