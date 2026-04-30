let currentPage = 0;

/* ── Taken Usernames (define your list here) ── */
const takenUsernames = ['admin', 'user', 'test', 'root'];

/* ── Eye Icons (inline SVG — no external image needed) ── */
const EYE_OPEN = `<img src="../assets/eye.png"  class="eye-icon" width="25" height="25" alt="show password">`;
const EYE_CLOSED = `<img src="../assets/eyeClose.png"  class="eye-icon" width="25" height="25" alt="show password">`;

/* ── Password Toggle ── */
function setupPasswordToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if (!input || !btn) return;

  btn.innerHTML = EYE_OPEN;

  function syncVisibility() {
    if (input.value.length > 0) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
      input.type    = 'password';
      btn.innerHTML = EYE_OPEN;
    }
  }

  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type    = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    input.focus();
  });

  input.addEventListener('input', syncVisibility);
  syncVisibility();
}

/* ── Validation ── */
function validatePassword(password) {
  const errors = [];
  if (password.length < 6)     errors.push('at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter (A-Z)');
  if (!/[0-9]/.test(password)) errors.push('one number (0-9)');
  return errors;
}

/* ── Page Dots ── */
function setPage(n) {
  currentPage = n;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === n);
  });
}

function clearErrors() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.classList.remove('input-error');
  });
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
}

function showError(inputEl, message) {
  inputEl.classList.add('input-error');
  if (!message) return;

  const group  = inputEl.closest('.input-group');
  const oldErr = group ? group.querySelector('.error-msg') : null;
  if (oldErr) oldErr.remove();

  const err = document.createElement('span');
  err.className   = 'error-msg';
  err.textContent = message;
  if (group) group.appendChild(err);

  const wrapper = inputEl.closest('.password-wrapper');
  if (wrapper && inputEl.value.length > 0) {
    const btn = wrapper.querySelector('.eye-btn');
    if (btn) btn.classList.add('visible');
  }
}

/* ── Live Error Clearing ── */
function attachLiveClearing() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const group    = input.closest('.input-group');
      const existing = group ? group.querySelector('.error-msg') : null;
      if (existing) existing.remove();
    });
  });
}

/* ── Session Restore ── */
function restoreSavedData() {
  const saved = sessionStorage.getItem('signupData');
  if (!saved) return;
  try {
    const { name, email, phone } = JSON.parse(saved);
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('username', name);
    set('email',    email);
    set('phone',    phone);
  } catch (e) { /* ignore */ }
}

/* ── Next Page ── */
function nextPage() {
  clearErrors();

  const usernameEl = document.getElementById('username');
  const emailEl    = document.getElementById('email');
  const phoneEl    = document.getElementById('phone');
  const passwordEl = document.getElementById('npassword');
  const confirmEl  = document.getElementById('cpassword');

  const username        = usernameEl.value.trim();
  const email           = emailEl.value.trim();
  const phone           = phoneEl.value.trim();
  const password        = passwordEl.value;
  const confirmPassword = confirmEl.value;

  let hasError = false;

  if (!username) {
    showError(usernameEl, 'Username is required.');
    hasError = true;
  } else if (takenUsernames.includes(username.toLowerCase())) {
    showError(usernameEl, 'This username is already taken. Please choose another.');
    hasError = true;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    showError(emailEl, 'Email is required.');
    hasError = true;
  } else if (!emailPattern.test(email)) {
    showError(emailEl, 'Please enter a valid email address (e.g. you@example.com).');
    hasError = true;
  }

  if (!phone) {
    showError(phoneEl, 'Phone number is required.');
    hasError = true;
  } else if (!/^\d{10}$/.test(phone)) {
    showError(phoneEl, 'Phone number must be exactly 10 digits.');
    hasError = true;
  }

  if (!password) {
    showError(passwordEl, 'Password is required.');
    hasError = true;
  } else if (password.length < 6) {
    showError(passwordEl, 'Password must be at least 6 characters long.');
    hasError = true;
  }

  if (!confirmPassword) {
    showError(confirmEl, 'Please confirm your password.');
    hasError = true;
  } else if (password && confirmPassword !== password) {
    showError(confirmEl, 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  // Save data before navigating
  sessionStorage.setItem('signupData', JSON.stringify({ name: username, email, phone }));

  setPage(1);
  window.location.href = '../html/signup1.html';
}

function goToLogin() {
  window.location.href = '../html/login.html';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  restoreSavedData();
  attachLiveClearing();
  setupPasswordToggle('npassword', 'toggle-npassword');
  setupPasswordToggle('cpassword', 'toggle-cpassword');
});