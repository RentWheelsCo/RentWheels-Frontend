

'use strict';


let USERS_DATA = [
  {
    id      : 1,
    name    : 'Emma Rodriguez',
    email   : 'emma.rodriguez@email.com',
    phone   : '+1 (555) 012-3456',
    joined  : '1/15/2024',
    status  : 'active',
    avatar  : 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id      : 2,
    name    : 'James Carter',
    email   : 'james.carter@email.com',
    phone   : '+1 (555) 234-5678',
    joined  : '3/02/2024',
    status  : 'active',
    avatar  : 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id      : 3,
    name    : 'Sita Rana',
    email   : 'sita.rana@email.com',
    phone   : '+977 98-1234-5678',
    joined  : '4/20/2024',
    status  : 'inactive',
    avatar  : '',
  },
  {
    id      : 4,
    name    : 'Arjun Thapa',
    email   : 'arjun.thapa@email.com',
    phone   : '+977 98-9876-5432',
    joined  : '6/11/2024',
    status  : 'active',
    avatar  : 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    id      : 5,
    name    : 'Priya Shrestha',
    email   : 'priya.shrestha@email.com',
    phone   : '+977 98-5555-1234',
    joined  : '8/30/2024',
    status  : 'suspended',
    avatar  : 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id      : 6,
    name    : 'Liam Nguyen',
    email   : 'liam.nguyen@email.com',
    phone   : '+1 (555) 876-5432',
    joined  : '11/05/2024',
    status  : 'active',
    avatar  : '',
  },
];


let filteredUsers = [...USERS_DATA];
let pendingDeleteId = null;


const tbody         = document.getElementById('usersTableBody');
const tableWrap     = document.getElementById('tableWrap');
const emptyState    = document.getElementById('emptyState');
const emptyTitle    = document.getElementById('emptyTitle');
const emptyText     = document.getElementById('emptyText');
const totalCount    = document.getElementById('totalCount');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');

const viewModal      = document.getElementById('viewModal');
const viewModalClose = document.getElementById('viewModalClose');
const viewModalBody  = document.getElementById('viewModalBody');

const editModal        = document.getElementById('editModal');
const editModalClose   = document.getElementById('editModalClose');
const editModalCancel  = document.getElementById('editModalCancel');
const editModalSave    = document.getElementById('editModalSave');
const editName         = document.getElementById('editName');
const editEmail        = document.getElementById('editEmail');
const editPhone        = document.getElementById('editPhone');
const editStatus       = document.getElementById('editStatus');
const editUserId       = document.getElementById('editUserId');

const deleteModal        = document.getElementById('deleteModal');
const deleteModalClose   = document.getElementById('deleteModalClose');
const deleteModalCancel  = document.getElementById('deleteModalCancel');
const deleteModalConfirm = document.getElementById('deleteModalConfirm');
const deleteUserName     = document.getElementById('deleteUserName');

const toastEl = document.getElementById('toast');


function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
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
  const labels = { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' };
  return `<span class="status-badge status-badge--${status}">${labels[status] ?? status}</span>`;
}


function renderTable(data) {
  totalCount.textContent = `${USERS_DATA.length} user${USERS_DATA.length !== 1 ? 's' : ''}`;

  if (!data.length) {
    tableWrap.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyTitle.textContent = searchInput.value.trim()
      ? 'No users found'
      : 'No users yet';
    emptyText.textContent = searchInput.value.trim()
      ? 'Try adjusting your search.'
      : 'Users will appear here once they register.';
    return;
  }

  tableWrap.classList.remove('hidden');
  emptyState.classList.add('hidden');

  tbody.innerHTML = data.map((user, i) => `
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
      </td>
    </tr>
  `).join('');
}


function applySearch(query) {
  const q = query.trim().toLowerCase();
  filteredUsers = q
    ? USERS_DATA.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    : [...USERS_DATA];
  renderTable(filteredUsers);
  searchClear.classList.toggle('hidden', !q);
}

searchInput.addEventListener('input', () => applySearch(searchInput.value));

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  applySearch('');
  searchInput.focus();
});

tbody.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id   = parseInt(btn.dataset.id);
  const user = USERS_DATA.find(u => u.id === id);
  if (!user) return;

  if (btn.dataset.action === 'view')   openViewModal(user);
  if (btn.dataset.action === 'edit')   openEditModal(user);
  if (btn.dataset.action === 'delete') openDeleteModal(user);
});

function openViewModal(user) {
  viewModalBody.innerHTML = `
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
      <span class="view-row__value">${user.phone}</span>
    </div>
    <div class="view-row">
      <span class="view-row__label">Joined</span>
      <span class="view-row__value">${user.joined}</span>
    </div>
    <div class="view-row">
      <span class="view-row__label">Status</span>
      <span class="view-row__value">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
    </div>
  `;
  viewModal.classList.remove('hidden');
}

viewModalClose.addEventListener('click', () => viewModal.classList.add('hidden'));
viewModal.addEventListener('click', e => { if (e.target === viewModal) viewModal.classList.add('hidden'); });


function openEditModal(user) {
  editUserId.value  = user.id;
  editName.value    = user.name;
  editEmail.value   = user.email;
  editPhone.value   = user.phone;
  editStatus.value  = user.status;
  editModal.classList.remove('hidden');
}

function closeEditModal() { editModal.classList.add('hidden'); }

editModalClose.addEventListener('click',  closeEditModal);
editModalCancel.addEventListener('click', closeEditModal);
editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

editModalSave.addEventListener('click', () => {
  const id = parseInt(editUserId.value);
  const idx = USERS_DATA.findIndex(u => u.id === id);
  if (idx === -1) return;



  USERS_DATA[idx] = {
    ...USERS_DATA[idx],
    name  : editName.value.trim()   || USERS_DATA[idx].name,
    email : editEmail.value.trim()  || USERS_DATA[idx].email,
    phone : editPhone.value.trim()  || USERS_DATA[idx].phone,
    status: editStatus.value,
  };

  applySearch(searchInput.value);
  closeEditModal();
  showToast('User updated successfully', 'success');
  console.log(`[RentWheels] Updated user id=${id}`);
});


function openDeleteModal(user) {
  pendingDeleteId = user.id;
  deleteUserName.textContent = user.name;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  pendingDeleteId = null;
}

deleteModalClose.addEventListener('click',  closeDeleteModal);
deleteModalCancel.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

deleteModalConfirm.addEventListener('click', () => {
  if (pendingDeleteId === null) return;



  const name = USERS_DATA.find(u => u.id === pendingDeleteId)?.name ?? 'User';
  USERS_DATA = USERS_DATA.filter(u => u.id !== pendingDeleteId);
  applySearch(searchInput.value);
  closeDeleteModal();
  showToast(`${name} deleted`, 'success');
  console.log(`[RentWheels] Deleted user id=${pendingDeleteId}`);
});


let toastTimer;
function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className   = `toast toast--${type}`;
  toastEl.style.opacity   = '1';
  toastEl.style.transform = 'translateX(-50%) translateY(0)';

  toastTimer = setTimeout(() => {
    toastEl.style.opacity   = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toastEl.classList.add('hidden'), 280);
  }, 3000);
}


document.addEventListener('DOMContentLoaded', () => {


  renderTable(USERS_DATA);
});
