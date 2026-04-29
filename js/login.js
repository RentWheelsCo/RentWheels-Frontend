const form     = document.getElementById('loginForm');
const emailIn  = document.getElementById('email');
const pwIn     = document.getElementById('password');
const togglePw = document.getElementById('togglePw');
<<<<<<< Updated upstream
const eyeIcon  = document.getElementById('eyeIcon');
=======
>>>>>>> Stashed changes
const loginErr = document.getElementById('loginError');

togglePw.innerHTML = '<img id="eyeIcon" src="../assets/eye.png" class="eye-icon" width="20" height="20" alt="show password">';
const eyeIcon = document.getElementById('eyeIcon');

// Hide eye button until user starts typing
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

<<<<<<< Updated upstream
=======
function clearFieldStates() {
  [emailIn, pwIn].forEach(input => input.classList.remove('valid', 'invalid'));
  ['email-err', 'email-ok', 'pw-err', 'pw-ok'].forEach(id => {
    document.getElementById(id)?.classList.remove('show');
  });
}

function setLoading(isLoading) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'Signing in…' : 'Sign In';
}

function showLoginError(message) {
  loginErr.textContent = message;
  loginErr.style.display = 'block';
}

function hideLoginError() {
  loginErr.style.display = 'none';
  loginErr.textContent = '';
}

>>>>>>> Stashed changes
pwIn.addEventListener('input', () => {
  if (pwIn.value.length > 0) {
    togglePw.style.display = 'block';
  } else {
    togglePw.style.display = 'none';
    pwIn.type = 'password';
    eyeIcon.src = '../assets/eye.png';
    eyeIcon.alt = 'show password';
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
  eyeIcon.src = isText ? '../assets/eye.png' : '../assets/eyeClose.png';
  eyeIcon.alt = isText ? 'show password' : 'hide password';
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