/**
 * RentWheels – bookings.js
 * Renders and manages the My Bookings page.
 */

'use strict';

/* =============================================
   PLACEHOLDER DATA  – replace with API fetch
   ============================================= */
let BOOKINGS_DATA = [
  {
    id            : 1,
    bookingNumber : 'Booking #1',
    status        : 'confirmed',
    vehicle: {
      name     : 'BMW M4 COMPETITION',
      year     : '2022',
      type     : 'SUV',
      image    : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
    },
    rentalPeriod  : { from: '4/10/2025', to: '4/15/2025' },
    insuranceType : 'No insurance',
    totalPrice    : 475,
    bookedOn      : '4/1/2025',
    renter        : { name: 'Ram Shah', phone: '+977 9841234567' },
    rentee        : { name: 'Ritesh Poudel', phone: '+977 9801234567' }
  },
  {
    id            : 2,
    bookingNumber : 'Booking #2',
    status        : 'confirmed',
    vehicle: {
        name     : 'Tesla Model 3',
        year     : '2023',
        type     : 'Sedan',
        image    : 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
    },
    rentalPeriod  : { from: '4/20/2025', to: '4/25/2025' },
    insuranceType : 'Full Coverage',
    totalPrice    : 350,
    bookedOn      : '4/1/2026',
    renter        : { name: 'Saroj Hamal', phone: '+977 9841234567' },
    rentee        : { name: 'Sanjok K.C.', phone: '+977 9800000000' }
  },
  {
    id            : 3,
    bookingNumber : 'Booking #3',
    status        : 'confirmed',
    vehicle: {
      name     : 'Ford Mustang',
      year     : '2021',
      type     : 'Coupe',
      image    : 'https://images.unsplash.com/photo-1584345611124-28c2813587b1?w=600&q=80',
    },
    rentalPeriod  : { from: '5/10/2025', to: '5/12/2025' },
    insuranceType : 'Basic',
    totalPrice    : 200,
    bookedOn      : '4/1/2026',
    renter        : { name: 'Asmit Bhatt', phone: '+977 9841234567' },
    rentee        : { name: 'Asmita Neupane', phone: '+977 9851111111' }
  },
];

/* =============================================
   SVG ICON HELPERS
   ============================================= */
