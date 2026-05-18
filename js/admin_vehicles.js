const adminVehicleData = [];
let optionRows = [];

const VEHICLE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs>
      <rect width="640" height="420" rx="24" fill="url(#g)"/>
      <path d="M220 250c0-18 14-32 32-32h150c14 0 26 9 31 21l10 29h22c18 0 33 15 33 33v16h-28c-6 19-23 33-44 33s-38-14-44-33H288c-6 19-23 33-44 33s-38-14-44-33h-28v-32c0-21 17-38 38-38h26l8-22c5-14 17-23 32-23h135" fill="none" stroke="#9ca3af" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="244" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
      <circle cx="440" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
    </svg>`,
  );

let pendingDeleteId = null;
let editingId = null;

function renderVehicles(searchTerm = "") {
  const tbody = document.getElementById("vehicleTableBody");
  const filteredData = adminVehicleData.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  tbody.innerHTML = filteredData.map((v, i) => `
    <tr style="animation-delay: ${i * 50}ms">
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
            <button class="dropdown-item" onclick="openViewModal(${v.id})">
               <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> View
            </button>
            <button class="dropdown-item" onclick="openEditModal(${v.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit
            </button>
            <button class="dropdown-item delete" onclick="openDeleteModal(${v.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join("");
}

function mapStatusFromApi(activeBookingsCount) {
  return Number(activeBookingsCount || 0) > 0 ? "Rented" : "Available";
}

function safeName(v) {
  return v?.name || "Vehicle";
}

