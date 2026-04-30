const form     = document.getElementById('loginForm');
const emailIn  = document.getElementById('email');
const pwIn     = document.getElementById('password');
const togglePw = document.getElementById('togglePw');
const loginErr = document.getElementById('loginError');

const EYE_OPEN   = `<img src="../assets/eye.png"  class="eye-icon" width="20" height="20" alt="show password">`;
const EYE_CLOSED = `<img src="../assets/eyeClose.png"  class="eye-icon" width="20" height="20" alt="show password">`;
/* ── Set initial icon & hide toggle until user types ── */
togglePw.innerHTML = EYE_OPEN;
togglePw.style.display = 'none';

/* ── Helpers ── */
function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function validatePassword(val) {
  return val.length >= 6;
}

function setFieldState(input, errEl, okEl, isValid) {
  input.classList.remove('valid', 'invalid');
  errEl.classList.remove('show');
  okEl.classList.remove('show');

  if (isValid) {
    input.classList.add('valid');
    okEl.classList.add('show');
  } else {
    input.classList.add('invalid');
    if (input.value.trim().length > 0) {
      errEl.classList.add('show');
    }
  }
}

function setLoading(isLoading) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled    = isLoading;
  btn.textContent = isLoading ? 'Signing in…' : 'Sign In';
}

function showLoginError(message) {
  loginErr.textContent   = message;
  loginErr.style.display = 'block';
}

function hideLoginError() {
  loginErr.style.display = 'none';
  loginErr.textContent   = '';
}

/* ── Password input — show/hide toggle button ── */
pwIn.addEventListener('input', () => {
  if (pwIn.value.length > 0) {
    togglePw.style.display = 'block';
  } else {
    togglePw.style.display = 'none';
    pwIn.type              = 'password';
    togglePw.innerHTML     = EYE_OPEN;
    pwIn.classList.remove('valid', 'invalid');
    document.getElementById('pw-err')?.classList.remove('show');
    document.getElementById('pw-ok')?.classList.remove('show');
  }
});

/* ── Email input — clear state when emptied ── */
emailIn.addEventListener('input', () => {
  if (emailIn.value.length === 0) {
    emailIn.classList.remove('valid', 'invalid');
    document.getElementById('email-err')?.classList.remove('show');
    document.getElementById('email-ok')?.classList.remove('show');
  }
});

/* ── Eye toggle ── */
togglePw.addEventListener('click', () => {
  const isText       = pwIn.type === 'text';
  pwIn.type          = isText ? 'password' : 'text';
  togglePw.innerHTML = isText ? EYE_OPEN : EYE_CLOSED;
  togglePw.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
  pwIn.focus();
});

function goToSignup() {
  sessionStorage.setItem("signupSource", "login");
  window.location.href = "../html/signup.html";
}

/* ── Form submit ── */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  hideLoginError();

  const emailOk = validateEmail(emailIn.value);
  const pwOk    = validatePassword(pwIn.value);

  setFieldState(emailIn, document.getElementById('email-err'), document.getElementById('email-ok'), emailOk);
  setFieldState(pwIn,    document.getElementById('pw-err'),    document.getElementById('pw-ok'),    pwOk);

  if (!emailOk || !pwOk) return;

  const DEMO_EMAIL = 'test@example.com';
  const DEMO_PW    = 'password123';

  if (emailIn.value.trim() === DEMO_EMAIL && pwIn.value === DEMO_PW) {
    alert('✅ Login successful! Welcome back.');
  } else {
    showLoginError('Incorrect email or password. Please try again.');
  }
});