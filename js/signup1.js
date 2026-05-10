const API_BASE = window.RW_CONFIG?.API_BASE || "http://localhost:5000/api";

function triggerUpload(inputId) {
  document.getElementById(inputId).click();
}
function handleUpload(input, previewId, boxId) {
  const file = input.files[0];
  if (!file) return;
  const previewEl = document.getElementById(previewId);
  const boxEl = document.getElementById(boxId);
  boxEl.classList.remove('upload-error');
  const existingErr = boxEl.parentNode.querySelector('.error-msg');
  if (existingErr) existingErr.remove();
  boxEl.classList.add('uploaded');
  const reader = new FileReader();
  reader.onload = function (e) {
    previewEl.innerHTML = `
      <img class="upload-thumb" src="${e.target.result}" alt="Preview" 
           style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
      <span class="upload-filename" 
            style="display:block; font-size:12px; margin-top:8px; color: #374151; font-weight:600;">
        ${file.name}
      </span>
    `;
  };
  reader.readAsDataURL(file);
}
function submitSignup() {
  let hasError = false;
  const profileInput = document.getElementById('profileInput');
  const licenseInput = document.getElementById('licenseInput');
  const profileBox = document.getElementById('profileBox');
  const licenseBox = document.getElementById('licenseBox');
  [profileBox, licenseBox].forEach(box => {
    box.classList.remove('upload-error');
    const err = box.parentNode.querySelector('.error-msg');
    if (err) err.remove();
  });
  if (!profileInput.files.length) {
    showUploadError(profileBox, 'Please upload your profile picture.');
    hasError = true;
  }
  if (!licenseInput.files.length) {
    showUploadError(licenseBox, 'Please upload your license image.');
    hasError = true;
  }
  if (hasError) return;
  showSuccessPopup();
}
function showSuccessPopup() {
  const overlay = document.getElementById('signupSuccessOverlay');
  const countEl = document.getElementById('signupRedirectCount');
  const loginBtn = document.getElementById('goLoginBtn');
  let timeLeft = 5;
  overlay.classList.add('show');
  const performRedirect = () => {
    window.location.href = 'login.html';
  };
  const timer = setInterval(() => {
    timeLeft--;
    countEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      performRedirect();
    }
  }, 1000);
  loginBtn.onclick = function() {
    clearInterval(timer);
    performRedirect();
  };
}
function showUploadError(boxEl, message) {
  boxEl.classList.add('upload-error');
  const err = document.createElement('span');
  err.className = 'error-msg';
  err.style.color = '#EF4444';
  err.style.fontSize = '12px';
  err.style.display = 'block';
  err.style.marginTop = '5px';
  err.textContent = message;
  boxEl.parentNode.appendChild(err);
}
function goBack() {
  window.location.href = 'signup.html';
}
function goToLogin() {
  window.location.href = 'login.html';
}