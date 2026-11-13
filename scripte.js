const defaultProperties = [
  {
    id: 1, title: "شقة فاخرة بإطلالة مفتوحة", area: "التجمع الخامس", city: "القاهرة الجديدة",
    price: 2850000, kind: "للبيع", type: "شقة", beds: 3, baths: 2, size: 165, lat: 30.018, lng: 31.433,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    publisher: "محمود حسن", initials: "م ح", phone: "201000000001"
  },
  {
    id: 2, title: "فيلا مستقلة بحديقة خاصة", area: "الشيخ زايد", city: "الشيخ زايد",
    price: 4200000, kind: "للبيع", type: "فيلا", beds: 4, baths: 3, size: 280, lat: 30.061, lng: 30.976,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
    publisher: "سارة علي", initials: "س ع", phone: "201000000002"
  },
  {
    id: 3, title: "شقة مفروشة بتصميم هادئ", area: "المعادي", city: "المعادي، القاهرة",
    price: 25000, kind: "للإيجار", type: "شقة", beds: 2, baths: 2, size: 130, lat: 29.961, lng: 31.257,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
    publisher: "ياسمين فؤاد", initials: "ي ف", phone: "201000000003"
  },
  {
    id: 4, title: "وحدة عصرية في كمبوند راقٍ", area: "العاصمة الإدارية", city: "العاصمة الإدارية",
    price: 2500000, kind: "للبيع", type: "شقة", beds: 3, baths: 2, size: 155, lat: 30.012, lng: 31.755,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
    publisher: "كريم عادل", initials: "ك ع", phone: "201000000004"
  },
  {
    id: 5, title: "دوبلكس واسع بتشطيبات مميزة", area: "التجمع الخامس", city: "القاهرة الجديدة",
    price: 3650000, kind: "للبيع", type: "دوبلكس", beds: 4, baths: 3, size: 220, lat: 30.004, lng: 31.426,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    publisher: "أحمد سامي", initials: "أ س", phone: "201000000005"
  },
  {
    id: 6, title: "شاليه قريب من البحر", area: "الساحل الشمالي", city: "الساحل الشمالي",
    price: 3100000, kind: "للبيع", type: "شاليه", beds: 2, baths: 1, size: 110, lat: 30.82, lng: 28.95,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
    publisher: "نورهان عادل", initials: "ن ع", phone: "201000000006"
  }
];

const savedPropertiesKey = "tito-properties";
let properties = [...loadSavedProperties(), ...defaultProperties];
const grid = document.getElementById("property-grid");
const areaFilter = document.getElementById("area-filter");
const minPrice = document.getElementById("min-price");
const maxPrice = document.getElementById("max-price");
const sortFilter = document.getElementById("sort-filter");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const mapPanel = document.getElementById("map-panel");
const resultsLayout = document.querySelector(".results-layout");
const mapElement = document.getElementById("real-map");
const mapStatus = document.getElementById("map-status");
const toast = document.getElementById("toast");
let selectedKind = "الكل";
let toastTimer;
let propertyMap;
let propertyMarkers;
let mapInitialized = false;

const areaCoordinates = {
  "التجمع الخامس": [30.018, 31.433],
  "الشيخ زايد": [30.061, 30.976],
  "المعادي": [29.961, 31.257],
  "العاصمة الإدارية": [30.012, 31.755],
  "الساحل الشمالي": [30.82, 28.95]
};

