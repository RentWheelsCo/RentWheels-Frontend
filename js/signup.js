let currentPage = 0;

const takenUsernames = ["admin", "user123", "john_doe"];

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

  const err = document.createElement('span');
  err.className = 'error-msg';
  err.textContent = message;
  inputEl.parentNode.appendChild(err);
}

function attachLiveClearing() {
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const existing = input.parentNode.querySelector('.error-msg');
      if (existing) existing.remove();
    });
  });
}

function nextPage() {
  clearErrors();

  const usernameEl  = document.getElementById('username');
  const emailEl     = document.getElementById('email');
  const phoneEl     = document.getElementById('phone');
  const passwordEl  = document.getElementById('npassword');
  const confirmEl   = document.getElementById('cpassword');

  const username        = usernameEl.value.trim();
  const email           = emailEl.value.trim();
  const phone           = phoneEl.value.trim();
  const password        = passwordEl.value;
  const confirmPassword = confirmEl.value;

  let hasError = false;

  if (!username) {
    showError(usernameEl, '');
    hasError = true;
  } else if (takenUsernames.includes(username.toLowerCase())) {
    showError(usernameEl, 'This username is already taken. Please choose another.');
    hasError = true;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    showError(emailEl, '');
    hasError = true;
  } else if (!emailPattern.test(email)) {
    showError(emailEl, 'Please enter a valid email address (e.g. you@example.com).');
    hasError = true;
  }

  const phonePattern = /^[0-9]{10}$/;
  if (!phone) {
    showError(phoneEl, '');
    hasError = true;
  } else if (!/^[0-9]+$/.test(phone)) {
    showError(phoneEl, 'Phone number must contain digits only.');
    hasError = true;
  } else if (!phonePattern.test(phone)) {
    showError(phoneEl, 'Phone number must be exactly 10 digits.');
    hasError = true;
  }

  if (!password) {
    showError(passwordEl, '');
    hasError = true;
  } else if (password.length < 6) {
    showError(passwordEl, 'Password must be at least 6 characters long.');
    hasError = true;
  }

  if (!confirmPassword) {
    showError(confirmEl, '');
    hasError = true;
  } else if (password && confirmPassword !== password) {
    showError(confirmEl, 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  setPage(1);
  window.location.href = 'signup1.html';
}

function goToLogin() {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', attachLiveClearing); 

