    const products = [
      { id: 'gas-3kg', name: '3kg Cooking Gas Refill', price: 4500, tag: 'Household', icon: '🔥', desc: 'Placeholder LPG refill price for small cylinders.' },
      { id: 'gas-6kg', name: '6kg Cooking Gas Refill', price: 9000, tag: 'Popular', icon: '🛢️', desc: 'Common family-size refill option.' },
      { id: 'gas-12kg', name: '12.5kg Cooking Gas Refill', price: 18500, tag: 'Best Seller', icon: '🧯', desc: 'Larger refill for homes and food businesses.' },
      { id: 'regulator', name: 'Gas Regulator', price: 6500, tag: 'Accessory', icon: '⚙️', desc: 'Placeholder regulator product listing.' },
      { id: 'hose', name: 'Gas Hose + Clips', price: 3500, tag: 'Accessory', icon: '🔗', desc: 'Hose and clips bundle placeholder.' },
      { id: 'burner', name: 'Portable Gas Burner', price: 12000, tag: 'Accessory', icon: '🍳', desc: 'Portable burner for compact cooking setups.' }
    ];

    let cart = {};
    let memoryOrders = {};
    const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

    const Storage = {
      getOrders() {
        try {
          const raw = window.localStorage.getItem('gasDemoOrders');
          return raw ? JSON.parse(raw) : memoryOrders;
        } catch (e) {
          return memoryOrders;
        }
      },
      saveOrder(order) {
        const orders = this.getOrders();
        orders[order.id] = order;
        memoryOrders = orders;
        try { window.localStorage.setItem('gasDemoOrders', JSON.stringify(orders)); } catch (e) {}
      },
      getOrder(id) {
        return this.getOrders()[String(id || '').trim().toUpperCase()];
      }
    };

    function formatNaira(amount) { return currency.format(amount).replace('NGN', '₦'); }
    function productById(id) { return products.find(p => p.id === id); }
    function subtotal() { return Object.entries(cart).reduce((sum, [id, qty]) => sum + productById(id).price * qty, 0); }
    function deliveryFee() { return document.getElementById('fulfilment')?.value === 'Delivery' && subtotal() > 0 ? 1500 : 0; }
    function discountAmount() {
      const code = document.getElementById('promoCode')?.value.trim().toUpperCase();
      return code === 'GAS10' ? Math.round(subtotal() * 0.10) : 0;
    }
    function total() { return Math.max(0, subtotal() + deliveryFee() - discountAmount()); }

    function renderProducts() {
      const grid = document.getElementById('productGrid');
      grid.innerHTML = products.map(p => `
        <article class="card product-card">
          <div class="product-img"><div class="product-visual" aria-hidden="true">${p.icon}</div></div>
          <div class="product-meta"><div><span class="tag">${p.tag}</span><h3 style="margin-top:8px;">${p.name}</h3></div><div class="price">${formatNaira(p.price)}</div></div>
          <p class="small">${p.desc}</p>
          <button class="btn btn-primary btn-small" type="button" onclick="addToCart('${p.id}')">Add to order</button>
        </article>
      `).join('');
    }

    function addToCart(id) {
      cart[id] = (cart[id] || 0) + 1;
      renderCart();
      document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateQty(id, delta) {
      cart[id] = Math.max(0, (cart[id] || 0) + delta);
      if (cart[id] === 0) delete cart[id];
      renderCart();
    }

    function renderCart() {
      const holder = document.getElementById('cartItems');
      const entries = Object.entries(cart);
      if (!entries.length) {
        holder.innerHTML = '<p class="small">Your cart is empty. Add products from the catalog above.</p>';
      } else {
        holder.innerHTML = entries.map(([id, qty]) => {
          const p = productById(id);
          return `<div class="cart-line"><div><strong>${p.name}</strong><br><span class="small">${formatNaira(p.price)} each</span></div><div class="qty-controls"><button type="button" onclick="updateQty('${id}',-1)">−</button><strong>${qty}</strong><button type="button" onclick="updateQty('${id}',1)">+</button></div><strong>${formatNaira(p.price * qty)}</strong></div>`;
        }).join('');
      }
      document.getElementById('subtotal').textContent = formatNaira(subtotal());
      document.getElementById('deliveryFee').textContent = formatNaira(deliveryFee());
      const discount = discountAmount();
      document.getElementById('total').textContent = discount ? `${formatNaira(total())} (GAS10 applied)` : formatNaira(total());
    }

    function generateOrderId() {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `GAS-${yyyy}${mm}${dd}-${rand}`;
    }

    function showNotice(id, message, kind = 'success') {
      const box = document.getElementById(id);
      box.className = 'notice show' + (kind === 'error' ? ' error' : kind === 'warning' ? ' warning' : '');
      box.innerHTML = message;
    }

    function placeOrder() {
      if (!Object.keys(cart).length) return showNotice('orderNotice', 'Please add at least one product to your cart before checkout.', 'error');
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const address = document.getElementById('address').value.trim();
      if (!name || !phone || !address) return showNotice('orderNotice', 'Please enter your name, phone number, and delivery/pickup address note.', 'error');
      const items = Object.entries(cart).map(([id, qty]) => ({ ...productById(id), qty }));
      const order = {
        id: generateOrderId(),
        createdAt: new Date().toLocaleString(),
        name,
        phone,
        email: document.getElementById('customerEmail').value.trim(),
        fulfilment: document.getElementById('fulfilment').value,
        address,
        paymentMethod: document.getElementById('paymentMethod').value,
        promoCode: document.getElementById('promoCode').value.trim().toUpperCase(),
        notes: document.getElementById('notes').value.trim(),
        items,
        subtotal: subtotal(),
        deliveryFee: deliveryFee(),
        discount: discountAmount(),
        total: total(),
        status: document.getElementById('fulfilment').value === 'Pickup' ? 'Ready for station confirmation' : 'Order received — dispatch pending',
        stage: 1
      };
      Storage.saveOrder(order);
      cart = {};
      renderCart();
      document.getElementById('trackInput').value = order.id;
      showNotice('orderNotice', `<strong>Demo checkout complete!</strong><br>Your generated order ID is <strong>${order.id}</strong>. Total: <strong>${formatNaira(order.total)}</strong>. Use this ID in the tracking section below.`);
    }

    function trackOrder() {
      const id = document.getElementById('trackInput').value.trim().toUpperCase();
      const order = Storage.getOrder(id);
      if (!order) {
        return showNotice('trackResult', `No demo order found for <strong>${id || 'blank ID'}</strong>. Place a demo order first, then paste the generated order ID here.`, 'warning');
      }
      const itemList = order.items.map(i => `${i.qty}× ${i.name}`).join(', ');
      showNotice('trackResult', `<strong>${order.id}</strong><br>Status: <strong>${order.status}</strong><br>Customer: ${order.name} · ${order.fulfilment}<br>Items: ${itemList}<br>Total: <strong>${formatNaira(order.total)}</strong><br><span class="small">Created: ${order.createdAt}. In production, this status would be updated by staff from an admin dashboard.</span>`);
    }

    document.getElementById('placeOrder').addEventListener('click', placeOrder);
    document.getElementById('trackBtn').addEventListener('click', trackOrder);
    document.getElementById('clearCart').addEventListener('click', () => { cart = {}; renderCart(); showNotice('orderNotice', 'Cart cleared.', 'warning'); });
    document.getElementById('fulfilment').addEventListener('change', renderCart);
    document.getElementById('promoCode').addEventListener('input', renderCart);
    document.getElementById('trackInput').addEventListener('keydown', e => { if (e.key === 'Enter') trackOrder(); });

    renderProducts();
    renderCart();
  </script>
  <script>
    const send = () => parent.postMessage(
      { type: 'web_page_height', height: document.body.scrollHeight },
      '*'
    );
    window.addEventListener('load', send);
    new ResizeObserver(send).observe(document.documentElement);