function loadSavedProperties() {
  try {
    const saved = localStorage.getItem(savedPropertiesKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved property data must be an array.");
    return parsed;
  } catch (error) {
    console.error("Could not load saved TITO listings:", error);
    return [];
  }
}

function saveProperties() {
  try {
    localStorage.setItem(savedPropertiesKey, JSON.stringify(properties.filter((property) => property.userAdded)));
    return true;
  } catch (error) {
    console.error("Could not save TITO listings:", error);
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function safeImageUrl(value) {
  if (!value) return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? escapeHTML(url.href)
      : "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80";
  } catch (error) {
    return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80";
  }
}

function formatPrice(price, kind) {
  if (kind === "للإيجار") {
    return `${new Intl.NumberFormat("ar-EG").format(price)} <small>جنيه / شهر</small>`;
  }
  if (price >= 1000000) {
    const millions = (price / 1000000).toLocaleString("ar-EG", { maximumFractionDigits: 2 });
    return `${millions} مليون <small>جنيه</small>`;
  }
  return `${new Intl.NumberFormat("ar-EG").format(price)} <small>جنيه</small>`;
}

function renderProperties() {
  const minimum = Number(minPrice.value) || 0;
  const maximum = Number(maxPrice.value) || Infinity;
  const selectedArea = areaFilter.value;
  let visibleProperties = properties.filter((property) => {
    return (!selectedArea || property.area === selectedArea)
      && (selectedKind === "الكل" || property.kind === selectedKind)
      && property.price >= minimum
      && property.price <= maximum;
  });

  if (sortFilter.value === "low") visibleProperties.sort((a, b) => a.price - b.price);
  if (sortFilter.value === "high") visibleProperties.sort((a, b) => b.price - a.price);

  grid.innerHTML = visibleProperties.map((property) => `
    <article class="property-card" data-property-id="${escapeHTML(property.id)}">
      <div class="card-image">
        <img src="${safeImageUrl(property.image)}" alt="${escapeHTML(property.title)}" loading="lazy">
        <span class="property-tag">${escapeHTML(property.kind)} · ${escapeHTML(property.type)}</span>
        <button class="favorite" type="button" aria-label="إضافة ${escapeHTML(property.title)} إلى المفضلة" aria-pressed="false">♡</button>
      </div>
      <div class="card-content">
        <div class="property-price">${formatPrice(property.price, property.kind)}</div>
        <h3>${escapeHTML(property.title)}</h3>
        <div class="property-location"><span>⌖</span>${escapeHTML(property.city)}</div>
        <div class="property-meta">
          <span>▤ ${property.beds} غرف</span>
          <span>▣ ${property.baths} حمام</span>
          <span>⌗ ${new Intl.NumberFormat("ar-EG").format(property.size)} م²</span>
        </div>
        <div class="card-footer">
          <div class="publisher"><span class="publisher-avatar">${escapeHTML(property.initials)}</span>${escapeHTML(property.publisher)}</div>
          <a class="contact-button" href="https://wa.me/${escapeHTML(property.phone)}?text=${encodeURIComponent(`مرحباً، أنا مهتم بإعلان: ${property.title}`)}" target="_blank" rel="noopener noreferrer">تواصل واتساب ↗</a>
        </div>
      </div>
    </article>
  `).join("");

  resultsCount.textContent = `(${new Intl.NumberFormat("ar-EG").format(visibleProperties.length)} عقارات)`;
  emptyState.hidden = visibleProperties.length !== 0;
  grid.hidden = visibleProperties.length === 0;
  renderMapMarkers(visibleProperties);
}

function createPopup(property) {
  const popup = document.createElement("div");
  popup.className = "map-popup";

  const title = document.createElement("strong");
  title.textContent = property.title;

  const location = document.createElement("span");
  location.textContent = `${property.area} · ${property.kind}`;

  const price = document.createElement("b");
  price.textContent = `${new Intl.NumberFormat("ar-EG").format(property.price)} جنيه${property.kind === "للإيجار" ? " / شهر" : ""}`;

  const contact = document.createElement("a");
  contact.textContent = "تواصل واتساب";
  contact.href = `https://wa.me/${property.phone}?text=${encodeURIComponent(`مرحباً، أنا مهتم بإعلان: ${property.title}`)}`;
  contact.target = "_blank";
  contact.rel = "noopener noreferrer";

  popup.append(title, location, price, contact);
  return popup;
}

function getPropertyCoordinates(property) {
  if (Number.isFinite(Number(property.lat)) && Number.isFinite(Number(property.lng))) {
    return [Number(property.lat), Number(property.lng)];
  }
  return areaCoordinates[property.area] || null;
}

function renderMapMarkers(visibleProperties) {
  if (!propertyMap || !propertyMarkers) return;
  propertyMarkers.clearLayers();
  visibleProperties.forEach((property) => {
    const coordinates = getPropertyCoordinates(property);
    if (!coordinates) return;
    const priceText = property.price >= 1000000
      ? `${(property.price / 1000000).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}م`
      : `${new Intl.NumberFormat("ar-EG").format(property.price)}`;
    const icon = L.divIcon({
      className: "property-map-icon",
      html: `<span>${escapeHTML(priceText)}</span>`,
      iconSize: [74, 34],
      iconAnchor: [37, 34]
    });

    L.marker(coordinates, { icon })
      .bindPopup(createPopup(property), { maxWidth: 240 })
      .addTo(propertyMarkers);
  });
}

function initializeMap() {
  if (mapInitialized) return;
  if (!window.L) {
    mapStatus.hidden = false;
    mapStatus.textContent = "تعذّر تحميل الخريطة. تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة.";
    return;
  }

  propertyMap = L.map(mapElement, {
    zoomControl: false,
    scrollWheelZoom: true
  }).setView([30.0444, 31.2357], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
  }).addTo(propertyMap);

  propertyMarkers = L.featureGroup().addTo(propertyMap);
  mapInitialized = true;
  renderMapMarkers(properties);
  if (propertyMarkers.getLayers().length) {
    propertyMap.fitBounds(propertyMarkers.getBounds().pad(0.18), { maxZoom: 9 });
  }
  mapStatus.hidden = true;
}

function focusMapOnArea(area) {
  const coordinates = areaCoordinates[area];
  if (propertyMap && coordinates) propertyMap.setView(coordinates, 13);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

document.getElementById("search-button").addEventListener("click", renderProperties);
areaFilter.addEventListener("change", () => {
  renderProperties();
  initializeMap();
  if (areaFilter.value) focusMapOnArea(areaFilter.value);
  else if (propertyMap) propertyMap.setView([30.0444, 31.2357], 8);
});
sortFilter.addEventListener("change", renderProperties);
minPrice.addEventListener("input", renderProperties);
maxPrice.addEventListener("input", renderProperties);

document.querySelectorAll(".search-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelector(".search-tab.selected").classList.remove("selected");
    tab.classList.add("selected");
    selectedKind = tab.dataset.kind;
    renderProperties();
  });
});

