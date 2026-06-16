const products = [
  {
    id: "gas-3kg",
    name: "3kg Cooking Gas Refill",
    price: 4500,
    tag: "Household",
    icon: "3kg",
    desc: "Small-cylinder refill for light home cooking."
  },
  {
    id: "gas-6kg",
    name: "6kg Cooking Gas Refill",
    price: 9000,
    tag: "Popular",
    icon: "6kg",
    desc: "Family-size refill for everyday meals."
  },
  {
    id: "gas-12kg",
    name: "12.5kg Cooking Gas Refill",
    price: 18500,
    tag: "Best Seller",
    icon: "12.5",
    desc: "Larger refill for homes and food businesses."
  },
  {
    id: "regulator",
    name: "Gas Regulator",
    price: 6500,
    tag: "Accessory",
    icon: "REG",
    desc: "Essential replacement regulator for safer cylinder use."
  },
  {
    id: "hose",
    name: "Gas Hose + Clips",
    price: 3500,
    tag: "Accessory",
    icon: "H+C",
    desc: "Gas hose and clips bundle for clean setup."
  },
  {
    id: "burner",
    name: "Portable Gas Burner",
    price: 12000,
    tag: "Accessory",
    icon: "PAN",
    desc: "Compact burner for small kitchens and quick cooking."
  }
];

const cart = new Map();
let memoryOrders = {};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

const selectors = {
  productGrid: document.querySelector("#productGrid"),
  cartItems: document.querySelector("#cartItems"),
  subtotal: document.querySelector("#subtotal"),
  deliveryFee: document.querySelector("#deliveryFee"),
  total: document.querySelector("#total"),
  checkoutForm: document.querySelector("#checkoutForm"),
  clearCart: document.querySelector("#clearCart"),
  fulfilment: document.querySelector("#fulfilment"),
  promoCode: document.querySelector("#promoCode"),
  orderNotice: document.querySelector("#orderNotice"),
  trackInput: document.querySelector("#trackInput"),
  trackBtn: document.querySelector("#trackBtn"),
  trackResult: document.querySelector("#trackResult"),
  navToggle: document.querySelector(".nav-toggle"),
  navLinks: document.querySelector("#navLinks")
};

const storage = {
  getOrders() {
    try {
      const raw = window.localStorage.getItem("happyHomeGasOrders");
      return raw ? JSON.parse(raw) : memoryOrders;
    } catch {
      return memoryOrders;
    }
  },
  saveOrder(order) {
    const orders = this.getOrders();
    orders[order.id] = order;
    memoryOrders = orders;

    try {
      window.localStorage.setItem("happyHomeGasOrders", JSON.stringify(orders));
    } catch {
      // Browser storage may be blocked in previews; memoryOrders keeps the demo usable.
    }
  },
  getOrder(id) {
    return this.getOrders()[String(id || "").trim().toUpperCase()];
  }
};

function formatNaira(amount) {
  return currency.format(amount).replace("NGN", "₦");
}

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function getSubtotal() {
  return [...cart.entries()].reduce((sum, [id, quantity]) => {
    return sum + getProduct(id).price * quantity;
  }, 0);
}

function getDeliveryFee() {
  return selectors.fulfilment.value === "Delivery" && getSubtotal() > 0 ? 1500 : 0;
}

function getDiscount() {
  const code = selectors.promoCode.value.trim().toUpperCase();
  return code === "GAS10" ? Math.round(getSubtotal() * 0.1) : 0;
}

function getTotal() {
  return Math.max(0, getSubtotal() + getDeliveryFee() - getDiscount());
}

