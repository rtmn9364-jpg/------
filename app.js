/**
 * Nova Shop - Main Application JS
 * Handles routing, state, API calls, and UI rendering
 */

// ─── API Configuration ────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ─── State Management ─────────────────────────────────────────────────────────
const state = {
  user:       null,
  token:      localStorage.getItem('token'),
  cart:       JSON.parse(localStorage.getItem('cart') || '{"items":[]}'),
  products:   [],
  currentPage: 'home'
};

// ─── API Client ───────────────────────────────────────────────────────────────
const api = {
  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      // If server is offline, use mock data for demo
      if (err.name === 'TypeError') {
        return api.mockResponse(endpoint, options);
      }
      throw err;
    }
  },

  // Mock responses for demo when backend is not running
  mockResponse(endpoint, options) {
    if (endpoint.startsWith('/products') && (!options.method || options.method === 'GET')) {
      return { success: true, products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, pages: 1 };
    }
    if (endpoint === '/auth/login' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      if (body.email === 'admin@shop.com') {
        return { success: true, token: 'mock-admin-token', user: { _id: '1', name: 'Admin', email: body.email, role: 'admin' } };
      }
      return { success: true, token: 'mock-token', user: { _id: '2', name: 'Jane Doe', email: body.email, role: 'customer' } };
    }
    if (endpoint === '/auth/register' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      return { success: true, token: 'mock-token', user: { _id: '3', name: body.name, email: body.email, role: 'customer' } };
    }
    return { success: true, data: [] };
  },

  get:    (ep) => api.request(ep),
  post:   (ep, body) => api.request(ep, { method: 'POST', body: JSON.stringify(body) }),
  put:    (ep, body) => api.request(ep, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (ep) => api.request(ep, { method: 'DELETE' })
};