async function loadVehicles() {
  try {
    const payload = await window.RW_API.admin.getAllVehicles({ limit: 100 });
    const rows = Array.isArray(payload?.data?.vehicles) ? payload.data.vehicles : [];

    adminVehicleData.splice(0, adminVehicleData.length, ...rows.map((v) => {
      const photo = Array.isArray(v?.photos) && v.photos.length ? v.photos[0] : VEHICLE_PLACEHOLDER;
      return {
        id: v.id,
        name: safeName(v),
        image: photo,
        renterName: "-",
        renterPhone: "-",
        renteeName: "-",
        renteePhone: "-",
        dailyPrice: Number(v.dailyPrice || 0),
        status: mapStatusFromApi(v.activeBookingsCount),
      };
    }));
  } catch (err) {
    console.error("Admin vehicles load error:", err);
  }
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

  const name = document.getElementById("editVehicleName").value;
  const dailyPrice = Number(document.getElementById("editDailyPrice").value);
  const uiStatus = document.getElementById("editStatus").value;
  const availabilityStatus = uiStatus === "Rented" ? "NOT_AVAILABLE" : "AVAILABLE";

  const btn = document.getElementById("saveEditBtn");
  const original = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Saving...";
  }

  const patch = {
    ...(name ? { name } : {}),
    ...(Number.isFinite(dailyPrice) && dailyPrice > 0 ? { dailyPrice } : {}),
    availabilityStatus,
  };

  window.RW_API.request(`/vehicles/${editingId}`, { method: "PATCH", body: patch })
    .then(() => loadVehicles())
    .then(() => {
      closeModal('editVehicleModal');
      const searchInput = document.getElementById("searchInput");
      renderVehicles(searchInput ? searchInput.value : "");
    })
    .catch((err) => {
      console.error("Admin vehicle update error:", err);
      alert(err?.message || "Failed to update vehicle.");
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
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
  const id = pendingDeleteId;
  const btn = document.getElementById("confirmDeleteBtn");
  const original = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Deleting...";
  }

  window.RW_API.request(`/vehicles/${id}`, { method: "DELETE" })
    .then(() => {
      const idx = adminVehicleData.findIndex(x => x.id === id);
      if (idx !== -1) adminVehicleData.splice(idx, 1);
      closeModal('deleteModal');
      const searchInput = document.getElementById("searchInput");
      renderVehicles(searchInput ? searchInput.value : "");
    })
    .catch((err) => {
      console.error("Admin vehicle delete error:", err);
      alert(err?.message || "Failed to delete vehicle.");
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
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
  loadVehicles().finally(() => renderVehicles());
  setupOptionAdmin();
});

async function fetchAllOptions() {
  const types = ["VEHICLE_TYPE", "BRAND", "MODEL", "CATEGORY", "TRANSMISSION", "FUEL_TYPE", "LOCATION"];
  const payloads = await Promise.all(types.map((type) => window.RW_API.vehicles.getOptions({ type, limit: 200 })));
  const all = [];
  payloads.forEach((p) => {
    const rows = Array.isArray(p?.data?.options) ? p.data.options : [];
    all.push(...rows);
  });
  return all.sort((a, b) => a.id - b.id);
}

function renderOptionsTable() {
  const tbody = document.getElementById("optionsTableBody");
  if (!tbody) return;
  if (!optionRows.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#7b8292;padding:16px;">No options found.</td></tr>`;
    return;
  }
  tbody.innerHTML = optionRows.map((o) => `
    <tr>
      <td>${o.id}</td>
      <td>${o.type}</td>
      <td>${o.value}</td>
      <td>${o.isActive ? "Yes" : "No"}</td>
      <td>
        <button class="${o.isActive ? "btn-danger" : "btn-primary"}" style="padding:6px 10px;font-size:12px;"
          onclick="toggleOptionActive(${o.id}, ${o.isActive ? "false" : "true"})">
          ${o.isActive ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  `).join("");
}

function setOptionMsg(text, isError = false) {
  const el = document.getElementById("optionStatusMsg");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = isError ? "#dc2626" : "#6b7280";
}

async function loadOptionAdminData() {
  try {
    optionRows = await fetchAllOptions();
    renderOptionsTable();

    const parentSel = document.getElementById("optParent");
    if (parentSel) {
      const brands = optionRows.filter((o) => o.type === "BRAND" && o.isActive);
      parentSel.innerHTML = `<option value="">None</option>` + brands.map((b) => `<option value="${b.id}">${b.value}</option>`).join("");
    }
  } catch (err) {
    console.error("Load options error:", err);
    setOptionMsg(err?.message || "Failed to load options.", true);
  }
}

async function createOption() {
  const typeEl = document.getElementById("optType");
  const valueEl = document.getElementById("optValue");
  const parentEl = document.getElementById("optParent");
  const btn = document.getElementById("createOptionBtn");
  if (!typeEl || !valueEl || !parentEl || !btn) return;

  const type = String(typeEl.value || "").trim();
  const value = String(valueEl.value || "").trim();
  const parentIdRaw = String(parentEl.value || "").trim();
  if (!type || !value) {
    setOptionMsg("Type and value are required.", true);
    return;
  }

  const body = { type, value };
  if (type === "MODEL" && parentIdRaw) body.parentId = Number(parentIdRaw);

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Adding...";
  setOptionMsg("");
  try {
    await window.RW_API.request("/vehicles/options", { method: "POST", body });
    valueEl.value = "";
    setOptionMsg("Option added successfully.");
    await loadOptionAdminData();
  } catch (err) {
    console.error("Create option error:", err);
    setOptionMsg(err?.message || "Failed to add option.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function toggleOptionActive(id, nextActive) {
  try {
    await window.RW_API.request(`/vehicles/options/${id}`, {
      method: "PATCH",
      body: { isActive: Boolean(nextActive) },
    });
    setOptionMsg(`Option #${id} updated.`);
    await loadOptionAdminData();
  } catch (err) {
    console.error("Toggle option status error:", err);
    setOptionMsg(err?.message || "Failed to update option.", true);
  }
}

function setupOptionAdmin() {
  const typeEl = document.getElementById("optType");
  const btn = document.getElementById("createOptionBtn");
  if (btn) btn.addEventListener("click", createOption);
  if (typeEl) {
    typeEl.addEventListener("change", () => {
      const parentEl = document.getElementById("optParent");
      if (!parentEl) return;
      parentEl.disabled = typeEl.value !== "MODEL";
      if (parentEl.disabled) parentEl.value = "";
    });
  }
  loadOptionAdminData().then(() => {
    const parentEl = document.getElementById("optParent");
    if (parentEl && typeEl) parentEl.disabled = typeEl.value !== "MODEL";
  });
}

window.toggleOptionActive = toggleOptionActive;
