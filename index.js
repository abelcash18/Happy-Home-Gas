// Pricing data arrays
const gasPrices = [
  { name: "1kg Cooking Gas", detail: "Daily refill rate", price: 1400 },
  { name: "3kg Cooking Gas", detail: "Small cylinder refill", price: 4200 },
  { name: "6kg Cooking Gas", detail: "Family-size refill", price: 8400 },
  { name: "12.5kg Cooking Gas", detail: "Large home or business refill", price: 17500 }
];

const accessoryPrices = [
  { name: "Gas Regulator", detail: "Standard regulator", price: 6500 },
  { name: "Gas Hose + Clips", detail: "Hose and clip bundle", price: 3500 },
  { name: "Portable Gas Burner", detail: "Compact cooking burner", price: 12000 },
  { name: "Cylinder Accessories", detail: "Ask for current stock", price: null }
];

// Clean native Naira formatting configuration
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

// Cache DOM target containers
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#navLinks");
const gasPriceList = document.querySelector("#gasPriceList");
const accessoryPriceList = document.querySelector("#accessoryPriceList");

/**
 * Formats raw numbers cleanly into local Naira markup
 */
function formatNaira(amount) {
  if (amount === null || amount === undefined) return "Contact us";
  return currencyFormatter.format(amount);
}

/**
 * Dynamically builds and mounts row elements into specific board columns
 */
function renderPriceList(container, items) {
  if (!container) return; // Defensive guard clause
  
  container.innerHTML = items
    .map((item) => {
      const displayPrice = formatNaira(item.price);
      return `
        <div class="price-row">
          <div>
            <strong>${item.name}</strong>
            <span>${item.detail}</span>
          </div>
          <strong>${displayPrice}</strong>
        </div>
      `;
    })
    .join("");
}

/**
 * Controls responsive navigation layouts and accessible toggle behaviors
 */
function bindNavigation() {
  if (!navToggle || !navLinks) return;

  // Toggle mobile navigation menu visibility state
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Automatically close structural drawer drawer upon anchor activation selection
  navLinks.addEventListener("click", (event) => {
    if (!event.target.matches("a")) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });

  // Keyboard accessibility cleanup: Close menu on 'Escape' press
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

/**
 * Coordinates frame heights securely when embedded inside sandboxed environments
 */
function sendPreviewHeight() {
  if (window.parent === window) return;
  window.parent.postMessage({ type: "web_page_height", height: document.body.scrollHeight }, "*");
}

// Initialization routine Execution
renderPriceList(gasPriceList, gasPrices);
renderPriceList(accessoryPriceList, accessoryPrices);
bindNavigation();

// Initialize Resize and layout updates loop monitoring
window.addEventListener("load", sendPreviewHeight);
if (window.ResizeObserver && document.documentElement) {
  new ResizeObserver(sendPreviewHeight).observe(document.documentElement);
}