// ─── Mock Product Data ────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { _id: '1', name: 'Sony WH-1000XM5 Headphones', price: 279.99, comparePrice: 349.99, category: 'Electronics', brand: 'Sony', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], stock: 45, rating: 4.8, numReviews: 234, isFeatured: true, description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life.' },
  { _id: '2', name: 'Apple AirPods Pro 2nd Gen', price: 219.99, comparePrice: 249.99, category: 'Electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'], stock: 78, rating: 4.9, numReviews: 567, isFeatured: true, description: 'Active Noise Cancellation blocks outside noise. Personalized Spatial Audio with dynamic head tracking.' },
  { _id: '3', name: 'Samsung 65" 4K QLED TV', price: 1199.99, comparePrice: 1499.99, category: 'Electronics', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600'], stock: 12, rating: 4.7, numReviews: 189, isFeatured: true, description: 'Quantum Dot technology delivers a billion shades of brilliant color.' },
  { _id: '4', name: 'MacBook Pro 14" M3 Pro', price: 1999.99, category: 'Electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], stock: 20, rating: 4.9, numReviews: 312, description: 'Supercharged by M3 Pro chip. Up to 18-hour battery life.' },
  { _id: '5', name: 'Nike Air Max 270', price: 129.99, comparePrice: 150.00, category: 'Sports', brand: 'Nike', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], stock: 95, rating: 4.6, numReviews: 445, isFeatured: true, description: 'Max Air unit in the heel for exceptional comfort. Engineered mesh upper.' },
  { _id: '6', name: "Levi's 501 Original Jeans", price: 59.99, comparePrice: 79.99, category: 'Clothing', brand: "Levi's", images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'], stock: 150, rating: 4.5, numReviews: 892, description: 'The original jean since 1873. Button fly. 100% cotton denim.' },
  { _id: '7', name: 'Instant Pot Duo 7-in-1', price: 79.99, comparePrice: 99.99, category: 'Home & Garden', brand: 'Instant Pot', images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600'], stock: 67, rating: 4.7, numReviews: 1234, isFeatured: true, description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.' },
  { _id: '8', name: 'Dyson V15 Detect Vacuum', price: 649.99, comparePrice: 749.99, category: 'Home & Garden', brand: 'Dyson', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], stock: 30, rating: 4.8, numReviews: 678, description: 'Laser detects invisible dust. HEPA filtration captures particles as small as 0.1 microns.' },
  { _id: '9', name: 'Psychology of Money Book', price: 18.99, category: 'Books', brand: 'Harriman House', images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'], stock: 200, rating: 4.9, numReviews: 2341, description: 'Timeless lessons on wealth, greed, and happiness. One of the best personal finance books.' },
  { _id: '10', name: 'Premium Yoga Mat', price: 45.99, category: 'Sports', brand: 'YogaFlow', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'], stock: 120, rating: 4.4, numReviews: 567, description: 'Professional grade 6mm thick yoga mat. Non-slip surface for stability.' },
  { _id: '11', name: 'CeraVe Moisturizing Cream', price: 14.99, comparePrice: 18.99, category: 'Beauty', brand: 'CeraVe', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'], stock: 300, rating: 4.8, numReviews: 4521, description: 'Developed with dermatologists. Contains three essential ceramides.' },
  { _id: '12', name: 'LEGO Technic Ferrari 488', price: 169.99, category: 'Toys', brand: 'LEGO', images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'], stock: 40, rating: 4.9, numReviews: 231, isFeatured: true, description: 'Iconic Ferrari replica with detailed V8 engine and working steering. 1677 pieces.' }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(p) { return `$${Number(p).toFixed(2)}`; }
function calcDiscount(price, compare) {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}
function slugify(s) { return s.toLowerCase().replace(/\s+/g, '-'); }
function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── Toast System ─────────────────────────────────────────────────────────────
function showToast(msg, type = 'default', duration = 3500) {
  const icons = { success: '✓', error: '✕', warning: '⚠', default: 'ℹ' };
  const container = $('#toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
}
function createToastContainer() {
  const el = document.createElement('div');
  el.id = 'toast-container';
  el.className = 'toast-container';
  document.body.appendChild(el);
  return el;
}

// ─── Cart Management ──────────────────────────────────────────────────────────
const cart = {
  get items() { return state.cart.items || []; },

  save() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    this.updateBadge();
    renderCartSidebar();
  },

  add(product, qty = 1) {
    const existing = state.cart.items.find(i => i.productId === product._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      state.cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: qty,
        stock: product.stock
      });
    }
    this.save();
    showToast(`${truncate(product.name, 30)} added to cart`, 'success');
  },

  remove(productId) {
    state.cart.items = state.cart.items.filter(i => i.productId !== productId);
    this.save();
  },

  updateQty(productId, qty) {
    const item = state.cart.items.find(i => i.productId === productId);
    if (item) {
      if (qty <= 0) return this.remove(productId);
      item.quantity = Math.min(qty, item.stock);
      this.save();
    }
  },

  clear() {
    state.cart.items = [];
    this.save();
  },

  get total() { return state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0); },
  get count()  { return state.cart.items.reduce((s, i) => s + i.quantity, 0); },

  updateBadge() {
    $$('.cart-badge').forEach(el => {
      const count = this.count;
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ─── Auth Management ──────────────────────────────────────────────────────────
const auth = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    state.token = data.token;
    state.user  = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNavForAuth();
    return data;
  },

  async register(name, email, password) {
    const data = await api.post('/auth/register', { name, email, password });
    state.token = data.token;
    state.user  = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNavForAuth();
    return data;
  },

  logout() {
    state.token = null;
    state.user  = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavForAuth();
    showToast('Logged out successfully');
    navigate('home');
  },

  init() {
    const saved = localStorage.getItem('user');
    if (saved && state.token) {
      state.user = JSON.parse(saved);
    }
  }
};

// ─── Router ───────────────────────────────────────────────────────────────────
const routes = {
  home:     renderHome,
  products: renderProducts,
  product:  renderProductDetail,
  cart:     renderCartPage,
  checkout: renderCheckout,
  orders:   renderOrders,
  admin:    renderAdmin,
  profile:  renderProfile
};

function navigate(page, params = {}) {
  state.currentPage = page;
  state.params = params;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
  // Update URL hash for bookmarkability
  window.location.hash = params.id ? `#${page}/${params.id}` : `#${page}`;
}

function render() {
  const main = $('#main-content');
  if (!main) return;
  main.innerHTML = '';
  main.className = 'page page-enter';
  const renderFn = routes[state.currentPage] || renderHome;
  renderFn(main, state.params || {});
  updateNavLinks();
}

// ─── Navigation Component ─────────────────────────────────────────────────────
function renderNav() {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'main-nav';
  nav.innerHTML = `
    <div class="container nav-inner">
      <a class="nav-logo" href="#" onclick="navigate('home')">Nova<span>Shop</span></a>

      <div class="nav-links" id="nav-links">
        <a href="#" onclick="navigate('home')">Home</a>
        <a href="#" onclick="navigate('products')">Shop</a>
        <a href="#" onclick="navigate('products', {category: 'Electronics'})">Electronics</a>
        <a href="#" onclick="navigate('products', {category: 'Clothing'})">Clothing</a>
        <a href="#" onclick="navigate('products', {category: 'Sports'})">Sports</a>
      </div>

      <div class="nav-actions">
        <button class="nav-icon-btn" id="nav-search-btn" title="Search" onclick="toggleSearch()">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        <div id="nav-auth-area">
          ${state.user
            ? `<button class="btn btn-ghost btn-sm" onclick="showUserMenu()">${state.user.name.split(' ')[0]} ▾</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="openAuthModal('login')">Sign In</button>`
          }
        </div>

        ${state.user?.role === 'admin' ? `<button class="btn btn-gold btn-sm" onclick="navigate('admin')">Admin</button>` : ''}

        <button class="nav-icon-btn" onclick="openCart()" title="Cart">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span class="badge cart-badge" style="display:${cart.count > 0 ? 'flex' : 'none'}">${cart.count}</span>
        </button>

        <button class="hamburger" id="hamburger" onclick="toggleMobileMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Search Bar (Hidden by default) -->
    <div id="search-bar" style="display:none; padding:12px 24px; border-top:1px solid var(--gray-100);">
      <div class="container">
        <input type="text" class="form-input" id="search-input" placeholder="Search products..."
          onkeyup="handleSearch(event)" style="max-width:500px;">
      </div>
    </div>
  `;
  document.body.prepend(nav);

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function updateNavForAuth() {
  const area = $('#nav-auth-area');
  if (!area) return;
  area.innerHTML = state.user
    ? `<button class="btn btn-ghost btn-sm" onclick="showUserMenu()">${state.user.name.split(' ')[0]} ▾</button>`
    : `<button class="btn btn-ghost btn-sm" onclick="openAuthModal('login')">Sign In</button>`;
}

function updateNavLinks() {
  $$('.nav-links a').forEach(a => {
    a.style.fontWeight = a.textContent.toLowerCase().includes(state.currentPage) ? '700' : '';
  });
}

function toggleMobileMenu() {
  const links = $('#nav-links');
  links.classList.toggle('open');
}

function toggleSearch() {
  const bar = $('#search-bar');
  bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
  if (bar.style.display === 'block') setTimeout(() => $('#search-input')?.focus(), 50);
}

function handleSearch(e) {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) {
      navigate('products', { search: q });
      toggleSearch();
    }
  }
}

function showUserMenu() {
  const existing = $('#user-dropdown');
  if (existing) { existing.remove(); return; }

  const menu = document.createElement('div');
  menu.id = 'user-dropdown';
  menu.style.cssText = `
    position:fixed; top:70px; right:24px; background:white; border:1px solid var(--gray-100);
    border-radius:var(--radius-md); box-shadow:var(--shadow-lg); padding:8px; min-width:180px; z-index:1001;
  `;
  menu.innerHTML = `
    <div style="padding:8px 12px; font-size:0.8rem; color:var(--gray-500); border-bottom:1px solid var(--gray-100); margin-bottom:4px;">
      ${state.user?.name}<br><small>${state.user?.email}</small>
    </div>
    <button onclick="navigate('orders'); document.getElementById('user-dropdown')?.remove()" style="display:block; width:100%; text-align:left; padding:8px 12px; border-radius:4px; font-size:0.875rem;" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background=''">My Orders</button>
    <button onclick="navigate('profile'); document.getElementById('user-dropdown')?.remove()" style="display:block; width:100%; text-align:left; padding:8px 12px; border-radius:4px; font-size:0.875rem;" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background=''">Profile</button>
    ${state.user?.role === 'admin' ? `<button onclick="navigate('admin'); document.getElementById('user-dropdown')?.remove()" style="display:block; width:100%; text-align:left; padding:8px 12px; border-radius:4px; font-size:0.875rem; color:var(--gold);" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background=''">Admin Panel</button>` : ''}
    <hr style="margin:4px 0; border-color:var(--gray-100);">
    <button onclick="auth.logout(); document.getElementById('user-dropdown')?.remove()" style="display:block; width:100%; text-align:left; padding:8px 12px; border-radius:4px; font-size:0.875rem; color:var(--red);" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background=''">Sign Out</button>
  `;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 10);
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function renderCartSidebar() {
  let overlay = $('#cart-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.className = 'cart-overlay';
    overlay.onclick = closeCart;
    document.body.appendChild(overlay);
  }

  let sidebar = $('#cart-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'cart-sidebar';
    sidebar.className = 'cart-sidebar';
    document.body.appendChild(sidebar);
  }

  const items = cart.items;
  const isEmpty = items.length === 0;

  sidebar.innerHTML = `
    <div class="cart-header">
      <h3>Shopping Cart <small style="color:var(--gray-500)">(${cart.count})</small></h3>
      <button class="cart-close" onclick="closeCart()">✕</button>
    </div>

    <div class="cart-items">
      ${isEmpty
        ? `<div class="cart-empty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-1.684 2.032-3.375 2.032-5.25A6.75 6.75 0 0 0 7.5 6c-1.684 0-3.212.618-4.366 1.634"/>
            </svg>
            <p>Your cart is empty</p>
            <button class="btn btn-primary btn-sm" onclick="navigate('products'); closeCart()">Shop Now</button>
          </div>`
        : items.map(item => `
            <div class="cart-item">
              <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
              </div>
              <div class="cart-item-info">
                <div class="cart-item-name">${truncate(item.name, 35)}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-qty">
                  <button class="qty-btn" onclick="cart.updateQty('${item.productId}', ${item.quantity - 1})">−</button>
                  <span class="qty-value">${item.quantity}</span>
                  <button class="qty-btn" onclick="cart.updateQty('${item.productId}', ${item.quantity + 1})">+</button>
                  <span style="flex:1"></span>
                  <span class="cart-item-remove" onclick="cart.remove('${item.productId}')">Remove</span>
                </div>
              </div>
            </div>
          `).join('')
      }
    </div>

    ${!isEmpty ? `
    <div class="cart-footer">
      <div class="cart-subtotal"><span>Subtotal</span><span>${formatPrice(cart.total)}</span></div>
      <div class="cart-subtotal"><span>Shipping</span><span>${cart.total > 100 ? 'Free' : '$9.99'}</span></div>
      <div class="cart-total"><span>Total</span><span>${formatPrice(cart.total + (cart.total > 100 ? 0 : 9.99))}</span></div>
      <button class="btn btn-primary btn-full" onclick="closeCart(); navigate('checkout')">
        Proceed to Checkout →
      </button>
      <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="closeCart(); navigate('products')">
        Continue Shopping
      </button>
    </div>
    ` : ''}
  `;
}

function openCart() {
  renderCartSidebar();
  $('#cart-overlay')?.classList.add('open');
  $('#cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cart-overlay')?.classList.remove('open');
  $('#cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function openAuthModal(mode = 'login') {
  let overlay = $('#auth-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeAuthModal(); };
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p class="modal-subtitle">${mode === 'login' ? 'Sign in to your account' : 'Join Nova Shop today'}</p>
      </div>

      <div class="tabs" id="auth-tabs">
        <button class="tab-btn ${mode === 'login' ? 'active' : ''}" onclick="openAuthModal('login')">Sign In</button>
        <button class="tab-btn ${mode === 'register' ? 'active' : ''}" onclick="openAuthModal('register')">Register</button>
      </div>

      ${mode === 'login' ? `
        <form id="login-form" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="login-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="login-password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="login-btn">Sign In</button>
          <p style="font-size:0.75rem; text-align:center; color:var(--gray-500); margin-top:12px;">
            Demo: admin@shop.com / Admin123! or any email/password
          </p>
        </form>
      ` : `
        <form id="register-form" onsubmit="handleRegister(event)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="reg-name" placeholder="Jane Doe" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="reg-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="reg-password" placeholder="Min 6 characters" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="register-btn">Create Account</button>
        </form>
      `}

      <button onclick="closeAuthModal()" style="position:absolute; top:16px; right:16px; font-size:1.2rem; color:var(--gray-500); padding:4px 8px;">✕</button>
    </div>
  `;

  overlay.style.position = 'fixed';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const overlay = $('#auth-modal-overlay');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = $('#login-btn');
  const email = $('#login-email').value;
  const password = $('#login-password').value;
  btn.textContent = 'Signing in…';
  btn.disabled = true;
  try {
    await auth.login(email, password);
    closeAuthModal();
    showToast(`Welcome back, ${state.user.name.split(' ')[0]}!`, 'success');
    render(); // Re-render current page
  } catch (err) {
    showToast(err.message, 'error');
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = $('#register-btn');
  const name = $('#reg-name').value;
  const email = $('#reg-email').value;
  const password = $('#reg-password').value;
  btn.textContent = 'Creating account…';
  btn.disabled = true;
  try {
    await auth.register(name, email, password);
    closeAuthModal();
    showToast(`Welcome to Nova Shop, ${name.split(' ')[0]}!`, 'success');
    render();
  } catch (err) {
    showToast(err.message, 'error');
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}

// ─── Product Card Component ───────────────────────────────────────────────────
function productCard(product) {
  const discount = calcDiscount(product.price, product.comparePrice);
  return `
    <div class="product-card" onclick="navigate('product', {id: '${product._id}'})">
      <div class="product-card-img">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        ${discount ? `<span class="product-badge badge-sale">-${discount}%</span>` : ''}
        ${product.isFeatured && !discount ? `<span class="product-badge badge-featured">Featured</span>` : ''}
        <div class="product-actions-overlay">
          <button class="product-action-btn" title="Quick Add to Cart" onclick="event.stopPropagation(); cart.add(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
          <button class="product-action-btn" title="View Details">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${truncate(product.name, 50)}</h3>
        <div class="product-rating">
          <span class="stars">${renderStars(product.rating || 0)}</span>
          <span class="rating-count">(${product.numReviews || 0})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.comparePrice ? `<span class="price-original">${formatPrice(product.comparePrice)}</span>` : ''}
          ${discount ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function renderHome(container) {
  const featured = MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);

  container.innerHTML = `
    <!-- Promo Strip -->
    <div class="promo-strip">
      🚚 Free shipping on orders over <span>$100</span> · Use code <span>NOVA10</span> for 10% off your first order
    </div>

    <!-- Hero -->
    <section class="hero">
      <div style="max-width:1280px; margin:0 auto; padding:0 24px; display:grid; grid-template-columns:1fr 1fr; width:100%;">
        <div class="hero-content page-enter">
          <div class="hero-eyebrow">New Collection 2026</div>
          <h1 class="hero-title">
            Discover Products You'll <span class="accent">Love</span>
          </h1>
          <p class="hero-desc">
            Shop the latest trends in electronics, fashion, home goods, and more.
            Curated for quality, delivered with care.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" onclick="navigate('products')">Shop Now →</button>
            <button class="btn btn-outline btn-lg" onclick="navigate('products', {featured: true})">Featured Items</button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" alt="Shop" loading="eager">
          <div class="hero-badge">
            <span>50+</span>
            Brands Available
          </div>
        </div>
      </div>
    </section>

    <!-- Category Grid -->
    <section class="section" style="background:var(--cream)">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-eyebrow">Browse by Category</div>
            <h2 class="section-title">Shop Every Category</h2>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigate('products')">View All →</button>
        </div>

        <div class="category-grid">
          ${[
            { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
            { name: 'Clothing',    img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
            { name: 'Sports',     img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
            { name: 'Home & Garden', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' }
          ].map(cat => `
            <div class="category-tile" onclick="navigate('products', {category: '${cat.name}'})">
              <img src="${cat.img}" alt="${cat.name}" loading="lazy">
              <div class="category-tile-overlay">
                <span class="category-tile-name">${cat.name}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-eyebrow">Hand-Picked</div>
            <h2 class="section-title">Featured Products</h2>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigate('products')">View All →</button>
        </div>
        <div class="product-grid">
          ${featured.map(productCard).join('')}
        </div>
      </div>
    </section>

    <!-- Promo Banner -->
    <section style="background:var(--black); padding:80px 0; margin:0;">
      <div class="container" style="text-align:center;">
        <div style="font-size:0.7rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:16px;">Limited Time</div>
        <h2 style="font-family:var(--font-display); color:white; font-size:clamp(1.5rem, 4vw, 2.5rem); margin-bottom:16px;">Get 20% Off Your First Order</h2>
        <p style="color:var(--gray-500); margin-bottom:32px; max-width:400px; margin-left:auto; margin-right:auto;">Sign up for our newsletter and receive an exclusive discount on your first purchase.</p>
        <div style="display:flex; gap:12px; max-width:400px; margin:0 auto; justify-content:center;">
          <input type="email" class="form-input" placeholder="your@email.com" style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white; flex:1;">
          <button class="btn btn-gold" onclick="showToast('Thanks! Check your email for discount code.', 'success')">Subscribe</button>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-eyebrow">Customer Reviews</div>
            <h2 class="section-title">What Our Customers Say</h2>
          </div>
        </div>
        <div class="grid-3">
          ${[
            { name: 'Sarah M.', role: 'Verified Buyer', text: 'Absolutely love the quality! The headphones I ordered exceeded my expectations. Fast shipping too.', stars: 5, init: 'S' },
            { name: 'James K.', role: 'Regular Customer', text: 'Been shopping here for months. Always great products and the customer service is outstanding.', stars: 5, init: 'J' },
            { name: 'Lisa R.', role: 'Verified Buyer', text: 'The return process was seamless. Got a full refund with no questions asked. Will definitely shop again.', stars: 5, init: 'L' }
          ].map(t => `
            <div class="testimonial-card">
              <div class="testimonial-stars">${'★'.repeat(t.stars)}</div>
              <p class="testimonial-text">"${t.text}"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">${t.init}</div>
                <div>
                  <div class="testimonial-name">${t.name}</div>
                  <div class="testimonial-role">${t.role}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section style="background:var(--cream); padding:48px 0;">
      <div class="container">
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; text-align:center;">
          ${[
            { icon: '🚚', title: 'Free Shipping', sub: 'On orders over $100' },
            { icon: '↩️', title: '30-Day Returns', sub: 'Hassle-free returns' },
            { icon: '🔒', title: 'Secure Checkout', sub: 'SSL encryption' },
            { icon: '🏆', title: 'Quality Guaranteed', sub: 'Top-rated products' }
          ].map(b => `
            <div>
              <div style="font-size:2rem; margin-bottom:8px;">${b.icon}</div>
              <div style="font-weight:700; font-size:0.9rem; margin-bottom:4px;">${b.title}</div>
              <div style="font-size:0.8rem; color:var(--gray-500);">${b.sub}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
async function renderProducts(container, params = {}) {
  container.innerHTML = `
    <div style="padding-top:24px;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;">Shop All Products</h1>
          <p style="color:var(--gray-500); margin-top:8px;">Discover our curated collection</p>
        </div>

        <div style="display:grid; grid-template-columns:240px 1fr; gap:40px; align-items:start;">
          <!-- Filters Sidebar -->
          <div>
            <div style="position:sticky; top:90px;">
              <div style="background:var(--cream); border-radius:var(--radius-lg); padding:24px; margin-bottom:16px;">
                <h4 style="margin-bottom:16px; font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase;">Categories</h4>
                <div id="category-filters">
                  <button class="btn btn-ghost btn-sm" style="display:block; text-align:left; width:100%; margin-bottom:4px; font-size:0.85rem; color:${!params.category ? 'var(--black)' : 'var(--gray-500)'}; font-weight:${!params.category ? '700' : '400'};" onclick="navigate('products')">All Products</button>
                  ${['Electronics', 'Clothing', 'Sports', 'Home & Garden', 'Books', 'Beauty', 'Toys'].map(cat => `
                    <button class="btn btn-ghost btn-sm" style="display:block; text-align:left; width:100%; margin-bottom:4px; font-size:0.85rem; color:${params.category === cat ? 'var(--black)' : 'var(--gray-500)'}; font-weight:${params.category === cat ? '700' : '400'};" onclick="navigate('products', {category: '${cat}'})">${cat}</button>
                  `).join('')}
                </div>
              </div>

              <div style="background:var(--cream); border-radius:var(--radius-lg); padding:24px;">
                <h4 style="margin-bottom:16px; font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase;">Price Range</h4>
                <div style="display:flex; gap:8px; align-items:center;">
                  <input type="number" id="price-min" placeholder="Min" class="form-input" style="font-size:0.85rem; padding:8px 10px;" value="${params.minPrice || ''}">
                  <span>–</span>
                  <input type="number" id="price-max" placeholder="Max" class="form-input" style="font-size:0.85rem; padding:8px 10px;" value="${params.maxPrice || ''}">
                </div>
                <button class="btn btn-primary btn-sm btn-full" style="margin-top:12px;" onclick="applyPriceFilter()">Apply</button>
              </div>
            </div>
          </div>

          <!-- Product Grid -->
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
              <div id="product-count" style="font-size:0.875rem; color:var(--gray-500);">Loading products…</div>
              <select class="form-select" style="width:auto; font-size:0.875rem;" id="sort-select" onchange="handleSort(this.value)">
                <option value="-createdAt">Latest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
              </select>
            </div>
            <div class="product-grid" id="products-grid">
              ${[1,2,3,4,5,6,7,8].map(() => `
                <div style="border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--gray-100);">
                  <div class="skeleton" style="aspect-ratio:1;"></div>
                  <div style="padding:16px;">
                    <div class="skeleton" style="height:12px; width:60%; margin-bottom:8px;"></div>
                    <div class="skeleton" style="height:18px; margin-bottom:8px;"></div>
                    <div class="skeleton" style="height:12px; width:40%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="pagination" id="pagination"></div>
          </div>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;

  // Load products
  let products = [...MOCK_PRODUCTS];
  if (params.category) products = products.filter(p => p.category === params.category);
  if (params.search) products = products.filter(p => p.name.toLowerCase().includes(params.search.toLowerCase()) || p.description.toLowerCase().includes(params.search.toLowerCase()));
  if (params.minPrice) products = products.filter(p => p.price >= Number(params.minPrice));
  if (params.maxPrice) products = products.filter(p => p.price <= Number(params.maxPrice));
  if (params.featured) products = products.filter(p => p.isFeatured);

  const grid = $('#products-grid');
  const count = $('#product-count');
  if (grid) {
    grid.innerHTML = products.length ? products.map(productCard).join('') : '<p style="grid-column:1/-1; text-align:center; color:var(--gray-500); padding:48px;">No products found.</p>';
  }
  if (count) count.textContent = `${products.length} products`;
}

window.applyPriceFilter = function() {
  const min = $('#price-min')?.value;
  const max = $('#price-max')?.value;
  navigate('products', { ...state.params, minPrice: min, maxPrice: max });
};

window.handleSort = function(sort) {
  const products = $$('#products-grid .product-card');
  // Simple client-side sort for demo
  const sorted = [...MOCK_PRODUCTS].sort((a, b) => {
    if (sort === 'price')    return a.price - b.price;
    if (sort === '-price')   return b.price - a.price;
    if (sort === '-rating')  return b.rating - a.rating;
    return 0;
  });
  const grid = $('#products-grid');
  if (grid) grid.innerHTML = sorted.map(productCard).join('');
};

// ─── PRODUCT DETAIL PAGE ──────────────────────────────────────────────────────
function renderProductDetail(container, params = {}) {
  const product = MOCK_PRODUCTS.find(p => p._id === params.id);
  if (!product) {
    container.innerHTML = '<div class="container" style="padding:80px 24px; text-align:center;"><h2>Product not found</h2><button class="btn btn-primary" style="margin-top:24px" onclick="navigate(\'products\')">Back to Shop</button></div>';
    return;
  }

  const discount = calcDiscount(product.price, product.comparePrice);

  container.innerHTML = `
    <div style="padding-top:40px; padding-bottom:80px;">
      <div class="container">
        <div class="breadcrumb">
          <a href="#" onclick="navigate('home')">Home</a>
          <span>›</span>
          <a href="#" onclick="navigate('products')">Shop</a>
          <span>›</span>
          <a href="#" onclick="navigate('products', {category: '${product.category}'})">${product.category}</a>
          <span>›</span>
          <span style="color:var(--black)">${truncate(product.name, 30)}</span>
        </div>

        <div class="product-detail-grid">
          <!-- Gallery -->
          <div class="product-gallery">
            <div class="gallery-main" id="gallery-main">
              <img src="${product.images[0]}" alt="${product.name}" id="main-img">
            </div>
            ${product.images.length > 1 ? `
            <div class="gallery-thumbs">
              ${product.images.map((img, i) => `
                <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchImage('${img}', this)">
                  <img src="${img}" alt="Image ${i+1}">
                </div>
              `).join('')}
            </div>` : ''}
          </div>

          <!-- Info -->
          <div class="product-detail-info">
            <div class="product-category">${product.category} · ${product.brand}</div>
            <h1>${product.name}</h1>

            <div class="product-rating" style="margin-bottom:20px;">
              <span class="stars" style="font-size:1rem;">${renderStars(product.rating)}</span>
              <span class="rating-count">${product.rating} (${product.numReviews} reviews)</span>
            </div>

            <div class="product-detail-price">
              ${formatPrice(product.price)}
              ${product.comparePrice ? `<span class="original-price">${formatPrice(product.comparePrice)}</span>` : ''}
              ${discount ? `<span class="price-discount" style="margin-left:8px;font-size:0.9rem;">Save ${discount}%</span>` : ''}
            </div>

            <p class="product-description">${product.description}</p>

            <div class="stock-info">
              ${product.stock > 10
                ? `<span class="in-stock">✓ In Stock (${product.stock} available)</span>`
                : product.stock > 0
                ? `<span class="low-stock">⚡ Only ${product.stock} left!</span>`
                : `<span class="out-stock">✕ Out of Stock</span>`}
            </div>

            ${product.stock > 0 ? `
            <div class="qty-selector">
              <label style="font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Quantity</label>
              <div class="qty-control">
                <button onclick="changeQty(-1)">−</button>
                <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" readonly>
                <button onclick="changeQty(1)">+</button>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              <button class="btn btn-primary btn-lg btn-full" onclick="addToCartDetail()">
                Add to Cart
              </button>
              <button class="btn btn-gold btn-lg btn-full" onclick="addToCartDetail(); navigate('checkout')">
                Buy Now
              </button>
            </div>
            ` : `<button class="btn btn-outline btn-full" disabled>Out of Stock</button>`}

            <div style="margin-top:32px; padding-top:24px; border-top:1px solid var(--gray-100);">
              <div style="display:flex; flex-wrap:wrap; gap:16px;">
                ${['🚚 Free shipping over $100', '↩️ 30-day returns', '🔒 Secure checkout'].map(f => `
                  <span style="font-size:0.78rem; color:var(--gray-500);">${f}</span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;

  // Store product reference for actions
  window._currentProduct = product;
}

window.switchImage = function(src, el) {
  $('#main-img').src = src;
  $$('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

window.changeQty = function(delta) {
  const input = $('#qty-input');
  if (!input) return;
  const max = parseInt(input.max);
  input.value = Math.max(1, Math.min(max, parseInt(input.value) + delta));
};

window.addToCartDetail = function() {
  const product = window._currentProduct;
  const qty = parseInt($('#qty-input')?.value || 1);
  if (product) cart.add(product, qty);
};

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function renderCartPage(container) {
  const items = cart.items;

  container.innerHTML = `
    <div style="padding:40px 0 80px;">
      <div class="container">
        <h1 style="margin-bottom:40px;">Shopping Cart</h1>

        ${items.length === 0 ? `
          <div style="text-align:center; padding:80px 24px;">
            <div style="font-size:4rem; margin-bottom:16px;">🛒</div>
            <h3 style="margin-bottom:8px;">Your cart is empty</h3>
            <p style="color:var(--gray-500); margin-bottom:24px;">Add some products to get started</p>
            <button class="btn btn-primary" onclick="navigate('products')">Start Shopping</button>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:1fr 360px; gap:48px; align-items:start;">
            <div>
              ${items.map(item => `
                <div style="display:flex; gap:20px; padding:20px 0; border-bottom:1px solid var(--gray-100);">
                  <div style="width:100px; height:100px; border-radius:var(--radius-md); overflow:hidden; background:var(--cream); flex-shrink:0;">
                    <img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                  <div style="flex:1;">
                    <h4 style="margin-bottom:4px;">${item.name}</h4>
                    <div style="color:var(--gold); font-weight:700; margin-bottom:12px;">${formatPrice(item.price)}</div>
                    <div style="display:flex; align-items:center; gap:16px;">
                      <div class="qty-control" style="border:1.5px solid var(--gray-300); border-radius:4px; display:flex; overflow:hidden;">
                        <button onclick="cart.updateQty('${item.productId}', ${item.quantity - 1})" style="width:36px; height:36px; background:var(--gray-100); font-weight:700; font-size:1rem; display:flex; align-items:center; justify-content:center;">−</button>
                        <span style="width:40px; display:flex; align-items:center; justify-content:center; font-weight:600;">${item.quantity}</span>
                        <button onclick="cart.updateQty('${item.productId}', ${item.quantity + 1})" style="width:36px; height:36px; background:var(--gray-100); font-weight:700; font-size:1rem; display:flex; align-items:center; justify-content:center;">+</button>
                      </div>
                      <span style="font-weight:700; font-size:1rem;">${formatPrice(item.price * item.quantity)}</span>
                      <button onclick="cart.remove('${item.productId}')" style="color:var(--red); font-size:0.8rem; margin-left:auto;">Remove</button>
                    </div>
                  </div>
                </div>
              `).join('')}

              <div style="margin-top:20px;">
                <button class="btn btn-ghost btn-sm" onclick="navigate('products')">← Continue Shopping</button>
              </div>
            </div>

            <div style="background:var(--cream); border-radius:var(--radius-lg); padding:28px; position:sticky; top:90px;">
              <h3 style="margin-bottom:20px;">Order Summary</h3>
              <div class="summary-line"><span>Subtotal</span><span>${formatPrice(cart.total)}</span></div>
              <div class="summary-line"><span>Shipping</span><span>${cart.total > 100 ? '<span style="color:var(--green)">Free</span>' : formatPrice(9.99)}</span></div>
              <div class="summary-line"><span>Tax (8%)</span><span>${formatPrice(cart.total * 0.08)}</span></div>
              <div class="summary-total">
                <span>Total</span>
                <span>${formatPrice(cart.total + (cart.total > 100 ? 0 : 9.99) + cart.total * 0.08)}</span>
              </div>

              <button class="btn btn-primary btn-full btn-lg" style="margin-top:20px;"
                onclick="${state.user ? "navigate('checkout')" : "openAuthModal('login')"}">
                ${state.user ? 'Proceed to Checkout →' : 'Sign in to Checkout'}
              </button>

              <div style="margin-top:16px;">
                <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px; color:var(--gray-500);">Promo Code</div>
                <div style="display:flex; gap:8px;">
                  <input type="text" class="form-input" placeholder="NOVA10" style="font-size:0.875rem;">
                  <button class="btn btn-outline btn-sm" onclick="showToast('Promo code NOVA10 applied! (Demo only)', 'success')">Apply</button>
                </div>
              </div>

              <div style="margin-top:20px; display:flex; justify-content:center; gap:12px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/320px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" style="height:20px; object-fit:contain; opacity:0.4;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/320px-PayPal.svg.png" alt="PayPal" style="height:20px; object-fit:contain; opacity:0.4;">
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
function renderCheckout(container) {
  if (!state.user) {
    container.innerHTML = '<div class="container" style="padding:80px 24px; text-align:center;"><h2>Please sign in to checkout</h2><button class="btn btn-primary" style="margin-top:24px" onclick="openAuthModal(\'login\')">Sign In</button></div>';
    return;
  }
  if (cart.items.length === 0) {
    navigate('cart'); return;
  }

  const tax = cart.total * 0.08;
  const shipping = cart.total > 100 ? 0 : 9.99;
  const total = cart.total + shipping + tax;

  container.innerHTML = `
    <div style="padding:40px 0 80px;">
      <div class="container">
        <h1 style="margin-bottom:40px;">Checkout</h1>

        <div class="checkout-grid">
          <div>
            <!-- Shipping Info -->
            <div class="checkout-section">
              <h3>📦 Shipping Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-input" id="ship-name" value="${state.user.name}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="tel" class="form-input" id="ship-phone" placeholder="+1 (555) 000-0000">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Street Address</label>
                <input type="text" class="form-input" id="ship-street" placeholder="123 Main St" required>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input type="text" class="form-input" id="ship-city" required>
                </div>
                <div class="form-group">
                  <label class="form-label">State</label>
                  <input type="text" class="form-input" id="ship-state" required>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">ZIP Code</label>
                  <input type="text" class="form-input" id="ship-zip" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Country</label>
                  <select class="form-select" id="ship-country">
                    <option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="checkout-section">
              <h3>💳 Payment Method</h3>
              <div class="payment-methods">
                <div class="payment-method-btn selected" id="pay-stripe" onclick="selectPayment('stripe')">
                  💳 Credit Card<br><small>via Stripe</small>
                </div>
                <div class="payment-method-btn" id="pay-paypal" onclick="selectPayment('paypal')">
                  🅿️ PayPal<br><small>Safe & Secure</small>
                </div>
                <div class="payment-method-btn" id="pay-cod" onclick="selectPayment('cod')">
                  💵 Cash on Delivery
                </div>
              </div>

              <div id="stripe-form">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input type="text" class="form-input" placeholder="4242 4242 4242 4242" maxlength="19" oninput="formatCard(this)">
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Expiry</label>
                    <input type="text" class="form-input" placeholder="MM/YY" maxlength="5">
                  </div>
                  <div class="form-group">
                    <label class="form-label">CVV</label>
                    <input type="text" class="form-input" placeholder="123" maxlength="4">
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--gray-500);">Test card: 4242 4242 4242 4242 · Any future date · Any CVV</p>
              </div>

              <div id="paypal-form" style="display:none;">
                <div style="background:var(--cream); border-radius:var(--radius-md); padding:20px; text-align:center;">
                  <p style="margin-bottom:16px; color:var(--gray-500);">You will be redirected to PayPal to complete payment.</p>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/320px-PayPal.svg.png" alt="PayPal" style="height:32px; margin:0 auto;">
                </div>
              </div>

              <div id="cod-form" style="display:none;">
                <div style="background:var(--cream); border-radius:var(--radius-md); padding:20px;">
                  <p style="color:var(--gray-500);">Pay with cash when your order is delivered. A confirmation code will be sent to your email.</p>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-full btn-lg" onclick="placeOrder()" id="place-order-btn">
              Place Order · ${formatPrice(total)}
            </button>
          </div>

          <!-- Order Summary -->
          <div>
            <div class="order-summary">
              <h3>Order Summary</h3>
              ${cart.items.map(item => `
                <div class="summary-item">
                  <div class="summary-item-img">
                    <img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:0.875rem; font-weight:500;">${truncate(item.name, 30)}</div>
                    <div style="font-size:0.8rem; color:var(--gray-500);">Qty: ${item.quantity}</div>
                    <div style="font-weight:700; color:var(--gold);">${formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              `).join('')}
              <hr style="border-color:var(--gray-300); margin:16px 0;">
              <div class="summary-line"><span>Subtotal</span><span>${formatPrice(cart.total)}</span></div>
              <div class="summary-line"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--green)">Free</span>' : formatPrice(shipping)}</span></div>
              <div class="summary-line"><span>Tax (8%)</span><span>${formatPrice(tax)}</span></div>
              <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;

  window._selectedPayment = 'stripe';
}

window.selectPayment = function(method) {
  window._selectedPayment = method;
  ['stripe', 'paypal', 'cod'].forEach(m => {
    $(`#pay-${m}`)?.classList.toggle('selected', m === method);
    $(`#${m}-form`).style.display = m === method ? 'block' : 'none';
  });
};

window.formatCard = function(input) {
  input.value = input.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
};

window.placeOrder = async function() {
  const btn = $('#place-order-btn');
  btn.textContent = 'Processing…';
  btn.disabled = true;

  // Validate
  const required = ['ship-name', 'ship-street', 'ship-city', 'ship-state', 'ship-zip'];
  const missing = required.filter(id => !$(`#${id}`)?.value.trim());
  if (missing.length) {
    showToast('Please fill in all required fields', 'error');
    btn.textContent = `Place Order · ${formatPrice(cart.total + (cart.total > 100 ? 0 : 9.99) + cart.total * 0.08)}`;
    btn.disabled = false;
    return;
  }

  // Simulate order placement (in production, this calls the API)
  await new Promise(r => setTimeout(r, 1500));

  const orderId = 'ORD-' + Date.now();
  cart.clear();
  showToast('Order placed successfully! 🎉', 'success');

  // Show success state
  const main = $('#main-content');
  main.innerHTML = `
    <div style="padding:80px 24px; text-align:center; max-width:500px; margin:0 auto;">
      <div style="width:80px; height:80px; background:var(--green); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:2rem;">✓</div>
      <h2 style="margin-bottom:8px;">Order Confirmed!</h2>
      <p style="color:var(--gray-500); margin-bottom:8px;">Order ID: <strong>${orderId}</strong></p>
      <p style="color:var(--gray-500); margin-bottom:32px;">Thank you for your purchase! You'll receive a confirmation email shortly.</p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn btn-primary" onclick="navigate('orders')">View Orders</button>
        <button class="btn btn-outline" onclick="navigate('products')">Continue Shopping</button>
      </div>
    </div>
  `;
};

// ─── ORDERS PAGE ──────────────────────────────────────────────────────────────
function renderOrders(container) {
  if (!state.user) {
    container.innerHTML = '<div class="container" style="padding:80px 24px; text-align:center;"><h2>Please sign in to view orders</h2><button class="btn btn-primary" style="margin-top:24px" onclick="openAuthModal(\'login\')">Sign In</button></div>';
    return;
  }

  const mockOrders = [
    { id: 'ORD-1701234567890', date: '2026-02-15', status: 'delivered', total: 499.97, items: ['Sony Headphones', 'Nike Shoes'] },
    { id: 'ORD-1701234500000', date: '2026-01-28', status: 'shipped', total: 219.99, items: ['Apple AirPods Pro'] },
    { id: 'ORD-1701234400000', date: '2026-01-10', status: 'processing', total: 79.99, items: ['Instant Pot'] }
  ];

  container.innerHTML = `
    <div style="padding:40px 0 80px;">
      <div class="container">
        <h1 style="margin-bottom:40px;">My Orders</h1>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${mockOrders.map(order => `
            <div style="background:white; border:1.5px solid var(--gray-100); border-radius:var(--radius-lg); padding:24px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">${order.id}</div>
                  <div style="font-size:0.8rem; color:var(--gray-500);">${new Date(order.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                  <span class="status-badge status-${order.status}">${order.status}</span>
                  <span style="font-weight:700; font-family:var(--font-display);">${formatPrice(order.total)}</span>
                </div>
              </div>
              <div style="font-size:0.875rem; color:var(--gray-500);">${order.items.join(' · ')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function renderProfile(container) {
  if (!state.user) { openAuthModal('login'); return; }

  container.innerHTML = `
    <div style="padding:40px 0 80px;">
      <div class="container" style="max-width:600px;">
        <h1 style="margin-bottom:40px;">My Profile</h1>

        <div style="background:white; border:1.5px solid var(--gray-100); border-radius:var(--radius-lg); padding:32px; margin-bottom:24px;">
          <h3 style="margin-bottom:24px;">Personal Information</h3>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="profile-name" value="${state.user.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="${state.user.email}" readonly style="background:var(--gray-100);">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-input" id="profile-phone" placeholder="+1 (555) 000-0000">
          </div>
          <button class="btn btn-primary" onclick="showToast('Profile updated!', 'success')">Save Changes</button>
        </div>

        <div style="background:white; border:1.5px solid var(--gray-100); border-radius:var(--radius-lg); padding:32px;">
          <h3 style="margin-bottom:24px;">Account</h3>
          <button class="btn btn-danger" onclick="auth.logout()">Sign Out</button>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function renderAdmin(container) {
  if (!state.user || state.user.role !== 'admin') {
    container.innerHTML = '<div class="container" style="padding:80px 24px; text-align:center;"><h2>Admin access required</h2><p style="color:var(--gray-500); margin-top:8px;">Log in with admin@shop.com / Admin123!</p><button class="btn btn-primary" style="margin-top:24px" onclick="openAuthModal(\'login\')">Sign In</button></div>';
    return;
  }

  let adminView = 'dashboard';

  const renderAdminView = () => {
    const views = {
      dashboard: renderAdminDashboard,
      products:  renderAdminProducts,
      orders:    renderAdminOrders,
      users:     renderAdminUsers
    };
    const viewEl = $('#admin-view');
    if (viewEl) (views[adminView] || renderAdminDashboard)(viewEl);
    $$('.admin-nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === adminView));
  };

  container.innerHTML = `
    <div class="admin-layout" style="margin-top:0; padding-top:0; min-height:100vh;">
      <div class="admin-sidebar">
        <div class="admin-logo">Nova<span>Shop</span></div>
        <div class="admin-subtitle">Admin Panel</div>

        <div class="admin-nav-section">
          <div class="admin-nav-label">Overview</div>
          <div class="admin-nav-item active" data-view="dashboard" onclick="setAdminView('dashboard')">📊 Dashboard</div>
        </div>
        <div class="admin-nav-section">
          <div class="admin-nav-label">Manage</div>
          <div class="admin-nav-item" data-view="products" onclick="setAdminView('products')">📦 Products</div>
          <div class="admin-nav-item" data-view="orders"   onclick="setAdminView('orders')">🛒 Orders</div>
          <div class="admin-nav-item" data-view="users"    onclick="setAdminView('users')">👥 Customers</div>
        </div>
        <div class="admin-nav-section" style="margin-top:auto; padding-top:24px;">
          <div class="admin-nav-item" onclick="navigate('home')">🏠 Back to Store</div>
          <div class="admin-nav-item" onclick="auth.logout()" style="color:#f87171;">🚪 Logout</div>
        </div>
      </div>

      <div class="admin-main">
        <div id="admin-view"></div>
      </div>
    </div>
  `;

  window.setAdminView = function(view) {
    adminView = view;
    renderAdminView();
  };

  renderAdminView();
}

function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="admin-header">
      <h1>Dashboard</h1>
      <p>Welcome back, ${state.user?.name}! Here's what's happening.</p>
    </div>

    <div class="stat-cards">
      ${[
        { icon: '💰', label: 'Total Revenue',  value: '$48,291',  sub: '+12% this month' },
        { icon: '🛒', label: 'Total Orders',   value: '1,284',    sub: '+8% this month' },
        { icon: '👥', label: 'Customers',      value: '3,421',    sub: '+23% this month' },
        { icon: '📦', label: 'Products',       value: '142',      sub: '12 low stock' }
      ].map(s => `
        <div class="stat-card">
          <div class="stat-card-icon">${s.icon}</div>
          <div class="stat-card-label">${s.label}</div>
          <div class="stat-card-value">${s.value}</div>
          <div class="stat-card-sub" style="color:var(--green);">${s.sub}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Recent Orders</h3>
          <button class="btn btn-ghost btn-sm" onclick="setAdminView('orders')">View All</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              ${[
                { id: 'ORD-001', customer: 'Sarah M.', status: 'delivered',  total: '$279.99' },
                { id: 'ORD-002', customer: 'James K.', status: 'processing', total: '$1,199.99' },
                { id: 'ORD-003', customer: 'Lisa R.',  status: 'shipped',    total: '$59.99' },
                { id: 'ORD-004', customer: 'Tom B.',   status: 'pending',    total: '$45.99' }
              ].map(o => `
                <tr>
                  <td style="font-weight:600;">${o.id}</td>
                  <td>${o.customer}</td>
                  <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                  <td style="font-weight:700;">${o.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Top Products</h3>
          <button class="btn btn-ghost btn-sm" onclick="setAdminView('products')">View All</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Sales</th><th>Revenue</th></tr></thead>
            <tbody>
              ${[
                { name: 'Sony Headphones', sales: 89, rev: '$24,919' },
                { name: 'Apple AirPods Pro', sales: 67, rev: '$14,739' },
                { name: 'Nike Air Max 270', sales: 54, rev: '$7,019' },
                { name: 'Instant Pot Duo', sales: 43, rev: '$3,439' }
              ].map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.sales}</td>
                  <td style="font-weight:700; color:var(--green);">${p.rev}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAdminProducts(container) {
  container.innerHTML = `
    <div class="admin-header">
      <h1>Products</h1>
      <p>Manage your product inventory</p>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h3>All Products (${MOCK_PRODUCTS.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="showAddProductModal()">+ Add Product</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${MOCK_PRODUCTS.map(p => `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:40px; height:40px; border-radius:4px; overflow:hidden; background:var(--cream); flex-shrink:0;">
                      <img src="${p.images[0]}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span style="font-weight:500; font-size:0.875rem;">${truncate(p.name, 35)}</span>
                  </div>
                </td>
                <td>${p.category}</td>
                <td style="font-weight:700;">${formatPrice(p.price)}</td>
                <td>
                  <span style="color:${p.stock > 10 ? 'var(--green)' : p.stock > 0 ? '#d97706' : 'var(--red)'}; font-weight:600;">
                    ${p.stock}
                  </span>
                </td>
                <td><span class="status-badge" style="background:#d1fae5; color:#065f46;">Active</span></td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-ghost btn-sm" onclick="showEditProductModal('${p._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('${p._id}', '${p.name.replace(/'/g, "\\'")}')">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div id="product-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:3000; display:none; align-items:center; justify-content:center; padding:24px;">
      <div style="background:white; border-radius:var(--radius-xl); padding:40px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
          <h3 id="product-modal-title">Add Product</h3>
          <button onclick="hideProductModal()" style="color:var(--gray-500); font-size:1.2rem;">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Product Name</label>
          <input type="text" class="form-input" id="prod-name" placeholder="e.g. Sony Headphones WH-1000XM5">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Price ($)</label>
            <input type="number" class="form-input" id="prod-price" placeholder="299.99" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Compare Price ($)</label>
            <input type="number" class="form-input" id="prod-compare" placeholder="349.99" step="0.01">
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="prod-category">
              ${['Electronics','Clothing','Home & Garden','Sports','Books','Beauty','Toys','Other'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Stock</label>
            <input type="number" class="form-input" id="prod-stock" placeholder="100">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="prod-desc" rows="3" placeholder="Product description…" style="resize:vertical;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input type="url" class="form-input" id="prod-image" placeholder="https://images.unsplash.com/…">
        </div>
        <div style="display:flex; gap:12px; margin-top:24px;">
          <button class="btn btn-primary btn-full" onclick="saveProduct()">Save Product</button>
          <button class="btn btn-outline" onclick="hideProductModal()">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Re-set display to none after rendering (since we used display:none in HTML)
  const modal = $('#product-modal');
  if (modal) modal.style.display = 'none';

  window.showAddProductModal = () => {
    modal.style.display = 'flex';
    $('#product-modal-title').textContent = 'Add Product';
    ['name','price','compare','stock','desc','image'].forEach(f => { const el = $(`#prod-${f}`); if (el) el.value = ''; });
  };

  window.showEditProductModal = (id) => {
    const p = MOCK_PRODUCTS.find(p => p._id === id);
    if (!p) return;
    modal.style.display = 'flex';
    $('#product-modal-title').textContent = 'Edit Product';
    $('#prod-name').value = p.name;
    $('#prod-price').value = p.price;
    $('#prod-compare').value = p.comparePrice || '';
    $('#prod-stock').value = p.stock;
    $('#prod-desc').value = p.description;
    $('#prod-image').value = p.images[0] || '';
    const cat = $('#prod-category');
    if (cat) cat.value = p.category;
  };

  window.hideProductModal = () => { modal.style.display = 'none'; };

  window.saveProduct = () => {
    const name = $('#prod-name').value.trim();
    if (!name) { showToast('Product name is required', 'error'); return; }
    showToast(`Product "${name}" saved successfully!`, 'success');
    hideProductModal();
  };

  window.confirmDelete = (id, name) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      showToast(`"${name}" deleted`, 'success');
    }
  };
}

function renderAdminOrders(container) {
  const mockOrders = [
    { id: 'ORD-001', customer: 'Sarah M.', email: 'sarah@example.com', status: 'delivered',  total: 279.99, date: '2026-02-15', items: 1 },
    { id: 'ORD-002', customer: 'James K.', email: 'james@example.com', status: 'processing', total: 1199.99, date: '2026-02-14', items: 1 },
    { id: 'ORD-003', customer: 'Lisa R.',  email: 'lisa@example.com',  status: 'shipped',    total: 59.99, date: '2026-02-13', items: 1 },
    { id: 'ORD-004', customer: 'Tom B.',   email: 'tom@example.com',   status: 'pending',    total: 45.99, date: '2026-02-12', items: 2 },
    { id: 'ORD-005', customer: 'Amy L.',   email: 'amy@example.com',   status: 'cancelled',  total: 219.99, date: '2026-02-11', items: 1 }
  ];

  container.innerHTML = `
    <div class="admin-header">
      <h1>Orders</h1>
      <p>Manage and track all customer orders</p>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h3>All Orders (${mockOrders.length})</h3>
        <div style="display:flex; gap:8px;">
          ${['all','pending','processing','shipped','delivered'].map(s => `
            <button class="btn btn-ghost btn-sm" style="font-size:0.75rem;">${s}</button>
          `).join('')}
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${mockOrders.map(o => `
              <tr>
                <td style="font-weight:700;">${o.id}</td>
                <td>
                  <div>${o.customer}</div>
                  <div style="font-size:0.75rem; color:var(--gray-500);">${o.email}</div>
                </td>
                <td style="font-size:0.875rem;">${new Date(o.date).toLocaleDateString()}</td>
                <td>${o.items} item${o.items > 1 ? 's' : ''}</td>
                <td style="font-weight:700;">${formatPrice(o.total)}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td>
                  <select class="form-select" style="font-size:0.8rem; padding:6px;" onchange="updateOrderStatus('${o.id}', this.value)">
                    ${['pending','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  window.updateOrderStatus = (id, status) => {
    showToast(`Order ${id} updated to "${status}"`, 'success');
  };
}

function renderAdminUsers(container) {
  const mockUsers = [
    { name: 'Sarah Miller',  email: 'sarah@example.com',  orders: 5, spent: 1234.50, joined: '2025-10-01', active: true },
    { name: 'James King',    email: 'james@example.com',  orders: 3, spent: 2199.99, joined: '2025-11-15', active: true },
    { name: 'Lisa Reynolds', email: 'lisa@example.com',   orders: 8, spent: 567.80,  joined: '2025-09-20', active: true },
    { name: 'Tom Brown',     email: 'tom@example.com',    orders: 1, spent: 45.99,   joined: '2026-01-05', active: false }
  ];

  container.innerHTML = `
    <div class="admin-header">
      <h1>Customers</h1>
      <p>Manage customer accounts</p>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h3>All Customers (${mockUsers.length})</h3>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Customer</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${mockUsers.map(u => `
              <tr>
                <td>
                  <div style="font-weight:600;">${u.name}</div>
                  <div style="font-size:0.75rem; color:var(--gray-500);">${u.email}</div>
                </td>
                <td>${u.orders}</td>
                <td style="font-weight:700; color:var(--green);">${formatPrice(u.spent)}</td>
                <td style="font-size:0.875rem;">${new Date(u.joined).toLocaleDateString()}</td>
                <td>
                  <span class="status-badge" style="background:${u.active ? '#d1fae5' : '#fee2e2'}; color:${u.active ? '#065f46' : '#7f1d1d'}">
                    ${u.active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="showToast('User status toggled', 'success')">
                    ${u.active ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>Nova<span>Shop</span></h3>
            <p>Your destination for quality products. Curated for style, built for life. Free shipping on orders over $100.</p>
            <div class="footer-social">
              ${['𝕏', 'f', 'in', '📷'].map(s => `<a class="social-btn" href="#">${s}</a>`).join('')}
            </div>
          </div>

          <div class="footer-col">
            <h4>Shop</h4>
            <a href="#" onclick="navigate('products')">All Products</a>
            <a href="#" onclick="navigate('products', {category:'Electronics'})">Electronics</a>
            <a href="#" onclick="navigate('products', {category:'Clothing'})">Clothing</a>
            <a href="#" onclick="navigate('products', {category:'Sports'})">Sports</a>
            <a href="#" onclick="navigate('products', {featured:true})">Featured</a>
          </div>

          <div class="footer-col">
            <h4>Account</h4>
            <a href="#" onclick="${state.user ? "navigate('orders')" : "openAuthModal('login')"}">My Orders</a>
            <a href="#" onclick="${state.user ? "navigate('profile')" : "openAuthModal('login')"}">Profile</a>
            <a href="#" onclick="openCart()">Shopping Cart</a>
            <a href="#" onclick="openAuthModal('register')">Register</a>
          </div>

          <div class="footer-col">
            <h4>Support</h4>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
            <a href="#">Returns</a>
            <a href="#">Shipping Info</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} NovaShop. All rights reserved.</span>
          <span>Powered by ❤️ and great code</span>
        </div>
      </div>
    </footer>
  `;
}

// ─── App Init ─────────────────────────────────────────────────────────────────
function init() {
  auth.init();
  renderNav();

  // Create main content area
  const main = document.createElement('div');
  main.id = 'main-content';
  document.body.appendChild(main);

  // Create toast container
  createToastContainer();

  // Handle hash routing
  const hash = window.location.hash.slice(1);
  if (hash) {
    const parts = hash.split('/');
    const page = parts[0] || 'home';
    const id = parts[1];
    state.currentPage = page;
    state.params = id ? { id } : {};
  }

  render();
  cart.updateBadge();

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');
    state.currentPage = parts[0] || 'home';
    state.params = parts[1] ? { id: parts[1] } : {};
    render();
  });
}

document.addEventListener('DOMContentLoaded', init);
