/**
 * RentWheels – user-profile.js
 * Admin: detailed user profile view.
 *
 * API INTEGRATION:
 * Replace USER_DATA with a real fetch using the user ID from the URL:
 *   const id  = new URLSearchParams(location.search).get('id');
 *   const res = await fetch(`/api/admin/users/${id}`);
 *   const user = await res.json();
 *   renderProfile(user);
 */

'use strict';

/* =============================================
   HELPERS
   ============================================= */
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function emptySection(title, text, iconPath) {
  return `
    <div class="empty-section">
      <svg viewBox="0 0 48 48" fill="none">${iconPath}</svg>
      <p class="empty-section__title">${title}</p>
      <p class="empty-section__text">${text}</p>
    </div>`;
}

/* =============================================
   RENDER: PROFILE CARD
   ============================================= */
function renderProfileCard(user) {
  // Avatar
  const avatarWrap = document.getElementById('avatarWrap');
  if (user.avatar) {
    avatarWrap.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}" class="avatar-img"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="avatar-initials" style="display:none">${getInitials(user.name)}</div>`;
  } else {
    avatarWrap.innerHTML = `<div class="avatar-initials">${getInitials(user.name)}</div>`;
  }

  document.getElementById('profileName').textContent    = user.name;
  document.getElementById('profileEmail').textContent   = user.email;
  document.getElementById('profilePhone').textContent   = user.phone;
  document.getElementById('profileAddress').textContent = user.address;
  document.getElementById('profileJoined').textContent  = user.joined;
  document.getElementById('profileDob').textContent     = user.dob;
  document.getElementById('profileLicense').textContent = user.license?.number ?? '—';

  // Status badge
  const badge = document.getElementById('profileStatus');
  const labels = { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' };
  badge.textContent = labels[user.status] ?? user.status;
  badge.className   = `status-badge status-badge--${user.status}`;
}

/* =============================================
   RENDER: BOOKING SUMMARY
   ============================================= */
