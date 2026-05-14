/**
 * admin_vehicle_detail.js
 * Handles data mapping, edit/delete controls and comment moderation for Admin.
 */

'use strict';

let VEHICLE_ID = null;
let serverState = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(String(params.get('id') || ''), 10);
  VEHICLE_ID = Number.isFinite(id) && id > 0 ? id : null;
  if (!VEHICLE_ID) {
    document.getElementById('detailTitle').textContent = 'Vehicle not found';
    return;
  }

  loadPage();
  setupEventListeners();
});

function safeText(v, fallback = '-') {
  const s = String(v ?? '').trim();
  return s ? s : fallback;
}

function formatDate(v) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

function mapForUI(payload) {
  const vehicle = payload?.data?.vehicle || null;
  const booking = payload?.data?.activeBooking || null;
  const comments = Array.isArray(payload?.data?.comments) ? payload.data.comments : [];
  if (!vehicle) return null;

  const img = Array.isArray(vehicle.photos) && vehicle.photos.length ? vehicle.photos[0] : '../assets/bmwx5.png';
  const typeLabel = vehicle.category?.value || vehicle.type?.value || '';
  const transLabel = vehicle.transmission?.value || '';
  const fuelLabel = vehicle.fuelType?.value || '';

  return {
    id: vehicle.id,
    name: safeText(vehicle.name, 'Vehicle'),
    year: safeText(vehicle.year, ''),
    type: safeText(typeLabel, ''),
    image: img,
    seats: `${vehicle.seatingCapacity || ''} Seats`.trim(),
    transmission: transLabel,
    fuel: fuelLabel,
    description: vehicle.description || '',
    features: [],
    renteeName: booking?.renter?.name || '-',
    renteePhone: booking?.renter?.phone || '-',
    dailyPrice: Number(vehicle.dailyPrice || 0),
    status: booking ? 'Rented' : 'Available',
    comments: comments.map((c) => ({
      id: c.id,
      author: c?.user?.name || 'User',
      date: formatDate(c.createdAt),
      text: c.content || '',
      avatar: c?.user?.profilePhoto || 'https://placehold.co/64x64/e5e7eb/9ca3af?text=U',
    })),
  };
}

async function loadPage() {
  document.getElementById('detailTitle').textContent = 'Loading...';
  try {
    const payload = await window.RW_API.admin.getVehicleDetail(VEHICLE_ID);
    serverState = payload;
    const ui = mapForUI(payload);
    if (!ui) throw new Error('Vehicle not found');
    renderPage(ui);
  } catch (err) {
    console.error('Admin vehicle detail load error:', err);
    document.getElementById('detailTitle').textContent = 'Failed to load vehicle';
  }
}

function renderPage(ui) {
  // Primary Info
  document.getElementById('detailTitle').textContent = ui.name;
  document.getElementById('detailMeta').textContent = `${ui.year} • ${ui.type}`.trim();
  document.getElementById('detailHeroImg').src = ui.image;
  
  document.getElementById('detailStats').innerHTML = `
    <div class="vehicle-detail-stat">${safeText(ui.seats, '')}</div>
    <div class="vehicle-detail-stat">${safeText(ui.transmission, '')}</div>
    <div class="vehicle-detail-stat">${safeText(ui.fuel, '')}</div>
  `;

  document.getElementById('detailDescription').textContent = ui.description;
  
  document.getElementById('detailFeatures').innerHTML = Array.isArray(ui.features) && ui.features.length
    ? ui.features.map(f => `<li><span style="color:var(--clr-primary)">✔</span> ${f}</li>`).join('')
    : '';

  // Admin Info
  document.getElementById('viewRenteeName').textContent = ui.renteeName || '-';
  document.getElementById('viewRenteePhone').textContent = ui.renteePhone || '-';
  document.getElementById('viewDailyPrice').textContent = `Rs ${ui.dailyPrice}`;
  
  let statusColor = ui.status === 'Available' ? '#065f46' : ui.status === 'Rented' ? '#92400e' : '#991b1b';
  document.getElementById('viewStatus').innerHTML = `
    <span style="font-weight:600; color:${statusColor}">${ui.status}</span>
  `;

  renderComments(ui);
}

function renderComments(ui) {
  const container = document.getElementById('detailCommentsList');
  if (!ui.comments || ui.comments.length === 0) {
    container.innerHTML = '<p style="color:var(--clr-text-muted)">No comments yet.</p>';
    return;
  }

  container.innerHTML = ui.comments.map(c => `
    <div class="vehicle-comment">
      <img src="${c.avatar}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;">
        <div class="vehicle-comment__header">
          <div>
            <div class="vehicle-comment__name">${c.author}</div>
            <div class="vehicle-comment__date">${c.date}</div>
          </div>
          <button class="delete-comment-btn" data-id="${c.id}">Delete</button>
        </div>
        <p class="vehicle-comment__text">${c.text}</p>
      </div>
    </div>
  `).join('');

  // Attach delete listeners
  document.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      deleteComment(id);
    });
  });
}