const ICONS = {
  calendar: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M2 7h12" stroke="currentColor" stroke-width="1.3"/>
    <path d="M5 2v2M11 2v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,
  pin: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C5.79 2 4 3.79 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,
  shield: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2z" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,
  user: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/>
    <path d="M3 14c0-3.5 1.5-5 5-5s5 1.5 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,
  kebab: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="3.5" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="12.5" r="1.5" fill="currentColor"/>
  </svg>`
};

/* =============================================
   STATUS BADGE
   ============================================= */
const STATUS_LABELS = { confirmed: 'confirmed', pending: 'pending', cancelled: 'cancelled' };

function statusBadgeHTML(status) {
  const label = STATUS_LABELS[status] ?? status;
  return `<span class="status-badge status-badge--${status}">${label}</span>`;
}

/* =============================================
   DETAIL ROW HELPER
   ============================================= */
function buildDetailRow(icon, label, value) {
  if (!value) return '';
  return `
    <div class="detail-row">
      <span class="detail-row__label">${ICONS[icon]} ${label}</span>
      <span class="detail-row__value">${value}</span>
    </div>`;
}

function buildPersonRow(icon, label, person) {
  if (!person || !person.name) return '';
  return `
    <div class="detail-row person-row">
      <span class="detail-row__label">${ICONS[icon]} ${label}</span>
      <span class="detail-row__value">${person.name} <span class="person-phone">(${person.phone})</span></span>
    </div>`;
}

/* =============================================
   CARD BUILDER
   ============================================= */
function buildBookingCard(booking, index) {
  const { vehicle, rentalPeriod, pickupLocation, returnLocation, insuranceType, renter, rentee } = booking;

  // Meta line: year · type  (· location only if present)
  const metaParts  = [vehicle.year, vehicle.type, vehicle.location].filter(Boolean);
  const vehicleMeta = metaParts.join(' · ');

  // Build detail rows
  let detailsHTML = buildDetailRow('calendar', 'Rental Period',
    `${rentalPeriod.from} - ${rentalPeriod.to}`);
  if (pickupLocation)  detailsHTML += buildDetailRow('pin', 'Pick-up Location', pickupLocation);
  if (returnLocation)  detailsHTML += buildDetailRow('pin', 'Return Location',  returnLocation);
  if (insuranceType)   detailsHTML += buildDetailRow('shield', 'Insurance Type', insuranceType);
  if (renter)          detailsHTML += buildPersonRow('user', 'Renter', renter);
  if (rentee)          detailsHTML += buildPersonRow('user', 'Rentee', rentee);

  const delay = (index * 0.1).toFixed(1);

  return `
    <article class="booking-card" data-id="${booking.id}" style="animation-delay:${delay}s">

      <!-- LEFT: image stacked above vehicle name -->
      <div class="booking-card__left">
        <div class="booking-card__img-wrap">
          <img
            src="${vehicle.image}"
            alt="${vehicle.name}"
            class="booking-card__img"
            loading="lazy"
            onerror="this.src='https://placehold.co/220x155/e5e7eb/9ca3af?text=No+Image'"
          />
        </div>
        <div class="booking-card__vehicle">
          <p class="booking-card__vehicle-name">${vehicle.name}</p>
          <p class="booking-card__vehicle-meta">${vehicleMeta}</p>
        </div>
      </div>

      <!-- MIDDLE: booking details -->
      <div class="booking-card__details">
        <div class="booking-card__top-row">
          <span class="booking-card__number">${booking.bookingNumber}</span>
          ${statusBadgeHTML(booking.status)}
        </div>
        <div class="booking-card__details-grid">
           ${detailsHTML}
        </div>
      </div>

      <!-- RIGHT: price & context menu -->
      <div class="booking-card__price-col">
        <div class="context-menu-wrapper">
            <button class="kebab-menu-btn" data-id="${booking.id}" aria-label="Options">
                ${ICONS.kebab}
            </button>
            <div class="kebab-dropdown hidden" id="dropdown-${booking.id}">
                <button class="kebab-dropdown-item edit-btn" data-id="${booking.id}">Edit</button>
                <button class="kebab-dropdown-item delete-btn" data-id="${booking.id}">Delete</button>
            </div>
        </div>
      
        <div class="price-info">
            <span class="price-label">Total Price</span>
            <span class="price-amount">$${booking.totalPrice}</span>
            <span class="price-booked-on">Booked on ${booking.bookedOn}</span>
        </div>
      </div>

    </article>`;
}

/* =============================================
   RENDER
   ============================================= */
function renderBookings(data) {
  const list       = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');

  if (!data || data.length === 0) {
    list.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  list.innerHTML = data.map((b, i) => buildBookingCard(b, i)).join('');
  emptyState.classList.add('hidden');
}

/* =============================================
   EVENT HANDLERS (Modal & Kebab)
   ============================================= */

// Close all kebab dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.kebab-dropdown').forEach(dd => dd.classList.add('hidden'));
}

// Global click listener for kebabs
document.addEventListener('click', (e) => {
    // If we clicked a kebab button, toggle its dropdown and close others
    const kebabBtn = e.target.closest('.kebab-menu-btn');
    if (kebabBtn) {
        e.stopPropagation();
        const id = kebabBtn.dataset.id;
        const dropdown = document.getElementById(`dropdown-${id}`);
        const isHidden = dropdown.classList.contains('hidden');
        closeAllDropdowns();
        if (isHidden) {
            dropdown.classList.remove('hidden');
        }
        return;
    }

    // Process dropdown item actions
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
        const id = parseInt(editBtn.dataset.id, 10);
        openEditModal(id);
        closeAllDropdowns();
        return;
    }

    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id, 10);
        deleteBooking(id);
        closeAllDropdowns();
        return;
    }

    // Otherwise close everything
    closeAllDropdowns();
});

// Delete Booking
function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
        BOOKINGS_DATA = BOOKINGS_DATA.filter(b => b.id !== id);
        renderBookings(BOOKINGS_DATA);
    }
}

// Edit Modal Logic
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editBookingForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');
let currentEditingId = null;

function openEditModal(id) {
    const booking = BOOKINGS_DATA.find(b => b.id === id);
    if (!booking) return;

    currentEditingId = id;
    
    // Populate simple fields
    document.getElementById('edit_status').value = booking.status;
    document.getElementById('edit_totalPrice').value = booking.totalPrice;
    document.getElementById('edit_insuranceType').value = booking.insuranceType || '';
    
    // Vehicle fields
    document.getElementById('edit_v_name').value = booking.vehicle.name;
    document.getElementById('edit_v_year').value = booking.vehicle.year;
    document.getElementById('edit_v_type').value = booking.vehicle.type;
    
    // Rental Period
    document.getElementById('edit_p_from').value = booking.rentalPeriod.from;
    document.getElementById('edit_p_to').value = booking.rentalPeriod.to;

    // Users
    if (booking.renter) {
        document.getElementById('edit_r_name').value = booking.renter.name;
        document.getElementById('edit_r_phone').value = booking.renter.phone;
    }
    if (booking.rentee) {
        document.getElementById('edit_rt_name').value = booking.rentee.name;
        document.getElementById('edit_rt_phone').value = booking.rentee.phone;
    }

    if (editModal) {
        editModal.classList.remove('hidden');
    }
}

function closeEditModal() {
    if (editModal) {
        editModal.classList.add('hidden');
    }
    currentEditingId = null;
    if (editForm) editForm.reset();
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditModal);
}

if (editForm) {
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentEditingId) return;

        const bookingIndex = BOOKINGS_DATA.findIndex(b => b.id === currentEditingId);
        if (bookingIndex === -1) return;

        const booking = BOOKINGS_DATA[bookingIndex];

        // Update values
        booking.status = document.getElementById('edit_status').value;
        booking.totalPrice = document.getElementById('edit_totalPrice').value;
        booking.insuranceType = document.getElementById('edit_insuranceType').value;
        
        booking.vehicle.name = document.getElementById('edit_v_name').value;
        booking.vehicle.year = document.getElementById('edit_v_year').value;
        booking.vehicle.type = document.getElementById('edit_v_type').value;
        booking.vehicle.location = document.getElementById('edit_v_location').value;
        
        booking.rentalPeriod.from = document.getElementById('edit_p_from').value;
        booking.rentalPeriod.to = document.getElementById('edit_p_to').value;

        booking.renter.name = document.getElementById('edit_r_name').value;
        booking.renter.phone = document.getElementById('edit_r_phone').value;
        booking.rentee.name = document.getElementById('edit_rt_name').value;
        booking.rentee.phone = document.getElementById('edit_rt_phone').value;

        // Re-render
        renderBookings(BOOKINGS_DATA);
        closeEditModal();
    });
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderBookings(BOOKINGS_DATA);
});