function renderBookingSummary(bookings) {
  const total     = bookings.length;
  const active    = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statActive').textContent    = active;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statCancelled').textContent = cancelled;

  const container = document.getElementById('recentBookings');

  if (!bookings.length) {
    container.innerHTML = emptySection(
      'No bookings yet',
      'This user has not made any bookings.',
      `<rect x="4" y="8" width="40" height="34" rx="3" stroke="#CBD5E1" stroke-width="2.5"/>
       <path d="M4 18h40" stroke="#CBD5E1" stroke-width="2.5"/>
       <path d="M14 8V4M34 8V4" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>`
    );
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="booking-row">
      <img src="${b.image}" alt="${b.vehicle}" class="booking-row__thumb"
        onerror="this.style.background='#F3F4F6'" />
      <div class="booking-row__info">
        <p class="booking-row__name">${b.vehicle}</p>
        <p class="booking-row__dates">${b.from} → ${b.to}</p>
      </div>
      <span class="booking-row__status booking-row__status--${b.status}">${b.status}</span>
      <span class="booking-row__price">Rs ${b.price}</span>
    </div>
  `).join('');
}

/* =============================================
   RENDER: REGISTERED VEHICLES
   ============================================= */
function renderVehicles(vehicles) {
  document.getElementById('vehiclesCount').textContent = vehicles.length;
  const container = document.getElementById('vehiclesList');

  if (!vehicles.length) {
    container.innerHTML = emptySection(
      'No vehicles registered',
      'This user has not registered any vehicles.',
      `<rect x="4" y="14" width="40" height="24" rx="3" stroke="#CBD5E1" stroke-width="2.5"/>
       <circle cx="13" cy="38" r="4" stroke="#CBD5E1" stroke-width="2.5"/>
       <circle cx="35" cy="38" r="4" stroke="#CBD5E1" stroke-width="2.5"/>
       <path d="M4 22h40" stroke="#CBD5E1" stroke-width="2.5"/>`
    );
    return;
  }

  const badgeLabels = { available: 'Available', rented: 'Rented', inactive: 'Inactive' };

  container.innerHTML = vehicles.map(v => `
    <div class="vehicle-row">
      <img src="${v.image}" alt="${v.name}" class="vehicle-row__img"
        onerror="this.style.background='#F3F4F6'" />
      <div>
        <p class="vehicle-row__name">${v.name}</p>
        <p class="vehicle-row__meta">${v.meta}</p>
      </div>
      <span class="vehicle-row__badge vehicle-row__badge--${v.status}">
        ${badgeLabels[v.status] ?? v.status}
      </span>
    </div>
  `).join('');
}

/* =============================================
   RENDER: LICENSE
   ============================================= */
function renderLicense(license) {
  // Status badge in header
  const badge = document.getElementById('licenseStatusBadge');
  if (!license) {
    badge.textContent = 'Not Uploaded';
    badge.className   = 'license-status-badge license-status-badge--unverified';
    document.getElementById('licenseImgWrap').innerHTML = emptySection(
      'No license uploaded',
      'The user has not uploaded a driver\'s license.',
      `<rect x="4" y="8" width="40" height="32" rx="3" stroke="#CBD5E1" stroke-width="2.5"/>
       <path d="M12 20h8M12 26h16" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
       <circle cx="34" cy="22" r="6" stroke="#CBD5E1" stroke-width="2.5"/>`
    );
    document.getElementById('licenseDetails').innerHTML = '';
    return;
  }

  badge.textContent = license.verified ? 'Verified' : 'Unverified';
  badge.className   = `license-status-badge license-status-badge--${license.verified ? 'verified' : 'unverified'}`;

  document.getElementById('licenseImgWrap').innerHTML = `
    <img src="${license.image}" alt="Driver License" class="license-img"
      onerror="this.outerHTML='<div class=\\'license-img-placeholder\\'><svg viewBox=\\'0 0 48 48\\'fill=\\'none\\'><rect x=\\'4\\'y=\\'8\\'width=\\'40\\'height=\\'32\\'rx=\\'3\\'stroke=\\'#CBD5E1\\'stroke-width=\\'2.5\\'/></svg><p>Image unavailable</p></div>'" />`;

  document.getElementById('licenseDetails').innerHTML = `
    <div class="license-detail-row">
      <span class="license-detail-row__label">License Number</span>
      <span class="license-detail-row__value">${license.number}</span>
    </div>
    <div class="license-detail-row">
      <span class="license-detail-row__label">Issuing State</span>
      <span class="license-detail-row__value">${license.state}</span>
    </div>
    <div class="license-detail-row">
      <span class="license-detail-row__label">Expiry Date</span>
      <span class="license-detail-row__value">${license.expiry}</span>
    </div>`;
}

/* =============================================
   RENDER: ACTIVITY
   ============================================= */
function renderActivity(activity) {
  const container = document.getElementById('activityList');

  if (!activity || !activity.length) {
    container.innerHTML = emptySection(
      'No activity yet',
      'Actions taken by this user will appear here.',
      `<circle cx="24" cy="24" r="18" stroke="#CBD5E1" stroke-width="2.5"/>
       <path d="M24 14v10l6 4" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>`
    );
    return;
  }

  container.innerHTML = activity.map(a => `
    <div class="activity-item">
      <span class="activity-dot activity-dot--${a.dot}"></span>
      <span class="activity-item__text">${a.text}</span>
      <span class="activity-item__time">${a.time}</span>
    </div>
  `).join('');
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const parsedId = parseInt(String(id || ''), 10);
  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    showToast('Missing user id', 'error');
    return;
  }

  window.RW_API.admin
    .getUserDetail(parsedId)
    .then((payload) => {
      const u = payload?.data || {};
      const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—';

      const licensePhoto = Array.isArray(u.licensePhoto) ? u.licensePhoto[0] : u.licensePhoto;
      const mapped = {
        id: u.id,
        name: u.name || '—',
        email: u.email || '—',
        phone: u.phone || '—',
        address: '—',
        dob: '—',
        joined,
        status: u.isVerified ? 'active' : 'inactive',
        avatar: u.profilePhoto || '',
        license: licensePhoto
          ? {
              number: '—',
              expiry: '—',
              state: '—',
              verified: Boolean(u.isVerified),
              image: licensePhoto,
            }
          : null,
        bookings: Array.isArray(u.bookings)
          ? u.bookings.slice(0, 6).map((b) => ({
              id: b.id,
              vehicle: `Vehicle #${b.vehicleId}`,
              image: '',
              from: b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : '',
              to: b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '',
              status: String(b.status || '').toLowerCase(),
              price: 0,
            }))
          : [],
        vehicles: Array.isArray(u.vehicles)
          ? u.vehicles.slice(0, 6).map((v) => ({
              id: v.id,
              name: `Vehicle #${v.id}`,
              meta: `${v.year || ''}`.trim(),
              status: 'available',
              image: Array.isArray(v.photos) && v.photos.length ? v.photos[0] : '',
            }))
          : [],
        activity: [
          { text: 'User loaded from server', time: 'now', dot: 'blue' },
        ],
      };

      renderAll(mapped);
    })
    .catch((err) => {
      console.error('User profile load error:', err);
      showToast(err?.message || 'Failed to load user profile', 'error');
    });
});

function renderAll(user) {
  renderProfileCard(user);
  renderBookingSummary(user.bookings  ?? []);
  renderVehicles(user.vehicles        ?? []);
  renderLicense(user.license          ?? null);
  renderActivity(user.activity        ?? []);
}

/* =============================================
   TOAST
   ============================================= */
let toastTimer;
function showToast(message, type = 'success') {
  const el = document.getElementById('toast');
  clearTimeout(toastTimer);
  el.textContent = message;
  el.className   = `toast toast--${type}`;
  el.style.opacity = '1';
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.classList.add('hidden'), 280);
  }, 3000);
}

window.RentWheels = { showToast };
