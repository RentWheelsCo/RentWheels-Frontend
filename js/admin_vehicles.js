const adminVehicleData = [
  {
    id: 1,
    name: "Toyota Corolla",
    image: "../assets/bmwm3.png",
    renterName: "John Doe",
    renterPhone: "+1 234-567-8901",
    renteeName: "Alice Smith",
    renteePhone: "+1 987-654-3210",
    dailyPrice: 45,
    status: "Rented"
  },
  {
    id: 2,
    name: "Honda Civic",
    image: "../assets/TeslaModelX.png",
    renterName: "Jane Roe",
    renterPhone: "+1 333-444-5555",
    renteeName: "Bob Johnson",
    renteePhone: "+1 222-333-4444",
    dailyPrice: 50,
    status: "Rented"
  },
  {
    id: 3,
    name: "BMW 3 Series",
    image: "../assets/bmwm3.png",
    renterName: "-",
    renterPhone: "-",
    renteeName: "-",
    renteePhone: "-",
    dailyPrice: 120,
    status: "Available"
  },
  {
    id: 4,
    name: "Tesla Model 3",
    image: "../assets/TeslaModelX.png",
    renterName: "Sarah Connor",
    renterPhone: "+1 555-555-5555",
    renteeName: "James Cameron",
    renteePhone: "+1 444-444-4444",
    dailyPrice: 150,
    status: "Maintenance"
  }
];

let pendingDeleteId = null;
let editingId = null;

function renderVehicles(searchTerm = "") {
  const tbody = document.getElementById("vehicleTableBody");
  const filteredData = adminVehicleData.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  tbody.innerHTML = filteredData.map((v, i) => `
    <tr style="animation-delay: ${i * 50}ms; cursor: pointer;" onclick="window.location.href='admin_vehicle_detail.html?id=${v.id}'">
      <td><strong>${i + 1}</strong></td>
      <td>
        <div class="vehicle-cell">
          <img class="vehicle-img" src="${v.image}" alt="${v.name}">
          <div class="vehicle-name">${v.name}</div>
        </div>
      </td>
      <td>
        <div class="person-info">
          <span class="person-name">${v.renterName}</span>
          <span class="person-phone">${v.renterPhone}</span>
        </div>
      </td>
      <td>
        <div class="person-info">
          <span class="person-name">${v.renteeName}</span>
          <span class="person-phone">${v.renteePhone}</span>
        </div>
      </td>
      <td><strong>Rs ${v.dailyPrice}</strong></td>
      <td>
        <span style="font-size:0.75rem; font-weight:600; padding:4px 10px; border-radius:999px; background:${v.status==='Available'?'#d1fae5':v.status==='Rented'?'#fef3c7':'#fee2e2'}; color:${v.status==='Available'?'#065f46':v.status==='Rented'?'#92400e':'#991b1b'}">${v.status}</span>
      </td>
      <td>
        <div class="action-dropdown-container">
          <button class="btn-sandwich" onclick="toggleDropdown(event, ${v.id})">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          <div id="dropdown-${v.id}" class="dropdown-menu">
            <button class="dropdown-item" onclick="event.stopPropagation(); openViewModal(${v.id})">
               <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> View
            </button>
            <button class="dropdown-item" onclick="event.stopPropagation(); openEditModal(${v.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit
            </button>
            <button class="dropdown-item delete" onclick="event.stopPropagation(); openDeleteModal(${v.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join("");
}

function toggleDropdown(event, id) {
  event.stopPropagation();
  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu.id !== `dropdown-${id}`) menu.classList.remove('show');
  });
  const dropdown = document.getElementById(`dropdown-${id}`);
  if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdowns when clicking outside
window.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
});

// Modals
function openViewModal(id) {
  const v = adminVehicleData.find(x => x.id === id);
  if (!v) return;
  document.getElementById("viewVehicleContent").innerHTML = `
    <div class="detail-row"><span class="detail-label">Vehicle Name</span><span class="detail-value">${v.name}</span></div>
    <div class="detail-row"><span class="detail-label">Renter Name</span><span class="detail-value">${v.renterName}</span></div>
    <div class="detail-row"><span class="detail-label">Renter Phone</span><span class="detail-value">${v.renterPhone}</span></div>
    <div class="detail-row"><span class="detail-label">Rentee Name</span><span class="detail-value">${v.renteeName}</span></div>
    <div class="detail-row"><span class="detail-label">Rentee Phone</span><span class="detail-value">${v.renteePhone}</span></div>
    <div class="detail-row"><span class="detail-label">Daily Price</span><span class="detail-value">Rs${v.dailyPrice}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${v.status}</span></div>
  `;
  document.getElementById("viewVehicleModal").style.display = "flex";
}

function openEditModal(id) {
  const v = adminVehicleData.find(x => x.id === id);
  if (!v) return;
  editingId = id;
  document.getElementById("editVehicleName").value = v.name;
  document.getElementById("editRenterName").value = v.renterName;
  document.getElementById("editRenterPhone").value = v.renterPhone;
  document.getElementById("editRenteeName").value = v.renteeName;
  document.getElementById("editRenteePhone").value = v.renteePhone;
  document.getElementById("editDailyPrice").value = v.dailyPrice;
  document.getElementById("editStatus").value = v.status;
  document.getElementById("editVehicleModal").style.display = "flex";
}

function saveEdit() {
  const v = adminVehicleData.find(x => x.id === editingId);
  if (!v) return;
  v.name = document.getElementById("editVehicleName").value;
  v.renterName = document.getElementById("editRenterName").value;
  v.renterPhone = document.getElementById("editRenterPhone").value;
  v.renteeName = document.getElementById("editRenteeName").value;
  v.renteePhone = document.getElementById("editRenteePhone").value;
  v.dailyPrice = document.getElementById("editDailyPrice").value;
  v.status = document.getElementById("editStatus").value;
  
  closeModal('editVehicleModal');
  const searchInput = document.getElementById("searchInput");
  renderVehicles(searchInput.value);
}

function openDeleteModal(id) {
  const v = adminVehicleData.find(x => x.id === id);
  if (!v) return;
  pendingDeleteId = id;
  document.getElementById("deleteVehicleName").textContent = v.name;
  document.getElementById("deleteModal").style.display = "flex";
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  const idx = adminVehicleData.findIndex(x => x.id === pendingDeleteId);
  if (idx !== -1) adminVehicleData.splice(idx, 1);
  closeModal('deleteModal');
  const searchInput = document.getElementById("searchInput");
  renderVehicles(searchInput.value);
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  if (modalId === 'deleteModal') pendingDeleteId = null;
  if (modalId === 'editVehicleModal') editingId = null;
}

// Close modals on backdrop click
document.querySelectorAll(".modal-overlay").forEach(modal => {
  modal.addEventListener("click", function(e) {
    // Only close if clicking the actual overlay background, not the modal box
    if (e.target === this) {
      closeModal(this.id);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderVehicles(e.target.value);
    });
  }
  renderVehicles();
});
