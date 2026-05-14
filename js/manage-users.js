"use strict";

let USERS_DATA = [];

let filteredUsers = [...USERS_DATA];
let pendingDeleteId = null;

const tbody = document.getElementById("usersTableBody");
const tableWrap = document.getElementById("tableWrap");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");
const totalCount = document.getElementById("totalCount");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");

const viewModal = document.getElementById("viewModal");
const viewModalClose = document.getElementById("viewModalClose");
const viewModalBody = document.getElementById("viewModalBody");

const editModal = document.getElementById("editModal");
const editModalClose = document.getElementById("editModalClose");
const editModalCancel = document.getElementById("editModalCancel");
const editModalSave = document.getElementById("editModalSave");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editStatus = document.getElementById("editStatus");
const editUserId = document.getElementById("editUserId");

const deleteModal = document.getElementById("deleteModal");
const deleteModalClose = document.getElementById("deleteModalClose");
const deleteModalCancel = document.getElementById("deleteModalCancel");
const deleteModalConfirm = document.getElementById("deleteModalConfirm");
const deleteUserName = document.getElementById("deleteUserName");

const toastEl = document.getElementById("toast");

function logout() {
  // COOKIE AUTH IMPLEMENTED
  window.RW_API?.auth?.logout?.().catch(() => {});
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "login.html";
}

function formatJoined(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function showLoadingState(title, text) {
  tableWrap.classList.add("hidden");
  emptyState.classList.remove("hidden");
  emptyTitle.textContent = title || "Loading...";
  emptyText.textContent = text || "Fetching users...";
}

async function loadUsers() {
  showLoadingState("Loading users", "Fetching latest users from the server...");

  try {
    const payload = await window.RW_API.request("/auth/admin/users", {
      params: { limit: 50 },
    });

    const users = Array.isArray(payload?.data?.users) ? payload.data.users : [];
    USERS_DATA = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      joined: formatJoined(u.createdAt),
      status: u.isVerified ? "active" : "inactive",
      avatar: u.avatar || "",
      licenseImage: u.licenseImage || u.license_image || "",
      bookings: u.bookings || u.bookingSummary || { total: 0, active: 0, completed: 0, cancelled: 0 },
      vehicles: Array.isArray(u.vehicles) ? u.vehicles : [],
    }));

    filteredUsers = [...USERS_DATA];
    applySearch(searchInput.value);
  } catch (err) {
    if (err?.status === 401) {
      logout();
      return;
    }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message ||
      "Failed to load users.";
    console.error("Load users error:", err);
    showLoadingState("Unable to load users", message);
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarHTML(user) {
  if (user.avatar) {
    return `<img
      src="${user.avatar}"
      alt="${user.name}"
      class="user-avatar"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
    /><span class="user-avatar--initials" style="display:none">${getInitials(user.name)}</span>`;
  }
  return `<span class="user-avatar--initials">${getInitials(user.name)}</span>`;
}

function statusBadge(status) {
  const labels = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
  };
  return `<span class="status-badge status-badge--${status}">${labels[status] ?? status}</span>`;
}

