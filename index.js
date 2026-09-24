/**
 * Happy Home Gas - Interactive Logic & Application Controller
 */

// Safe import of canvas-confetti (works both with Vite bundler and standalone)
let confettiFn = null;
try {
  const module = await import("canvas-confetti");
  confettiFn = module.default || module;
} catch (e) {
  // If not bundled or CDN not present, fallback gracefully
  if (typeof window !== "undefined" && window.confetti) {
    confettiFn = window.confetti;
  }
}

// Global Configuration
const CONFIG = {
  phone: "2348076786000",
  formattedPhone: "+234 807 678 6000",
  email: "josephabel540@gmail.com",
  ratePerKg: 1400,
  openHour: 6.5, // 6:30 AM
  closeHour: 21,  // 9:00 PM
  address: "Along Igharo St, Okabere St, opposite Banga Farm, off Ewere Street, Oka, Benin City 300105, Edo-State"
};

// Pricing Data
const gasRates = [
  { size: "1kg Refill", kg: 1, desc: "Quick student/single meal refill", price: 1400, popular: false },
  { size: "3kg Refill", kg: 3, desc: "Small camping cylinder refill", price: 4200, popular: false },
  { size: "5kg Refill", kg: 5, desc: "Compact home cylinder refill", price: 7000, popular: false },
  { size: "6kg Refill", kg: 6, desc: "Popular family starter refill", price: 8400, popular: true },
  { size: "10kg Refill", kg: 10, desc: "Medium household cooking refill", price: 14000, popular: false },
  { size: "12.5kg Refill", kg: 12.5, desc: "Standard household favorite", price: 17500, popular: true },
  { size: "25kg Refill", kg: 25, desc: "Heavy domestic & small restaurant", price: 35000, popular: false },
  { size: "50kg Refill", kg: 50, desc: "Commercial bakeries & catering", price: 70000, popular: false }
];

const accessoryProducts = [
  {
    name: "Standard Gas Regulator",
    desc: "Low-pressure brass regulator with precision safety seal",
    price: 6500,
    tag: "Essential"
  },
  {
    name: "Safety Regulator + Gauge",
    desc: "Heavy-duty with live pressure gauge & automatic leak shutoff",
    price: 9500,
    tag: "Recommended"
  },
  {
    name: "Reinforced 2m Hose + 2 Clips",
    desc: "Orange 3-layer anti-crack LPG hose with stainless steel clamps",
    price: 3500,
    tag: "Safety Standard"
  },
  {
    name: "Stainless Table Gas Stove (Double)",
    desc: "Heavy-gauge stainless steel body, auto-ignition, high efficiency",
    price: 24500,
    tag: "Bestseller"
  },
  {
    name: "Portable Single Camping Burner",
    desc: "Direct cylinder top-mount burner for 3kg and 6kg tanks",
    price: 12000,
    tag: "Convenient"
  },
  {
    name: "Gas Lighter & Valve O-Rings Kit",
    desc: "Reliable spark lighter + 3 high-grade replacement rubber seals",
    price: 1500,
    tag: "Maintenance"
  }
];

// Currency Formatter for Nigerian Naira
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

function formatNaira(amount) {
  if (amount === null || amount === undefined) return "Contact Us";
  return nairaFormatter.format(amount);
}

// Fire Confetti Animation
function triggerConfetti() {
  if (typeof confettiFn === "function") {
    confettiFn({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 }
    });
  }
}

// -----------------------------------------------------------------------------
// Live Business Hours Status Checker
// -----------------------------------------------------------------------------
function updateLiveStatus() {
  const statusElement = document.getElementById("liveStationStatus");
  const dotElement = document.getElementById("statusPulseDot");
  if (!statusElement || !dotElement) return;

  // Use current local time (Nigeria is UTC+1)
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const isOpen = currentHour >= CONFIG.openHour && currentHour < CONFIG.closeHour;

  if (isOpen) {
    dotElement.classList.remove("closed");
    statusElement.innerHTML = `<strong>Open Now</strong> • Station open until 9:00 PM`;
  } else {
    dotElement.classList.add("closed");
    statusElement.innerHTML = `<strong>Currently Closed</strong> • Opens at 6:30 AM`;
  }
}

