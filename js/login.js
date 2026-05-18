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
    eyeIcon.src = '../assets/eye.png';
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
  eyeIcon.src = isText ? '../assets/eye.png' : '../assets/eyeClose.png';
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
    // COOKIE AUTH IMPLEMENTED
    const payload = await window.RW_API.auth.login({
      email: emailIn.value.trim(),
      password: pwIn.value,
    });

    // Cache profile so the sidebar/header name + photo render instantly on the next page.
    const user = payload?.user || payload?.data?.user || null;
    if (user && user.id) {
      try { sessionStorage.setItem("rw_profile", JSON.stringify(user)); } catch {}
    }

    const role = payload?.user?.role || payload?.data?.user?.role || null;
    const nextHref = String(role || "").toLowerCase() === "admin" ? "admin_Dashboard.html" : "dashboard.html";

    // Use assign() to avoid being blocked by history state edge cases.
    window.location.assign(nextHref);
    // Fallback: if navigation is blocked for any reason, retry once.
    setTimeout(() => {
      try { window.location.assign(nextHref); } catch { /* ignore */ }
    }, 300);

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
    showLoginError(err?.message || 'Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});