document.getElementById("clear-filters").addEventListener("click", () => {
  areaFilter.value = "";
  minPrice.value = "";
  maxPrice.value = "";
  selectedKind = "الكل";
  document.querySelectorAll(".search-tab").forEach((tab) => {
    tab.classList.toggle("selected", tab.dataset.kind === "الكل");
  });
  renderProperties();
  if (propertyMap) propertyMap.setView([30.0444, 31.2357], 8);
});

grid.addEventListener("click", (event) => {
  const favorite = event.target.closest(".favorite");
  if (!favorite) return;
  const isFavorite = favorite.getAttribute("aria-pressed") !== "true";
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.classList.toggle("active", isFavorite);
  favorite.textContent = isFavorite ? "♥" : "♡";
});

document.getElementById("map-toggle").addEventListener("click", () => {
  const isMobile = window.matchMedia("(max-width: 620px)").matches;
  if (isMobile) {
    mapPanel.classList.toggle("visible");
    document.getElementById("map-toggle").innerHTML = mapPanel.classList.contains("visible")
      ? "<span>⌖</span> إخفاء الخريطة"
      : "<span>⌖</span> عرض الخريطة";
  } else {
    resultsLayout.classList.toggle("map-expanded");
    document.getElementById("map-toggle").innerHTML = resultsLayout.classList.contains("map-expanded")
      ? "<span>⌖</span> تصغير الخريطة"
      : "<span>⌖</span> تكبير الخريطة";
  }
  initializeMap();
  window.setTimeout(() => propertyMap?.invalidateSize(), 100);
});

document.getElementById("map-expand").addEventListener("click", () => {
  resultsLayout.classList.toggle("map-expanded");
  const expanded = resultsLayout.classList.contains("map-expanded");
  const button = document.getElementById("map-expand");
  button.setAttribute("aria-label", expanded ? "تصغير الخريطة" : "تكبير الخريطة");
  button.title = expanded ? "تصغير الخريطة" : "تكبير الخريطة";
  button.textContent = expanded ? "↙" : "⛶";
  initializeMap();
  window.setTimeout(() => propertyMap?.invalidateSize(), 100);
});

