const gasPrices = [
  { name: "1kg Cooking Gas", detail: "Daily refill rate", price: 1800 },
  { name: "3kg Cooking Gas", detail: "Small cylinder refill", price: 5400 },
  { name: "6kg Cooking Gas", detail: "Family-size refill", price: 9000 },
  { name: "12.5kg Cooking Gas", detail: "Large home or business refill", price: 18500 }
];

const accessoryPrices = [
  { name: "Gas Regulator", detail: "Standard regulator", price: 6500 },
  { name: "Gas Hose + Clips", detail: "Hose and clip bundle", price: 3500 },
  { name: "Portable Gas Burner", detail: "Compact cooking burner", price: 12000 },
  { name: "Cylinder Accessories", detail: "Ask for current stock", price: null }
];

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#navLinks");
const gasPriceList = document.querySelector("#gasPriceList");
const accessoryPriceList = document.querySelector("#accessoryPriceList");

function formatNaira(amount) {
  return currency.format(amount).replace("NGN", "₦");
}

function renderPriceList(container, items) {
  container.innerHTML = items
    .map((item) => {
      const price = item.price === null ? "Contact us" : formatNaira(item.price);

      return `
        <div class="price-row">
          <div>
            <strong>${item.name}</strong>
            <span>${item.detail}</span>
          </div>
          <strong>${price}</strong>
        </div>
      `;
    })
    .join("");
}

function bindNavigation() {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (!event.target.matches("a")) return;

    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
}

function sendPreviewHeight() {
  if (window.parent === window) return;

  window.parent.postMessage({ type: "web_page_height", height: document.body.scrollHeight }, "*");
}

renderPriceList(gasPriceList, gasPrices);
renderPriceList(accessoryPriceList, accessoryPrices);
bindNavigation();

window.addEventListener("load", sendPreviewHeight);
new ResizeObserver(sendPreviewHeight).observe(document.documentElement);
