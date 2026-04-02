const form     = document.getElementById('loginForm');
const emailIn  = document.getElementById('email');
const pwIn     = document.getElementById('password');
const togglePw = document.getElementById('togglePw');
const eyeIcon  = document.getElementById('eyeIcon');
const loginErr = document.getElementById('loginError');

togglePw.style.display = 'none';

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
  } else {
    input.classList.add('invalid');
    if (input.value.trim().length > 0) {
      errEl.classList.add('show');
    }
  }
}

pwIn.addEventListener('input', () => {
  togglePw.style.display = pwIn.value.length > 0 ? 'block' : 'none';

  if (pwIn.value.length === 0) {
    pwIn.type = 'password';
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    pwIn.classList.remove('valid', 'invalid');
    document.getElementById('pw-err').classList.remove('show');
  }
});

emailIn.addEventListener('input', () => {
  if (emailIn.value.length === 0) {
    emailIn.classList.remove('valid', 'invalid');
    document.getElementById('email-err').classList.remove('show');
  }
});

togglePw.addEventListener('click', () => {
  const isText = pwIn.type === 'text';
  pwIn.type = isText ? 'password' : 'text';

  eyeIcon.innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loginErr.style.display = 'none';

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
    loginErr.style.display = 'block';
  }
});