document.getElementById("map-zoom-in").addEventListener("click", () => {
  initializeMap();
  propertyMap?.zoomIn();
});
document.getElementById("map-zoom-out").addEventListener("click", () => {
  initializeMap();
  propertyMap?.zoomOut();
});
document.getElementById("map-reset").addEventListener("click", () => {
  initializeMap();
  if (!propertyMap) return;
  if (areaFilter.value) {
    focusMapOnArea(areaFilter.value);
    return;
  }
  if (propertyMarkers?.getLayers().length) propertyMap.fitBounds(propertyMarkers.getBounds().pad(0.18), { maxZoom: 12 });
  else propertyMap.setView([30.0444, 31.2357], 8);
});

grid.addEventListener("click", (event) => {
  if (event.target.closest(".favorite, a")) return;
  const card = event.target.closest(".property-card");
  if (!card) return;
  const property = properties.find((item) => String(item.id) === card.dataset.propertyId);
  const coordinates = property && getPropertyCoordinates(property);
  if (!coordinates) return;
  initializeMap();
  if (!propertyMap) return;
  if (window.matchMedia("(max-width: 620px)").matches) mapPanel.classList.add("visible");
  propertyMap.setView(coordinates, 15);
  propertyMarkers.eachLayer((marker) => {
    if (marker.getLatLng().lat === coordinates[0] && marker.getLatLng().lng === coordinates[1]) {
      marker.openPopup();
    }
  });
});

document.getElementById("search-button").addEventListener("click", () => {
  initializeMap();
  if (areaFilter.value) focusMapOnArea(areaFilter.value);
});

const loginModal = document.getElementById("login-modal");
const propertyModal = document.getElementById("property-modal");
document.getElementById("open-login").addEventListener("click", () => {
  loginModal.hidden = false;
  document.getElementById("login-modal").querySelector("input").focus();
});
document.getElementById("close-login").addEventListener("click", () => {
  loginModal.hidden = true;
});
document.getElementById("open-property-form").addEventListener("click", () => {
  propertyModal.hidden = false;
  propertyModal.querySelector("input").focus();
});
document.getElementById("close-property-form").addEventListener("click", () => {
  propertyModal.hidden = true;
});
loginModal.addEventListener("click", (event) => {
  if (event.target === loginModal) loginModal.hidden = true;
});
propertyModal.addEventListener("click", (event) => {
  if (event.target === propertyModal) propertyModal.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    loginModal.hidden = true;
    propertyModal.hidden = true;
  }
});
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("form-message").textContent = "تم التحقق من بيانات النموذج — تسجيل الدخول الفعلي يحتاج ربطاً بخادم.";
});

document.getElementById("property-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const title = String(data.get("title")).trim();
  const publisher = String(data.get("publisher")).trim();
  const area = String(data.get("area"));
  const phoneDigits = String(data.get("phone")).replace(/\D/g, "");
  const whatsappPhone = phoneDigits.startsWith("0")
    ? `2${phoneDigits}`
    : phoneDigits.startsWith("20") ? phoneDigits : `20${phoneDigits}`;
  const property = {
    id: `user-${Date.now()}`,
    title,
    area,
    city: area === "الساحل الشمالي" ? area : `${area}، القاهرة`,
    price: Number(data.get("price")),
    kind: String(data.get("kind")),
    type: String(data.get("type")),
    beds: Number(data.get("beds")),
    baths: Number(data.get("baths")),
    size: Number(data.get("size")),
    image: String(data.get("image")).trim(),
    lat: areaCoordinates[area][0],
    lng: areaCoordinates[area][1],
    publisher,
    initials: publisher.slice(0, 2),
    phone: whatsappPhone,
    userAdded: true
  };

  properties.unshift(property);
  const saved = saveProperties();
  renderProperties();
  initializeMap();
  form.reset();
  propertyModal.hidden = true;
  showToast(saved
    ? "تم نشر إعلانك وحفظه على هذا الجهاز."
    : "تم عرض إعلانك، لكن لم نتمكن من حفظه على هذا الجهاز.");
  document.getElementById("listings").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.querySelector(".main-nav").classList.toggle("open");
});

renderProperties();
initializeMap();