function renderProducts() {
  selectors.productGrid.innerHTML = products
    .map((product) => {
      return `
        <article class="card product-card">
          <div class="product-visual" aria-hidden="true">${product.icon}</div>
          <div class="product-meta">
            <div>
              <span class="tag">${product.tag}</span>
              <h3>${product.name}</h3>
            </div>
            <strong class="price">${formatNaira(product.price)}</strong>
          </div>
          <p class="small">${product.desc}</p>
          <button class="btn btn-primary btn-small" type="button" data-add-product="${product.id}">Add to order</button>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  const entries = [...cart.entries()];

  selectors.cartItems.innerHTML = entries.length
    ? entries
        .map(([id, quantity]) => {
          const product = getProduct(id);

          return `
            <div class="cart-line">
              <div>
                <strong>${product.name}</strong>
                <div class="small">${formatNaira(product.price)} each</div>
              </div>
              <div class="qty-controls" aria-label="${product.name} quantity controls">
                <button type="button" data-quantity-id="${id}" data-quantity-change="-1" aria-label="Remove one ${product.name}">-</button>
                <strong>${quantity}</strong>
                <button type="button" data-quantity-id="${id}" data-quantity-change="1" aria-label="Add one ${product.name}">+</button>
              </div>
              <strong>${formatNaira(product.price * quantity)}</strong>
            </div>
          `;
        })
        .join("")
    : '<p class="small">Your cart is empty. Add products from the catalog above.</p>';

  selectors.subtotal.textContent = formatNaira(getSubtotal());
  selectors.deliveryFee.textContent = formatNaira(getDeliveryFee());

  const discount = getDiscount();
  selectors.total.textContent = discount
    ? `${formatNaira(getTotal())} (GAS10 applied)`
    : formatNaira(getTotal());
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateQuantity(id, change) {
  const nextQuantity = Math.max(0, (cart.get(id) || 0) + Number(change));

  if (nextQuantity === 0) {
    cart.delete(id);
  } else {
    cart.set(id, nextQuantity);
  }

  renderCart();
}

function generateOrderId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);

  return `GAS-${yyyy}${mm}${dd}-${rand}`;
}

function showNotice(element, message, kind = "success") {
  element.className = `notice show${kind === "error" ? " error" : ""}${kind === "warning" ? " warning" : ""}`;
  element.innerHTML = message;
}

function createOrder() {
  const form = selectors.checkoutForm;
  const fields = form.elements;
  const customerName = fields.customerName.value.trim();
  const customerPhone = fields.customerPhone.value.trim();
  const address = fields.address.value.trim();

  if (!cart.size) {
    showNotice(selectors.orderNotice, "Please add at least one product before checkout.", "error");
    return null;
  }

  if (!customerName || !customerPhone || !address) {
    showNotice(selectors.orderNotice, "Please enter your name, phone number, and address or pickup note.", "error");
    return null;
  }

  return {
    id: generateOrderId(),
    createdAt: new Date().toLocaleString(),
    name: customerName,
    phone: customerPhone,
    email: fields.customerEmail.value.trim(),
    fulfilment: fields.fulfilment.value,
    address,
    paymentMethod: fields.paymentMethod.value,
    promoCode: fields.promoCode.value.trim().toUpperCase(),
    notes: fields.notes.value.trim(),
    items: [...cart.entries()].map(([id, quantity]) => ({ ...getProduct(id), quantity })),
    subtotal: getSubtotal(),
    deliveryFee: getDeliveryFee(),
    discount: getDiscount(),
    total: getTotal(),
    status: fields.fulfilment.value === "Pickup" ? "Ready for station confirmation" : "Order received, dispatch pending",
    stage: 1
  };
}

function placeOrder(event) {
  event.preventDefault();

  const order = createOrder();
  if (!order) return;

  storage.saveOrder(order);
  cart.clear();
  renderCart();

  selectors.trackInput.value = order.id;
  showNotice(
    selectors.orderNotice,
    `<strong>Demo checkout complete.</strong><br>Your order ID is <strong>${order.id}</strong>. Total: <strong>${formatNaira(order.total)}</strong>.`
  );
}

function trackOrder() {
  const id = selectors.trackInput.value.trim().toUpperCase();
  const order = storage.getOrder(id);

  if (!order) {
    showNotice(
      selectors.trackResult,
      `No demo order found for <strong>${id || "blank ID"}</strong>. Place a demo order first, then paste the generated ID here.`,
      "warning"
    );
    return;
  }

  const items = order.items.map((item) => `${item.quantity} x ${item.name}`).join(", ");
  showNotice(
    selectors.trackResult,
    `<strong>${order.id}</strong><br>Status: <strong>${order.status}</strong><br>Customer: ${order.name} - ${order.fulfilment}<br>Items: ${items}<br>Total: <strong>${formatNaira(order.total)}</strong><br><span class="small">Created: ${order.createdAt}. Production tracking would be updated by staff.</span>`
  );
}

function clearCart() {
  cart.clear();
  renderCart();
  showNotice(selectors.orderNotice, "Cart cleared.", "warning");
}

function bindEvents() {
  selectors.productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (button) addToCart(button.dataset.addProduct);
  });

  selectors.cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quantity-id]");
    if (!button) return;
    updateQuantity(button.dataset.quantityId, button.dataset.quantityChange);
  });

  selectors.checkoutForm.addEventListener("submit", placeOrder);
  selectors.clearCart.addEventListener("click", clearCart);
  selectors.fulfilment.addEventListener("change", renderCart);
  selectors.promoCode.addEventListener("input", renderCart);
  selectors.trackBtn.addEventListener("click", trackOrder);
  selectors.trackInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") trackOrder();
  });

  selectors.navToggle.addEventListener("click", () => {
    const isOpen = selectors.navLinks.classList.toggle("is-open");
    selectors.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  selectors.navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      selectors.navLinks.classList.remove("is-open");
      selectors.navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function sendPreviewHeight() {
  if (window.parent === window) return;
  window.parent.postMessage({ type: "web_page_height", height: document.body.scrollHeight }, "*");
}

renderProducts();
renderCart();
bindEvents();

window.addEventListener("load", sendPreviewHeight);
new ResizeObserver(sendPreviewHeight).observe(document.documentElement);
