/* ============================================================
   admin_booking.js  –  RentWheels Admin Bookings
   Features: filter tabs, live search, date range, pagination,
             cancel booking, view details, kebab menu
   ============================================================ */
(function () {
  'use strict';

  /* ── State ── */
  const PAGE_SIZE = 10;
  let allBookings  = [];
  let filtered     = [];
  let currentPage  = 1;
  let activeStatus = 'all';
  let searchQuery  = '';
  let dateFrom     = '';
  let dateTo       = '';
  let cancelTarget = null;  // booking id pending cancel

  /* ── DOM refs ── */
  const listEl        = () => document.getElementById('bookingsList');
  const emptyEl       = () => document.getElementById('emptyState');
  const loadingEl     = () => document.getElementById('loadingState');
  const paginationBar = () => document.getElementById('paginationBar');
  const pageInfoEl    = () => document.getElementById('pageInfo');
  const pageBtnsEl    = () => document.getElementById('pageBtns');

  /* ── Helpers ── */
  function fmt(dateVal) {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function fmtNPR(val) {
    const n = Number(val || 0);
    return `NPR ${n.toLocaleString()}`;
  }

  function statusClass(s) {
    switch (String(s || '').toLowerCase()) {
      case 'confirmed': return 'ab-status--confirmed';
      case 'pending':   return 'ab-status--pending';
      case 'cancelled': return 'ab-status--cancelled';
      case 'completed': return 'ab-status--completed';
      default:          return 'ab-status--pending';
    }
  }

  function statusIcon(s) {
    switch (String(s || '').toLowerCase()) {
      case 'confirmed':
        return `<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case 'cancelled':
        return `<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
      case 'completed':
        return `<svg viewBox="0 0 16 16" fill="none"><path d="M2 8l4.5 4.5L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      default:
        return `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.8"/></svg>`;
    }
  }

  function imgSrc(b) {
    const img = b?.vehicle?.images?.[0] || b?.vehicle?.image || '';
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    const base = String(window.RW_CONFIG?.API_BASE || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return base + (img.startsWith('/') ? img : '/' + img);
  }

  /* ── Filter + search ── */
  function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    filtered = allBookings.filter(b => {
      const s = String(b.status || '').toLowerCase();
      if (activeStatus !== 'all' && s !== activeStatus) return false;

      if (dateFrom) {
        const from = new Date(b.pickupDate);
        if (isNaN(from) || from < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const to = new Date(b.returnDate);
        if (isNaN(to) || to > new Date(dateTo + 'T23:59:59')) return false;
      }

      if (q) {
        const hay = [
          b?.vehicle?.name,
          b?.vehicle?.owner?.name,
          b?.renter?.name,
          String(b.id || ''),
          b.insuranceType,
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    currentPage = 1;
    renderPage();
  }

  /* ── Tab counts ── */
  function updateCounts() {
    const counts = { all: allBookings.length, confirmed: 0, pending: 0, cancelled: 0, completed: 0 };
    allBookings.forEach(b => {
      const s = String(b.status || '').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    Object.entries(counts).forEach(([key, n]) => {
      const el = document.getElementById('count-' + key);
      if (el) el.textContent = n ? `(${n})` : '';
    });
  }

  /* ── Render card HTML ── */
  function cardHTML(b, delay) {
    const vehicleName = b?.vehicle?.name || 'Vehicle';
    const ownerName   = b?.vehicle?.owner?.name || '—';
    const renterName  = b?.renter?.name || '—';
    const insurance   = b.insuranceType || '—';
    const pickup      = fmt(b.pickupDate);
    const ret         = fmt(b.returnDate);
    const src         = imgSrc(b);
    const isCancelled = String(b.status || '').toLowerCase() === 'cancelled';

    const imgTag = src
      ? `<img class="ab-card__img" src="${src}" alt="${vehicleName}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=ab-card__img-placeholder><svg viewBox=&quot;0 0 48 48&quot; fill=none><rect x=4 y=12 width=40 height=28 rx=4 stroke=#D1D5DB stroke-width=2/><path d=&quot;M4 20h40&quot; stroke=#D1D5DB stroke-width=2/></svg></div>'" />`
      : `<div class="ab-card__img-placeholder"><svg viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="28" rx="4" stroke="#D1D5DB" stroke-width="2"/><path d="M4 20h40" stroke="#D1D5DB" stroke-width="2"/></svg></div>`;

    return `
    <article class="ab-card" data-id="${b.id}" role="listitem" style="animation-delay:${delay}ms">
      <div class="ab-card__img-wrap">${imgTag}</div>

      <div class="ab-card__body">
        <div>
          <div class="ab-card__name">${vehicleName}</div>
          <div class="ab-card__number">#${b.id}</div>
        </div>
        <div class="ab-card__date">
          <svg viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
            <path d="M2 8h16" stroke="currentColor" stroke-width="1.6"/>
            <path d="M6 2v3M14 2v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          ${pickup} → ${ret}
        </div>
        <div class="ab-card__fields">
          <div class="ab-field">
            <span class="ab-field__icon"><svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>
            <span class="ab-field__label">Owner</span>
            <span class="ab-field__value">${ownerName}</span>
          </div>
          <div class="ab-field">
            <span class="ab-field__icon"><svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>
            <span class="ab-field__label">Renter</span>
            <span class="ab-field__value">${renterName}</span>
          </div>
          <div class="ab-field">
            <span class="ab-field__icon"><svg viewBox="0 0 20 20" fill="none"><path d="M10 2l1.8 5.4H18l-4.9 3.6 1.8 5.5L10 13.1l-4.9 3.4 1.8-5.5L2 7.4h6.2L10 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></span>
            <span class="ab-field__label">Insurance</span>
            <span class="ab-field__value">${insurance}</span>
          </div>
        </div>
      </div>

      <div class="ab-card__right">
        <div class="ab-kebab-wrap">
          <button class="ab-kebab-btn" data-id="${b.id}" aria-label="More options" aria-haspopup="true">
            <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
          </button>
          <div class="ab-kebab-dropdown hidden" id="kebab-${b.id}">
            <button class="ab-kebab-item" data-action="view" data-id="${b.id}">View Details</button>
            ${!isCancelled ? `<button class="ab-kebab-item ab-kebab-item--danger" data-action="cancel" data-id="${b.id}">Cancel Booking</button>` : ''}
          </div>
        </div>

        <span class="ab-status ${statusClass(b.status)}">
          ${statusIcon(b.status)}${String(b.status || 'PENDING').toUpperCase()}
        </span>
        <div class="ab-price-label">Total Price</div>
        <div class="ab-price-amount">${fmtNPR(b.totalAmount)}</div>
        <div class="ab-card__actions">
          <button class="ab-btn-view"   data-action="view"   data-id="${b.id}">View Details</button>
          <button class="ab-btn-cancel" data-action="cancel" data-id="${b.id}" ${isCancelled ? 'disabled' : ''}>Cancel Booking</button>
        </div>
      </div>
    </article>`;
  }

  /* ── Render current page ── */
  function renderPage() {
    const list  = listEl();
    const empty = emptyEl();
    const pgBar = paginationBar();

    if (!list) return;

    if (!filtered.length) {
      list.innerHTML = '';
      if (empty)  empty.classList.remove('hidden');
      if (pgBar)  pgBar.style.display = 'none';
      return;
    }

    if (empty) empty.classList.add('hidden');
    if (pgBar) pgBar.style.display = '';

    const total      = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    currentPage      = Math.min(currentPage, totalPages);
    const start      = (currentPage - 1) * PAGE_SIZE;
    const pageItems  = filtered.slice(start, start + PAGE_SIZE);

    list.innerHTML = pageItems.map((b, i) => cardHTML(b, i * 40)).join('');

    // page info
    const infoEl = pageInfoEl();
    if (infoEl) infoEl.textContent = `Showing ${start + 1} to ${start + pageItems.length} of ${total} bookings`;

    // page buttons
    buildPaginationBtns(currentPage, totalPages);
  }

  function buildPaginationBtns(page, total) {
    const wrap = pageBtnsEl();
    if (!wrap) return;

    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('…');
      pages.push(total);
    }

    wrap.innerHTML = `
      <button class="ab-page-btn" id="prevBtn" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      ${pages.map(p =>
        p === '…'
          ? `<span class="ab-page-btn" style="pointer-events:none;border:none;background:none">…</span>`
          : `<button class="ab-page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
      ).join('')}
      <button class="ab-page-btn" id="nextBtn" ${page === total ? 'disabled' : ''} aria-label="Next page">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`;

    wrap.querySelector('#prevBtn')?.addEventListener('click', () => { currentPage--; renderPage(); });
    wrap.querySelector('#nextBtn')?.addEventListener('click', () => { currentPage++; renderPage(); });
    wrap.querySelectorAll('[data-page]').forEach(btn =>
      btn.addEventListener('click', () => { currentPage = Number(btn.dataset.page); renderPage(); })
    );
  }

  /* ── Load bookings ── */
  async function loadBookings() {
    const list  = listEl();
    const empty = emptyEl();
    const load  = loadingEl();
    const pgBar = paginationBar();

    if (list)  list.innerHTML  = '';
    if (empty) empty.classList.add('hidden');
    if (load)  load.classList.remove('hidden');
    if (pgBar) pgBar.style.display = 'none';

    try {
      // Fetch all pages so client-side filter/pagination works correctly
      let page = 1;
      let collected = [];
      while (true) {
        const payload = await window.RW_API.request('/admin/bookings', { params: { page, limit: 50 } });
        const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];
        collected = collected.concat(rows);
        const meta = payload?.data?.pagination || payload?.data?.meta || {};
        const totalPages = meta.totalPages || meta.pages || 1;
        if (page >= totalPages || rows.length < 50) break;
        page++;
      }
      allBookings = collected;
    } catch (err) {
      if (load) load.classList.add('hidden');
      if (list) list.innerHTML = `<div style="color:#b91c1c;padding:20px;font-size:.875rem">${err?.message || 'Failed to load bookings.'}</div>`;
      return;
    }

    if (load) load.classList.add('hidden');
    updateCounts();
    applyFilters();
  }

  /* ── Cancel booking ── */
  async function doCancel(id) {
    try {
      await window.RW_API.request(`/admin/bookings/${id}/cancel`, { method: 'POST' });
      // Update local state
      const b = allBookings.find(x => String(x.id) === String(id));
      if (b) b.status = 'cancelled';
      updateCounts();
      applyFilters();
      showToast('Booking cancelled successfully.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to cancel booking.', 'error');
    }
  }

  /* ── Toast ── */
  function showToast(msg, type) {
    let t = document.getElementById('ab-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ab-toast';
      Object.assign(t.style, {
        position: 'fixed', bottom: '24px', right: '24px', zIndex: '2000',
        padding: '12px 20px', borderRadius: '8px', fontSize: '.875rem',
        fontWeight: '600', boxShadow: '0 4px 16px rgba(0,0,0,.15)',
        fontFamily: 'Outfit, sans-serif', transition: 'opacity .3s ease',
        maxWidth: '320px',
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'success' ? '#166534' : '#991B1B';
    t.style.color = '#fff';
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
  }

  /* ── Detail modal ── */
  function openDetail(id) {
    const b = allBookings.find(x => String(x.id) === String(id));
    if (!b) return;
    const modal = document.getElementById('detailModal');
    const body  = document.getElementById('detailModalBody');
    if (!modal || !body) return;

    const rows = [
      ['Booking ID',    `#${b.id}`],
      ['Vehicle',       b?.vehicle?.name || '—'],
      ['Owner',         b?.vehicle?.owner?.name || '—'],
      ['Renter',        b?.renter?.name || '—'],
      ['Renter Phone',  b?.renter?.phone || b?.renter?.phoneNumber || '—'],
      ['Pickup Date',   fmt(b.pickupDate)],
      ['Return Date',   fmt(b.returnDate)],
      ['Insurance',     b.insuranceType || '—'],
      ['Total Amount',  fmtNPR(b.totalAmount)],
      ['Status',        String(b.status || '—').toUpperCase()],
      ['Booked On',     fmt(b.createdAt)],
    ];

    body.innerHTML = rows.map(([k, v]) =>
      `<div class="ab-detail-row"><span class="ab-detail-key">${k}</span><span class="ab-detail-val">${v}</span></div>`
    ).join('');

    document.getElementById('detailModalTitle').textContent = `Booking #${b.id} – ${b?.vehicle?.name || 'Details'}`;
    modal.classList.remove('hidden');
  }

  /* ── Event delegation ── */
  function wireEvents() {
    // Filter tabs
    document.getElementById('filterTabs')?.addEventListener('click', e => {
      const btn = e.target.closest('.ab-tab');
      if (!btn) return;
      document.querySelectorAll('.ab-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeStatus = btn.dataset.status;
      applyFilters();
    });

    // Search
    let searchTimer;
    document.getElementById('bookingSearch')?.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { searchQuery = e.target.value; applyFilters(); }, 280);
    });

    // Calendar toggle
    document.getElementById('calToggleBtn')?.addEventListener('click', () => {
      document.getElementById('dateFilter')?.classList.toggle('hidden');
    });

    // Date apply
    document.getElementById('dateApply')?.addEventListener('click', () => {
      dateFrom = document.getElementById('dateFrom')?.value || '';
      dateTo   = document.getElementById('dateTo')?.value   || '';
      applyFilters();
    });

    // Date clear
    document.getElementById('dateClear')?.addEventListener('click', () => {
      dateFrom = dateTo = '';
      if (document.getElementById('dateFrom')) document.getElementById('dateFrom').value = '';
      if (document.getElementById('dateTo'))   document.getElementById('dateTo').value   = '';
      applyFilters();
    });

    // List clicks (view / cancel / kebab)
    document.getElementById('bookingsList')?.addEventListener('click', e => {
      // Kebab open/close
      const kebabBtn = e.target.closest('.ab-kebab-btn');
      if (kebabBtn) {
        const id = kebabBtn.dataset.id;
        const dropdown = document.getElementById('kebab-' + id);
        const isOpen = !dropdown?.classList.contains('hidden');
        // close all
        document.querySelectorAll('.ab-kebab-dropdown').forEach(d => d.classList.add('hidden'));
        if (!isOpen && dropdown) dropdown.classList.remove('hidden');
        return;
      }

      // Action buttons & kebab items
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const { action, id } = actionBtn.dataset;

      // Close any open kebab dropdown
      document.querySelectorAll('.ab-kebab-dropdown').forEach(d => d.classList.add('hidden'));

      if (action === 'view')   openDetail(id);
      if (action === 'cancel') {
        cancelTarget = id;
        document.getElementById('cancelModal')?.classList.remove('hidden');
      }
    });

    // Close kebab when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.ab-kebab-wrap')) {
        document.querySelectorAll('.ab-kebab-dropdown').forEach(d => d.classList.add('hidden'));
      }
    }, true);

    // Cancel modal
    document.getElementById('cancelModalClose')?.addEventListener('click', () => {
      document.getElementById('cancelModal').classList.add('hidden');
      cancelTarget = null;
    });
    document.getElementById('cancelModalConfirm')?.addEventListener('click', async () => {
      if (!cancelTarget) return;
      document.getElementById('cancelModal').classList.add('hidden');
      await doCancel(cancelTarget);
      cancelTarget = null;
    });

    // Detail modal close
    document.getElementById('detailModalClose')?.addEventListener('click', () => {
      document.getElementById('detailModal').classList.add('hidden');
    });

    // Close modals on overlay click
    ['cancelModal', 'detailModal'].forEach(modalId => {
      document.getElementById(modalId)?.addEventListener('click', e => {
        if (e.target.id === modalId) document.getElementById(modalId).classList.add('hidden');
      });
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.ab-modal-overlay').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.ab-kebab-dropdown').forEach(d => d.classList.add('hidden'));
      }
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    wireEvents();
    loadBookings().catch(err => {
      const load = loadingEl();
      if (load) load.classList.add('hidden');
      const list = listEl();
      if (list) list.innerHTML = `<div style="color:#b91c1c;padding:20px;font-size:.875rem">${err?.message || 'Failed to load bookings.'}</div>`;
    });
  });
})();
