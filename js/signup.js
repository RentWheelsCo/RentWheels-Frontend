let currentPage = 0;

/* ── Taken Usernames ── */
const takenUsernames = ['admin', 'user', 'test', 'root'];

/* ── Eye Icons ── */
const EYE_OPEN = `<img src="../assets/eye.png" class="eye-icon" width="25" height="25" alt="show password">`;
const EYE_CLOSED = `<img src="../assets/eyeClose.png" class="eye-icon" width="25" height="25" alt="hide password">`;

/* ── Password Toggle ── */
function setupPasswordToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  btn.innerHTML = EYE_OPEN;

  function syncVisibility() {
    if (input.value.length > 0) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
      input.type = 'password';
      btn.innerHTML = EYE_OPEN;
    }
  }

  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    input.focus();
  });

  input.addEventListener('input', syncVisibility);
  syncVisibility();
}

/* ── Validation ── */
function validatePassword(password) {
  const errors = [];
  if (password.length < 6) errors.push('at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter (A-Z)');
  if (!/[0-9]/.test(password)) errors.push('one number (0-9)');
  return errors;
}

/* ── Page UI ── */
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

  const group = inputEl.closest('.input-group');
  const old = group?.querySelector('.error-msg');
  if (old) old.remove();

  const err = document.createElement('span');
  err.className = 'error-msg';
  err.textContent = message;

  group?.appendChild(err);
}

/* ── Live clearing ── */
function attachLiveClearing() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const group = input.closest('.input-group');
      group?.querySelector('.error-msg')?.remove();
    });
  });
}

/* ── Restore data based on source ── */
function restoreSavedData() {
  const source = sessionStorage.getItem("signupSource");

  const usernameEl = document.getElementById("username");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("npassword");
  const confirmEl = document.getElementById("cpassword");

  // 🔴 From LOGIN → clear everything
  if (source === "login") {
    usernameEl.value = "";
    emailEl.value = "";
    phoneEl.value = "";
    passwordEl.value = "";
    confirmEl.value = "";
    return;
  }

  // 🟡 From signup1 → keep data, clear passwords
  if (source === "signup1") {
    const saved = sessionStorage.getItem("signupData");

    if (saved) {
      try {
        const { name, email, phone } = JSON.parse(saved);

        usernameEl.value = name || "";
        emailEl.value = email || "";
        phoneEl.value = phone || "";
      } catch (e) {}
    }

    passwordEl.value = "";
    confirmEl.value = "";
    return;
  }

  // 🟢 First visit
  const saved = sessionStorage.getItem("signupData");

  if (saved) {
    try {
      const { name, email, phone } = JSON.parse(saved);

      usernameEl.value = name || "";
      emailEl.value = email || "";
      phoneEl.value = phone || "";
    } catch (e) {}
  }
}

/* ── Next Page ── */
function nextPage() {
  clearErrors();

  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const passwordEl = document.getElementById('npassword');
  const confirmEl = document.getElementById('cpassword');

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const password = passwordEl.value;
  const confirmPassword = confirmEl.value;

  let hasError = false;

  if (!username) {
    showError(usernameEl, 'Username is required.');
    hasError = true;
  } else if (takenUsernames.includes(username.toLowerCase())) {
    showError(usernameEl, 'This username is already taken.');
    hasError = true;
  }

  if (!email) {
    showError(emailEl, 'Email is required.');
    hasError = true;
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    showError(phoneEl, 'Phone must be 10 digits.');
    hasError = true;
  }

  if (!password || password.length < 6) {
    showError(passwordEl, 'Password must be at least 6 characters.');
    hasError = true;
  }

  if (confirmPassword !== password) {
    showError(confirmEl, 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  sessionStorage.setItem(
    'signupData',
    JSON.stringify({ name: username, email, phone })
  );

  setPage(1);
  window.location.href = '../html/signup1.html';
}

/* ── Go to login ── */
function goToLogin() {
  window.location.href = '../html/login.html';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  restoreSavedData();
  attachLiveClearing();
  setupPasswordToggle('npassword', 'toggle-npassword');
  setupPasswordToggle('cpassword', 'toggle-cpassword');

  // IMPORTANT cleanup
  sessionStorage.removeItem("signupSource");
});