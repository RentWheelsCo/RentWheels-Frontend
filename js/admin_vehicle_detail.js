/**
 * admin_vehicle_detail.js
 * Handles data mapping, edit/delete controls and comment moderation for Admin.
 */

'use strict';

// Shared mock data just to demonstrate functionality
let MOCK_DATA = {
  id: 1,
  name: 'BMW X5',
  year: '2022',
  type: 'SUV',
  image: '../assets/bmwx5.png',
  seats: '5 Seats',
  transmission: 'Auto',
  fuel: 'Petrol',
  description: 'The BMW X5 is a mid-size luxury SUV that offers a compelling blend of performance, comfort, and advanced technology. The cabin is impeccably built with premium materials.',
  features: ['Bluetooth', 'Cruise Control', 'Navigation', 'Heated Seats', 'Backup Camera'],
  
  // Admin Info
  renteeName: 'Alice Smith',
  renteePhone: '+1 987-654-3210',
  dailyPrice: 120,
  status: 'Rented',

  // Comments
  comments: [
    {
      id: 101,
      author: 'Jane Roe',
      date: 'April 2, 2025',
      text: 'Great car, had a wonderful trip!',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 102,
      author: 'Peter Parker',
      date: 'March 25, 2025',
      text: 'A bit pricey but the interior comfort makes up for it.',
      avatar: 'https://randomuser.me/api/portraits/men/15.jpg'
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // In a real app, parse URL: const params = new URLSearchParams(window.location.search); var id = params.get('id');

  renderPage();
  setupEventListeners();
});

function renderPage() {
  // Primary Info
  document.getElementById('detailTitle').textContent = MOCK_DATA.name;
  document.getElementById('detailMeta').textContent = `${MOCK_DATA.year} • ${MOCK_DATA.type}`;
  document.getElementById('detailHeroImg').src = MOCK_DATA.image;
  
  document.getElementById('detailStats').innerHTML = `
    <div class="vehicle-detail-stat">${MOCK_DATA.seats}</div>
    <div class="vehicle-detail-stat">${MOCK_DATA.transmission}</div>
    <div class="vehicle-detail-stat">${MOCK_DATA.fuel}</div>
  `;

  document.getElementById('detailDescription').textContent = MOCK_DATA.description;
  
  document.getElementById('detailFeatures').innerHTML = MOCK_DATA.features
    .map(f => `<li><span style="color:var(--clr-primary)">✔</span> ${f}</li>`)
    .join('');

  // Admin Info
  document.getElementById('viewRenteeName').textContent = MOCK_DATA.renteeName || '-';
  document.getElementById('viewRenteePhone').textContent = MOCK_DATA.renteePhone || '-';
  document.getElementById('viewDailyPrice').textContent = `Rs ${MOCK_DATA.dailyPrice}`;
  
  let statusColor = MOCK_DATA.status === 'Available' ? '#065f46' : MOCK_DATA.status === 'Rented' ? '#92400e' : '#991b1b';
  document.getElementById('viewStatus').innerHTML = `
    <span style="font-weight:600; color:${statusColor}">${MOCK_DATA.status}</span>
  `;

  renderComments();
}

function renderComments() {
  const container = document.getElementById('detailCommentsList');
  if (!MOCK_DATA.comments || MOCK_DATA.comments.length === 0) {
    container.innerHTML = '<p style="color:var(--clr-text-muted)">No comments yet.</p>';
    return;
  }

  container.innerHTML = MOCK_DATA.comments.map(c => `
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
    MOCK_DATA.comments = MOCK_DATA.comments.filter(c => c.id !== id);
    renderComments();
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
    document.getElementById('editRenteeName').value = MOCK_DATA.renteeName;
    document.getElementById('editRenteePhone').value = MOCK_DATA.renteePhone;
    document.getElementById('editDailyPrice').value = MOCK_DATA.dailyPrice;
    document.getElementById('editStatus').value = MOCK_DATA.status;
    
    document.getElementById('editDetailTitle').value = MOCK_DATA.name;
    document.getElementById('editDetailYear').value = MOCK_DATA.year;
    document.getElementById('editDetailType').value = MOCK_DATA.type;
    document.getElementById('editDetailSeats').value = MOCK_DATA.seats;
    document.getElementById('editDetailTrans').value = MOCK_DATA.transmission;
    document.getElementById('editDetailFuel').value = MOCK_DATA.fuel;
    document.getElementById('editDetailDescription').value = MOCK_DATA.description;
    document.getElementById('editDetailFeatures').value = MOCK_DATA.features.join(', ');
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    adminViewMode.style.display = 'block';
    adminEditMode.style.display = 'none';
    document.getElementById('viewMainContent').style.display = 'block';
    document.getElementById('editMainContent').style.display = 'none';
  });

  document.getElementById('saveEditBtn').addEventListener('click', () => {
    MOCK_DATA.renteeName = document.getElementById('editRenteeName').value;
    MOCK_DATA.renteePhone = document.getElementById('editRenteePhone').value;
    MOCK_DATA.dailyPrice = document.getElementById('editDailyPrice').value;
    MOCK_DATA.status = document.getElementById('editStatus').value;

    MOCK_DATA.name = document.getElementById('editDetailTitle').value;
    MOCK_DATA.year = document.getElementById('editDetailYear').value;
    MOCK_DATA.type = document.getElementById('editDetailType').value;
    MOCK_DATA.seats = document.getElementById('editDetailSeats').value;
    MOCK_DATA.transmission = document.getElementById('editDetailTrans').value;
    MOCK_DATA.fuel = document.getElementById('editDetailFuel').value;
    MOCK_DATA.description = document.getElementById('editDetailDescription').value;
    
    const rawFeatures = document.getElementById('editDetailFeatures').value;
    MOCK_DATA.features = rawFeatures.split(',').map(f => f.trim()).filter(Boolean);

    adminViewMode.style.display = 'block';
    adminEditMode.style.display = 'none';
    document.getElementById('viewMainContent').style.display = 'block';
    document.getElementById('editMainContent').style.display = 'none';
    renderPage();
  });

  document.getElementById('deleteVehicleBtn').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'flex';
  });
  
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    // Navigate back to admin_vehicles.html
    window.location.href = 'admin_vehicles.html';
  });
}