function renderTable(data) {
  totalCount.textContent = `${USERS_DATA.length} user${USERS_DATA.length !== 1 ? "s" : ""}`;

  if (!data.length) {
    tableWrap.classList.add("hidden");
    emptyState.classList.remove("hidden");
    emptyTitle.textContent = searchInput.value.trim()
      ? "No users found"
      : "No users yet";
    emptyText.textContent = searchInput.value.trim()
      ? "Try adjusting your search."
      : "Users will appear here once they register.";
    return;
  }

  tableWrap.classList.remove("hidden");
  emptyState.classList.add("hidden");

  tbody.innerHTML = data
    .map(
      (user, i) => `
    <tr style="animation-delay:${(i * 0.04).toFixed(2)}s" data-id="${user.id}">
      <td>
        <div class="user-cell">
          ${avatarHTML(user)}
          <span class="user-name">${user.name}</span>
        </div>
      </td>
      <td class="td-email">${user.email}</td>
      <td class="td-phone">${user.phone}</td>
      <td class="td-joined">${user.joined}</td>
      <td>${statusBadge(user.status)}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-action-toggle" data-action="toggle" data-id="${user.id}" aria-label="Actions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
          <div class="actions-menu hidden" id="actions-menu-${user.id}">
            <button class="btn-action btn-action--view" data-action="view" data-id="${user.id}">
              <svg viewBox="0 0 16 16" fill="none">
                <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" stroke-width="1.4"/>
                <circle cx="8" cy="8" r="1.8" fill="currentColor"/>
              </svg>
              View
            </button>
            <button class="btn-action btn-action--edit" data-action="edit" data-id="${user.id}">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              </svg>
              Edit
            </button>
            <button class="btn-action btn-action--delete" data-action="delete" data-id="${user.id}">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 5h10M6 5V3h4v2M6.5 8v4M9.5 8v4M4 5l.8 8h6.4L12 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function applySearch(query) {
  const q = query.trim().toLowerCase();
  filteredUsers = q
    ? USERS_DATA.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    : [...USERS_DATA];
  renderTable(filteredUsers);
  searchClear.classList.toggle("hidden", !q);
}

searchInput.addEventListener("input", () => applySearch(searchInput.value));

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  applySearch("");
  searchInput.focus();
});

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = parseInt(btn.dataset.id);

  if (action === "toggle") {
    const menu = document.getElementById(`actions-menu-${id}`);
    if (menu) {
      const isHidden = menu.classList.contains("hidden");

      // Close all other open menus
      document.querySelectorAll(".actions-menu:not(.hidden)").forEach((el) => {
        el.classList.add("hidden");
        const toggleBtn = document.querySelector(
          `.btn-action-toggle[data-id="${el.id.split("-").pop()}"] svg`,
        );
        if (toggleBtn) toggleBtn.style.transform = "rotate(0deg)";
      });

      if (isHidden) {
        menu.classList.remove("hidden");
        btn.querySelector("svg").style.transform = "rotate(90deg)";
      }
    }
    return;
  }

  const user = USERS_DATA.find((u) => u.id === id);
  if (!user) return;

  if (action === "view") openViewModal(user);
  if (action === "edit") openEditModal(user);
  if (action === "delete") openDeleteModal(user);
});

function openViewModal(user) {
  const bk = user.bookings || { total: 0, active: 0, completed: 0, cancelled: 0 };
  const vehicles = user.vehicles || [];

  const vehiclesHTML = vehicles.length
    ? vehicles.map(v => `
        <div class="profile-vehicle-row">
          <div class="profile-vehicle-info">
            <span class="profile-vehicle-name">${v.name}</span>
            <span class="profile-vehicle-plate">${v.plate} &bull; ${v.type}</span>
          </div>
          <span class="status-badge status-badge--${v.status === 'active' ? 'active' : 'inactive'}">
            ${v.status.charAt(0).toUpperCase() + v.status.slice(1)}
          </span>
        </div>`).join("")
    : `<p class="profile-no-vehicles">No vehicles registered.</p>`;

  viewModalBody.innerHTML = `
    <!-- Basic Info -->
    <div class="profile-section">
      <h3 class="profile-section__title">Basic Information</h3>
      <div class="profile-basic-grid">
        <div class="view-row">
          <span class="view-row__label">Full Name</span>
          <span class="view-row__value">${user.name}</span>
        </div>
        <div class="view-row">
          <span class="view-row__label">Email</span>
          <span class="view-row__value">${user.email}</span>
        </div>
        <div class="view-row">
          <span class="view-row__label">Phone</span>
          <span class="view-row__value">${user.phone || "—"}</span>
        </div>
        <div class="view-row">
          <span class="view-row__label">Joined</span>
          <span class="view-row__value">${user.joined}</span>
        </div>
        <div class="view-row" style="border-bottom:none;padding-bottom:0">
          <span class="view-row__label">Status</span>
          <span class="view-row__value">${statusBadge(user.status)}</span>
        </div>
      </div>
    </div>

    <div class="profile-divider"></div>

    <!-- License Image -->
    <div class="profile-section">
      <h3 class="profile-section__title">Driver's License</h3>
      ${user.licenseImage
        ? `<div class="profile-license-wrap">
             <img class="profile-license-img" src="${user.licenseImage}"
               alt="Driver's License"
               onerror="this.parentElement.innerHTML='<p class=\\'profile-no-vehicles\\'>License image unavailable.</p>'" />
           </div>`
        : `<p class="profile-no-vehicles">No license image uploaded.</p>`}
    </div>

    <div class="profile-divider"></div>

    <!-- Booking Summary -->
    <div class="profile-section">
      <h3 class="profile-section__title">Booking Summary</h3>
      <div class="profile-booking-grid">
        <div class="profile-booking-stat profile-booking-stat--total">
          <span class="profile-booking-stat__num">${bk.total}</span>
          <span class="profile-booking-stat__lbl">Total</span>
        </div>
        <div class="profile-booking-stat profile-booking-stat--active">
          <span class="profile-booking-stat__num">${bk.active}</span>
          <span class="profile-booking-stat__lbl">Active</span>
        </div>
        <div class="profile-booking-stat profile-booking-stat--completed">
          <span class="profile-booking-stat__num">${bk.completed}</span>
          <span class="profile-booking-stat__lbl">Completed</span>
        </div>
        <div class="profile-booking-stat profile-booking-stat--cancelled">
          <span class="profile-booking-stat__num">${bk.cancelled}</span>
          <span class="profile-booking-stat__lbl">Cancelled</span>
        </div>
      </div>
    </div>

    <div class="profile-divider"></div>

    <!-- Registered Vehicles -->
    <div class="profile-section">
      <h3 class="profile-section__title">Registered Vehicles
        <span class="profile-section__count">${vehicles.length}</span>
      </h3>
      <div class="profile-vehicles-list">${vehiclesHTML}</div>
    </div>
  `;
  viewModal.classList.remove("hidden");
}

viewModalClose.addEventListener("click", () =>
  viewModal.classList.add("hidden"),
);
viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) viewModal.classList.add("hidden");
});

function openEditModal(user) {
  editUserId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
  editPhone.value = user.phone;
  editStatus.value = user.status;
  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editModal.classList.add("hidden");
}

editModalClose.addEventListener("click", closeEditModal);
editModalCancel.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

editModalSave.addEventListener("click", async () => {
  const id = parseInt(editUserId.value);
  const idx = USERS_DATA.findIndex((u) => u.id === id);
  if (idx === -1) return;

  const originalText = editModalSave.textContent;
  editModalSave.disabled = true;
  editModalSave.textContent = "Saving...";

  const payloadBody = {
    name: editName.value.trim() || undefined,
    email: editEmail.value.trim() || undefined,
    phone: editPhone.value.trim() || undefined,
    isVerified: editStatus.value === "active",
  };

  try {
    const payload = await window.RW_API.request(`/auth/admin/users/${id}`, {
      method: "PATCH",
      body: payloadBody,
    });

    const updated = payload?.data || {};
    USERS_DATA[idx] = {
      ...USERS_DATA[idx],
      name: updated.name ?? USERS_DATA[idx].name,
      email: updated.email ?? USERS_DATA[idx].email,
      phone: updated.phone ?? USERS_DATA[idx].phone,
      status: updated.isVerified ? "active" : "inactive",
    };

    applySearch(searchInput.value);
    closeEditModal();
    showToast("User updated successfully", "success");
  } catch (err) {
    if (err?.status === 401) {
      logout();
      return;
    }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message ||
      "Failed to update user.";
    console.error("Update user error:", err);
    showToast(message, "error");
  } finally {
    editModalSave.disabled = false;
    editModalSave.textContent = originalText;
  }
});

function openDeleteModal(user) {
  pendingDeleteId = user.id;
  deleteUserName.textContent = user.name;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  deleteModal.classList.add("hidden");
  pendingDeleteId = null;
}

deleteModalClose.addEventListener("click", closeDeleteModal);
deleteModalCancel.addEventListener("click", closeDeleteModal);
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

deleteModalConfirm.addEventListener("click", async () => {
  if (pendingDeleteId === null) return;

  const id = pendingDeleteId;
  const name = USERS_DATA.find((u) => u.id === id)?.name ?? "User";

  const originalText = deleteModalConfirm.textContent;
  deleteModalConfirm.disabled = true;
  deleteModalConfirm.textContent = "Deleting...";

  try {
    await window.RW_API.request(`/auth/admin/users/${id}`, {
      method: "DELETE",
    });
    USERS_DATA = USERS_DATA.filter((u) => u.id !== id);
    applySearch(searchInput.value);
    closeDeleteModal();
    showToast(`${name} deleted`, "success");
  } catch (err) {
    if (err?.status === 401) {
      logout();
      return;
    }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message ||
      "Failed to delete user.";
    console.error("Delete user error:", err);
    showToast(message, "error");
  } finally {
    deleteModalConfirm.disabled = false;
    deleteModalConfirm.textContent = originalText;
  }
});

let toastTimer;
function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className = `toast toast--${type}`;
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateX(-50%) translateY(0)";

  toastTimer = setTimeout(() => {
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(8px)";
    setTimeout(() => toastEl.classList.add("hidden"), 280);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  filteredUsers = [];
  showLoadingState("Loading users", "Fetching latest users from the server...");
  loadUsers();
});
