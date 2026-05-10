const form = document.getElementById('loginForm');
const emailIn = document.getElementById('email');
const pwIn = document.getElementById('password');
const togglePw = document.getElementById('togglePw');
const eyeIcon = document.getElementById('eyeIcon');
const loginErr = document.getElementById('loginError');

togglePw.style.display = 'none';

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function validatePassword(val) {
  return val.length >= 1;
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

pwIn.addEventListener('input', () => {
  togglePw.style.display = pwIn.value.length > 0 ? 'block' : 'none';

  if (pwIn.value.length === 0) {
    pwIn.type = 'password';
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    pwIn.classList.remove('valid', 'invalid');
    document.getElementById('pw-err')?.classList.remove('show');
    document.getElementById('pw-ok')?.classList.remove('show');
  }

  hideLoginError();
});

emailIn.addEventListener('input', () => {
  if (emailIn.value.length === 0) {
    emailIn.classList.remove('valid', 'invalid');
    document.getElementById('email-err')?.classList.remove('show');
    document.getElementById('email-ok')?.classList.remove('show');
  }
  hideLoginError();
});

togglePw.addEventListener('click', () => {
  const isText = pwIn.type === 'text';
  pwIn.type = isText ? 'password' : 'text';

  eyeIcon.innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideLoginError();

  const emailOk = validateEmail(emailIn.value);
  const pwOk = validatePassword(pwIn.value);

  setFieldState(emailIn, document.getElementById('email-err'), document.getElementById('email-ok'), emailOk);
  setFieldState(pwIn, document.getElementById('pw-err'), document.getElementById('pw-ok'), pwOk);

  if (!emailOk || !pwOk) return;

  setLoading(true);

  try {
    const data = await window.RW_API.request('/auth/login', {
      method: 'POST',
      body: {
        email: emailIn.value.trim(),
        password: pwIn.value,
      },
    });

    const { token, id, name, email, isVerified } = data?.data || {};
    if (!token) {
      showLoginError("Login succeeded but token is missing. Please try again.");
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify({ id, name, email, isVerified }));

    window.location.href = 'dashboard.html';

  } catch (err) {
    const raw = (err?.data && typeof err.data === 'object' ? err.data.message : '') || '';

    if (raw) {
      if (raw.toLowerCase().includes('google')) {
        showLoginError('This account uses Google Sign-In. Please use the "Continue with Google" option.');
      } else if (
        raw.toLowerCase().includes('invalid') ||
        raw.toLowerCase().includes('credentials') ||
        raw.toLowerCase().includes('password')
      ) {
        showLoginError('Invalid email or password. Please try again.');
        clearFieldStates();
        emailIn.classList.add('invalid');
        pwIn.classList.add('invalid');
      } else {
        showLoginError(raw || 'Login failed. Please try again.');
      }
      return;
    }
    console.error('Login error:', err);
    showLoginError('Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});