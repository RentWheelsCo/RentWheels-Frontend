function triggerUpload(inputId) {
  document.getElementById(inputId).click();
}

function handleUpload(input, previewId, boxId) {
  const file = input.files[0];
  if (!file) return;

  const previewEl = document.getElementById(previewId);
  const boxEl     = document.getElementById(boxId);

  boxEl.classList.remove('upload-error');
  const existingErr = boxEl.parentNode.querySelector('.error-msg');
  if (existingErr) existingErr.remove();

  boxEl.classList.add('uploaded');

  const reader = new FileReader();
  reader.onload = function (e) {
    previewEl.innerHTML = `
      <img class="upload-thumb" src="${e.target.result}" alt="Preview">
      <span class="upload-filename"> ${file.name}</span>
    `;
  };
  reader.readAsDataURL(file);
}

function submitSignup() {
  let hasError = false;

  const profileInput = document.getElementById('profileInput');
  const licenseInput = document.getElementById('licenseInput');
  const profileBox   = document.getElementById('profileBox');
  const licenseBox   = document.getElementById('licenseBox');

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

  alert('Sign up complete! Redirecting...');
  // window.location.href = 'login.html';
}

function showUploadError(boxEl, message) {
  boxEl.classList.add('upload-error');
  const err = document.createElement('span');
  err.className = 'error-msg';
  err.textContent = message;
  boxEl.parentNode.appendChild(err);
}

function goBack() {
  window.location.href = 'signup.html';
}

function goToLogin() {
  // Replace with actual navigation
  alert('Redirecting to login page...');
}