// -----------------------------------------------------------------------------
// Render Rate Board Lists
// -----------------------------------------------------------------------------
function renderRates() {
  const gasContainer = document.getElementById("gasRatesContainer");
  const accContainer = document.getElementById("accessoriesContainer");

  if (gasContainer) {
    gasContainer.innerHTML = gasRates
      .map(
        (item) => `
        <div class="rate-card">
          <div>
            <div class="rate-card-top">
              <span class="rate-weight-badge">${item.kg} KG</span>
              <span class="stock-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                In Stock
              </span>
            </div>
            <h4 class="rate-title">${item.size}</h4>
            <div class="rate-subtitle">${item.desc}</div>
          </div>
          <div class="rate-price-block">
            <span class="rate-price-amount">${formatNaira(item.price)}</span>
            <button class="btn btn-sm btn-outline select-rate-btn" data-kg="${item.kg}" aria-label="Select ${item.kg}kg in calculator">
              Calculate
            </button>
          </div>
        </div>
      `
      )
      .join("");
  }

  if (accContainer) {
    accContainer.innerHTML = accessoryProducts
      .map(
        (item) => `
        <div class="rate-card">
          <div>
            <div class="rate-card-top">
              <span class="rate-weight-badge" style="background:#fff2eb; color:#c84611;">${item.tag}</span>
              <span class="stock-tag">Available</span>
            </div>
            <h4 class="rate-title">${item.name}</h4>
            <div class="rate-subtitle">${item.desc}</div>
          </div>
          <div class="rate-price-block">
            <span class="rate-price-amount">${formatNaira(item.price)}</span>
            <a class="btn btn-sm btn-brand" href="https://wa.me/${CONFIG.phone}?text=Hello%20Happy%20Home%20Gas,%20I%20am%20interested%20in%20purchasing%20the%20${encodeURIComponent(item.name)}." target="_blank" rel="noopener">
              Inquire
            </a>
          </div>
        </div>
      `
      )
      .join("");
  }

  // Bind clicks on "Calculate" buttons in gas rates
  document.querySelectorAll(".select-rate-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const kg = parseFloat(e.currentTarget.dataset.kg);
      setCalculatorKg(kg);
      const calcSection = document.getElementById("calculator");
      if (calcSection) {
        calcSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Interactive Tabs Logic
// -----------------------------------------------------------------------------
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      tabContents.forEach((c) => c.classList.remove("is-active"));

      btn.classList.add("is-active");
      const targetId = btn.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("is-active");
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Smart Gas Refill & Order Calculator
// -----------------------------------------------------------------------------
let currentCalcState = {
  kg: 12.5,
  addons: {
    delivery: false,
    oring: false,
    hose: false,
    regulator: false
  }
};

const ADDON_PRICES = {
  delivery: 1000,
  oring: 300,
  hose: 2000,
  regulator: 6500
};

const ADDON_NAMES = {
  delivery: "Doorstep Delivery (Okabere)",
  oring: "Valve O-Ring Seal Replacement",
  hose: "2m Reinforced Orange Gas Hose",
  regulator: "Safety Gas Regulator"
};

function setCalculatorKg(val) {
  currentCalcState.kg = val;

  const slider = document.getElementById("calcKgSlider");
  const sliderDisplay = document.getElementById("calcKgDisplay");
  if (slider) slider.value = val;
  if (sliderDisplay) sliderDisplay.textContent = `${val} kg`;

  // Update preset buttons active state
  document.querySelectorAll(".calc-size-btn").forEach((btn) => {
    const btnKg = parseFloat(btn.dataset.kg);
    if (btnKg === val) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
  });

  recalculateTotal();
}

function recalculateTotal() {
  const kg = currentCalcState.kg;
  const gasCost = Math.round(kg * CONFIG.ratePerKg);

  let addonsCost = 0;
  const selectedAddonsList = [];

  for (const [key, isSelected] of Object.entries(currentCalcState.addons)) {
    if (isSelected) {
      addonsCost += ADDON_PRICES[key];
      selectedAddonsList.push(ADDON_NAMES[key]);
    }
  }

  const grandTotal = gasCost + addonsCost;

  // Update Receipt elements
  const receiptWeight = document.getElementById("receiptWeight");
  const receiptGasCost = document.getElementById("receiptGasCost");
  const receiptAddons = document.getElementById("receiptAddons");
  const receiptTotal = document.getElementById("receiptTotal");
  const receiptDuration = document.getElementById("receiptDuration");

  if (receiptWeight) receiptWeight.textContent = `${kg} kg LPG`;
  if (receiptGasCost) receiptGasCost.textContent = formatNaira(gasCost);
  if (receiptAddons) receiptAddons.textContent = formatNaira(addonsCost);
  if (receiptTotal) receiptTotal.textContent = formatNaira(grandTotal);

  if (receiptDuration) {
    if (kg <= 3) receiptDuration.textContent = "~1 to 2 weeks";
    else if (kg <= 6) receiptDuration.textContent = "~2 to 4 weeks";
    else if (kg <= 12.5) receiptDuration.textContent = "~4 to 6 weeks";
    else receiptDuration.textContent = "~8+ weeks (Commercial)";
  }

  // Update WhatsApp Button Link
  const orderBtn = document.getElementById("calcWhatsAppOrderBtn");
  if (orderBtn) {
    let message = `Hello Happy Home Gas!\n\nI want to order a *${kg}kg Cooking Gas Refill* at ₦${CONFIG.ratePerKg}/kg.`;
    if (selectedAddonsList.length > 0) {
      message += `\nAdd-ons requested:\n- ` + selectedAddonsList.join(`\n- `);
    }
    message += `\n\n*Estimated Total: ${formatNaira(grandTotal)}*`;
    message += `\nDelivery Address / Pickup details:`;

    orderBtn.href = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(message)}`;
  }
}

function setupCalculator() {
  const slider = document.getElementById("calcKgSlider");
  const presetButtons = document.querySelectorAll(".calc-size-btn");
  const addonCheckboxes = document.querySelectorAll(".calc-addon-item input[type='checkbox']");
  const orderBtn = document.getElementById("calcWhatsAppOrderBtn");

  if (slider) {
    slider.addEventListener("input", (e) => {
      setCalculatorKg(parseFloat(e.target.value));
    });
  }

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setCalculatorKg(parseFloat(btn.dataset.kg));
    });
  });

  addonCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const addonKey = e.target.dataset.addon;
      currentCalcState.addons[addonKey] = e.target.checked;
      recalculateTotal();
    });
  });

  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      triggerConfetti();
    });
  }

  // Initial calculation
  setCalculatorKg(12.5);
}

// -----------------------------------------------------------------------------
// Cylinder Expiry Checker
// -----------------------------------------------------------------------------
function setupExpiryChecker() {
  const input = document.getElementById("cylinderCodeInput");
  const button = document.getElementById("checkExpiryBtn");
  const result = document.getElementById("expiryResultBox");

  if (!button || !input || !result) return;

  button.addEventListener("click", () => {
    const code = input.value.trim().toUpperCase().replace(/[^A-D0-9]/g, "");
    if (!code || code.length < 3) {
      result.className = "expiry-result expired";
      result.textContent = "Please enter a valid cylinder code (e.g. A-28, B-26, C-25).";
      return;
    }

    const quarterChar = code.charAt(0);
    const yearDigits = code.substring(1);
    const year = 2000 + parseInt(yearDigits, 10);

    const quarterMonths = {
      A: "March (Q1)",
      B: "June (Q2)",
      C: "September (Q3)",
      D: "December (Q4)"
    };

    if (!quarterMonths[quarterChar] || isNaN(year)) {
      result.className = "expiry-result expired";
      result.textContent = "Unrecognized code format. Typical Nigerian LPG codes start with A, B, C, or D followed by two year digits (e.g. B-28).";
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let quarterEndMonth = 3;
    if (quarterChar === "B") quarterEndMonth = 6;
    if (quarterChar === "C") quarterEndMonth = 9;
    if (quarterChar === "D") quarterEndMonth = 12;

    const isExpired = year < currentYear || (year === currentYear && currentMonth > quarterEndMonth);

    if (isExpired) {
      result.className = "expiry-result expired";
      result.innerHTML = `⚠️ <strong>Cylinder Test Overdue!</strong> This cylinder was due for pressure requalification in <strong>${quarterMonths[quarterChar]} ${year}</strong>. Please bring it to Happy Home Gas for safety inspection or replacement.`;
    } else {
      result.className = "expiry-result valid";
      result.innerHTML = `✅ <strong>Cylinder In Certified Period!</strong> Your cylinder is tested and safe for refilling until <strong>${quarterMonths[quarterChar]} ${year}</strong>.`;
    }
  });
}

// -----------------------------------------------------------------------------
// Interactive Accordion (FAQ)
// -----------------------------------------------------------------------------
function setupFaq() {
  const faqButtons = document.querySelectorAll(".faq-button");

  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("is-open");

      // Close other items
      document.querySelectorAll(".faq-item").forEach((fi) => {
        fi.classList.remove("is-open");
        fi.querySelector(".faq-button").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Copy Address & Toast Alert
// -----------------------------------------------------------------------------
function setupAddressCopy() {
  const copyBtn = document.getElementById("copyAddressBtn");
  const toast = document.getElementById("toastNotice");

  if (!copyBtn) return;

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(CONFIG.address).then(() => {
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => {
          toast.classList.remove("show");
        }, 3200);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Navigation & Responsive Menu
// -----------------------------------------------------------------------------
function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  const header = document.querySelector(".site-header");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.addEventListener("click", (e) => {
      if (e.target.matches("a")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Header scroll shadow
  window.addEventListener("scroll", () => {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
  });
}

// -----------------------------------------------------------------------------
// Package Buttons Confetti Hookup
// -----------------------------------------------------------------------------
function setupPackageButtons() {
  document.querySelectorAll(".package-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerConfetti();
    });
  });
}

// -----------------------------------------------------------------------------
// Frame Sizing for Sandboxed Environments
// -----------------------------------------------------------------------------
function sendHeightToParent() {
  if (window.parent === window) return;
  window.parent.postMessage({ type: "web_page_height", height: document.body.scrollHeight }, "*");
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateLiveStatus();
  renderRates();
  setupTabs();
  setupCalculator();
  setupExpiryChecker();
  setupFaq();
  setupAddressCopy();
  setupNavigation();
  setupPackageButtons();

  // Keep live status in sync every minute
  setInterval(updateLiveStatus, 60000);

  // Send preview height
  sendHeightToParent();
  window.addEventListener("load", sendHeightToParent);
  if (window.ResizeObserver && document.documentElement) {
    new ResizeObserver(sendHeightToParent).observe(document.documentElement);
  }
});