function deleteComment(id) {
  if (confirm('Are you sure you want to delete this comment?')) {
    window.RW_API.comments.delete(id)
      .then(() => loadPage())
      .catch((err) => {
        console.error('Delete comment error:', err);
        alert(err?.message || 'Failed to delete comment');
      });
  }
}

function setupEventListeners() {
  const adminViewMode = document.getElementById('adminViewMode');
  const adminEditMode = document.getElementById('adminEditMode');
  
  document.getElementById('toggleEditBtn').addEventListener('click', () => {
    adminViewMode.style.display = 'none';
    adminEditMode.style.display = 'block';
    document.getElementById('viewMainContent').style.display = 'none';
    document.getElementById('editMainContent').style.display = 'block';

    // Populate inputs
    const ui = mapForUI(serverState) || {};
    document.getElementById('editRenteeName').value = ui.renteeName || '';
    document.getElementById('editRenteePhone').value = ui.renteePhone || '';
    document.getElementById('editDailyPrice').value = ui.dailyPrice || '';
    document.getElementById('editStatus').value = ui.status || 'Available';
    
    document.getElementById('editDetailTitle').value = ui.name || '';
    document.getElementById('editDetailYear').value = ui.year || '';
    document.getElementById('editDetailType').value = ui.type || '';
    document.getElementById('editDetailSeats').value = ui.seats || '';
    document.getElementById('editDetailTrans').value = ui.transmission || '';
    document.getElementById('editDetailFuel').value = ui.fuel || '';
    document.getElementById('editDetailDescription').value = ui.description || '';
    document.getElementById('editDetailFeatures').value = '';
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    adminViewMode.style.display = 'block';
    adminEditMode.style.display = 'none';
    document.getElementById('viewMainContent').style.display = 'block';
    document.getElementById('editMainContent').style.display = 'none';
  });

  document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveEditBtn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const year = parseInt(String(document.getElementById('editDetailYear').value || ''), 10);
      const seatingRaw = String(document.getElementById('editDetailSeats').value || '').replace(/[^\d]/g, '');
      const seatingCapacity = seatingRaw ? parseInt(seatingRaw, 10) : undefined;
      const dailyPrice = parseFloat(String(document.getElementById('editDailyPrice').value || ''));
      const description = document.getElementById('editDetailDescription').value || undefined;

      const patch = {
        ...(Number.isFinite(year) ? { year } : {}),
        ...(Number.isFinite(seatingCapacity) ? { seatingCapacity } : {}),
        ...(Number.isFinite(dailyPrice) ? { dailyPrice } : {}),
        ...(description ? { description } : {}),
      };

      const typeText = String(document.getElementById('editDetailType').value || '').trim();
      const transText = String(document.getElementById('editDetailTrans').value || '').trim();
      const fuelText = String(document.getElementById('editDetailFuel').value || '').trim();

      async function optionIdByValue(type, value) {
        if (!value) return null;
        const payload = await window.RW_API.vehicles.getOptions({ type, limit: 50 });
        const options = Array.isArray(payload?.data?.options) ? payload.data.options : [];
        const hit = options.find((o) => String(o.value || '').toLowerCase() === value.toLowerCase());
        return hit ? hit.id : null;
      }

      const categoryId = await optionIdByValue('CATEGORY', typeText);
      const typeId = categoryId ? null : await optionIdByValue('VEHICLE_TYPE', typeText);
      const transmissionId = await optionIdByValue('TRANSMISSION', transText);
      const fuelTypeId = await optionIdByValue('FUEL_TYPE', fuelText);

      if (categoryId) patch.categoryId = categoryId;
      if (typeId) patch.typeId = typeId;
      if (transmissionId) patch.transmissionId = transmissionId;
      if (fuelTypeId) patch.fuelTypeId = fuelTypeId;

      await window.RW_API.request(`/vehicles/${VEHICLE_ID}`, { method: 'PATCH', body: patch });

      adminViewMode.style.display = 'block';
      adminEditMode.style.display = 'none';
      document.getElementById('viewMainContent').style.display = 'block';
      document.getElementById('editMainContent').style.display = 'none';
      await loadPage();
    } catch (err) {
      console.error('Vehicle update error:', err);
      alert(err?.message || 'Failed to save changes');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  document.getElementById('deleteVehicleBtn').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'flex';
  });
  
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    window.RW_API.request(`/vehicles/${VEHICLE_ID}`, { method: 'DELETE' })
      .then(() => { window.location.href = 'admin_vehicles.html'; })
      .catch((err) => {
        console.error('Delete vehicle error:', err);
        alert(err?.message || 'Failed to delete vehicle');
      });
  });
}
