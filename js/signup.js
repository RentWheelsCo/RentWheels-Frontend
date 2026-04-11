let currentPage = 0;

function validatePassword(password) {
  const errors = [];
  if (password.length < 6)       errors.push('at least 6 characters');
  if (!/[A-Z]/.test(password))   errors.push('one uppercase letter (A-Z)');
  if (!/[0-9]/.test(password))   errors.push('one number (0-9)');
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
  if (!message) return;
  const err = document.createElement('span');
  err.className = 'error-msg';
  err.textContent = message;
  inputEl.parentNode.appendChild(err);
}

function renderPasswordStrength(password) {
  const passwordEl = document.getElementById('npassword');

  let hint = document.getElementById('password-strength-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'password-strength-hint';
    hint.style.cssText = 'font-size:0.78rem;margin-top:6px;line-height:1.7;';
    passwordEl.parentNode.appendChild(hint);
  }

  if (!password) { hint.innerHTML = ''; return; }

  const checks = [
    { label: '6+ characters',        ok: password.length >= 6 },
    { label: 'Uppercase letter (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'Number (0-9)',           ok: /[0-9]/.test(password) },
  ];

  const passed = checks.filter(c => c.ok).length;
  const colors = ['#e5e7eb', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const color  = colors[passed];
  const label  = labels[passed];

  hint.innerHTML = `
    <div style="display:flex;gap:4px;margin-bottom:4px;">
      ${[0,1,2].map(i => `
        <div style="flex:1;height:4px;border-radius:2px;
          background:${i < passed ? color : '#e5e7eb'};
          transition:background 0.2s;"></div>
      `).join('')}
    </div>
    ${label ? `<span style="color:${color};font-weight:600;font-size:0.75rem;">${label}</span>` : ''}
    <ul style="margin:2px 0 0 14px;padding:0;list-style:none;">
      ${checks.map(c => `
        <li style="color:${c.ok ? '#22c55e' : '#9ca3af'};">
          ${c.ok ? '✓' : '○'} ${c.label}
        </li>
      `).join('')}
    </ul>
  `;
}

function attachLiveClearing() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const existing = input.parentNode.querySelector('.error-msg');
      if (existing) existing.remove();
    });
  });

  const passwordEl = document.getElementById('npassword');
  if (passwordEl) {
    passwordEl.addEventListener('input', () => renderPasswordStrength(passwordEl.value));
  }
}
function restoreSavedData() {
  const saved = sessionStorage.getItem('signupData');
  if (!saved) return;
  const { name, email, phone } = JSON.parse(saved);
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('username', name);
  set('email',    email);
  set('phone',    phone);
}

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
    showError(usernameEl, 'Name is required.');
    hasError = true;
  } else if (username.length < 2) {
    showError(usernameEl, 'Name must be at least 2 characters.');
    hasError = true;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    showError(emailEl, 'Email is required.');
    hasError = true;
  } else if (!emailPattern.test(email)) {
    showError(emailEl, 'Invalid email format (e.g. you@example.com).');
    hasError = true;
  }
  if (!phone) {
    showError(phoneEl, 'Phone number is required.');
    hasError = true;
  } else if (phone.length < 7) {
    showError(phoneEl, 'Phone number must be at least 7 digits.');
    hasError = true;
  } else if (phone.length > 20) {
    showError(phoneEl, 'Phone number must be 20 digits or fewer.');
    hasError = true;
  } else if (!/^[0-9+\-\s()]+$/.test(phone)) {
    showError(phoneEl, 'Phone number contains invalid characters.');
    hasError = true;
  }

  if (!password) {
    showError(passwordEl, 'Password is required.');
    hasError = true;
  } else {
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      showError(passwordEl, `Password must include: ${pwErrors.join(', ')}.`);
      hasError = true;
    }
  }

  if (!confirmPassword) {
    showError(confirmEl, 'Please confirm your password.');
    hasError = true;
  } else if (password && confirmPassword !== password) {
    showError(confirmEl, 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  sessionStorage.setItem('signupData', JSON.stringify({ name: username, email, phone, password }));
  setPage(1);
  window.location.href = 'signup1.html';
}

function goToLogin() {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  restoreSavedData();
  attachLiveClearing();

  const signupError = sessionStorage.getItem('signupError');
  if (signupError) {
    const emailEl = document.getElementById('email');
    if (emailEl) showError(emailEl, signupError);
    sessionStorage.removeItem('signupError');
  }
});