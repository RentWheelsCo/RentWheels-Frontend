let currentPage = 0;
const takenUsernames = ['admin', 'user', 'test', 'root'];
const EYE_OPEN = `<img src="../assets/eye.png" class="eye-icon" width="25" height="25" alt="show password">`;
const EYE_CLOSED = `<img src="../assets/eyeClose.png" class="eye-icon" width="25" height="25" alt="hide password">`;
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
function validatePassword(password) {
  const errors = [];
  if (password.length < 6) errors.push('at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter (A-Z)');
  if (!/[0-9]/.test(password)) errors.push('one number (0-9)');
  return errors;
}
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
function attachLiveClearing() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const group = input.closest('.input-group');
      group?.querySelector('.error-msg')?.remove();
    });
  });
}
function restoreSavedData() {
  const source = sessionStorage.getItem("signupSource");
  const usernameEl = document.getElementById("username");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("npassword");
  const confirmEl = document.getElementById("cpassword");
  if (source === "login") {
    usernameEl.value = "";
    emailEl.value = "";
    phoneEl.value = "";
    passwordEl.value = "";
    confirmEl.value = "";
    return;
  }
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
  } else if (!email.endsWith('@gmail.com')) {
    showError(emailEl, 'Email must be a @gmail.com address.');
    hasError = true;
  }
  if (!phone || !/^\d{10}$/.test(phone)) {
    showError(phoneEl, 'Phone must be 10 digits.');
    hasError = true;
  }
  const pwErrors = validatePassword(password);
  if (!password) {
    showError(passwordEl, 'Password is required.');
    hasError = true;
  } else if (pwErrors.length > 0) {
    showError(passwordEl, 'Password needs: ' + pwErrors.join(', ') + '.');
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
function goToLogin() {
  window.location.href = '../html/login.html';
}
document.addEventListener('DOMContentLoaded', () => {
  restoreSavedData();
  attachLiveClearing();
  setupPasswordToggle('npassword', 'toggle-npassword');
  setupPasswordToggle('cpassword', 'toggle-cpassword');
  sessionStorage.removeItem("signupSource");
 
const pwInput = document.getElementById('npassword');
const pwHint = document.createElement('div');
pwHint.id = 'pw-strength-hint';
pwHint.style.cssText = 'margin-top:6px;font-size:0.75rem;font-weight:600;line-height:1.6;';
pwInput.closest('.input-group').appendChild(pwHint);

pwInput.addEventListener('input', () => {
  const val = pwInput.value;
  if (!val) { pwHint.innerHTML = ''; return; }
  const rules = [
    { ok: val.length >= 6,        text: 'At least 6 characters' },
    { ok: /[A-Z]/.test(val),      text: 'One uppercase letter (A–Z)' },
    { ok: /[0-9]/.test(val),      text: 'One number (0–9)' },
  ];
  pwHint.innerHTML = rules.map(r =>
    `<span style="color:${r.ok ? '#22c55e' : '#ef4444'}">
      ${r.ok ? '✓' : '✗'} ${r.text}
    </span>`
  ).join('<br>');
});
});