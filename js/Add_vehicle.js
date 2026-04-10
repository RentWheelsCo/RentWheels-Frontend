// ── Vehicle Type Toggle ──
function switchType(type) {
  const carForm  = document.getElementById('carForm');
  const bikeForm = document.getElementById('bikeForm');
  const btnCar   = document.getElementById('btnCar');
  const btnBike  = document.getElementById('btnBike');

  if (type === 'car') {
    carForm.style.display  = 'flex';
    bikeForm.style.display = 'none';
    btnCar.classList.add('active');
    btnBike.classList.remove('active');
    // Re-trigger animation
    carForm.style.animation = 'none';
    carForm.offsetHeight;
    carForm.style.animation = '';
  } else {
    carForm.style.display  = 'none';
    bikeForm.style.display = 'flex';
    btnBike.classList.add('active');
    btnCar.classList.remove('active');
    bikeForm.style.animation = 'none';
    bikeForm.offsetHeight;
    bikeForm.style.animation = '';
  }
}

// ── Vehicle Photo Preview ──
function previewVehiclePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('vehiclePhotoPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ── Submit ──
function handleSubmit() {
  const activeForm = document.getElementById('carForm').style.display !== 'none'
    ? document.getElementById('carForm')
    : document.getElementById('bikeForm');

  const inputs = activeForm.querySelectorAll('input, textarea');
  let allFilled = true;

  inputs.forEach(input => {
    input.style.borderColor = '';
    if (!input.value.trim()) {
      input.style.borderColor = '#dc2626';
      allFilled = false;
    }
  });

  if (!allFilled) return;

  // success
}

// ── Modal Controls (identical to dashboard) ──
function openModal() {
  showMainOptions();
  document.getElementById('editProfileModal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('editProfileModal').style.display = 'none';
}
function showMainOptions() {
  document.getElementById('mainOptions').style.display = 'block';
  document.getElementById('photoEdit').style.display   = 'none';
  document.getElementById('licenseEdit').style.display = 'none';
}
function showPhotoEdit() {
  document.getElementById('mainOptions').style.display = 'none';
  document.getElementById('photoEdit').style.display   = 'block';
  document.getElementById('licenseEdit').style.display = 'none';
}
function showLicenseEdit() {
  document.getElementById('mainOptions').style.display  = 'none';
  document.getElementById('photoEdit').style.display    = 'none';
  document.getElementById('licenseEdit').style.display  = 'block';
}

function previewLicense(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('licensePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function saveLicense() {
  const licenseInput = document.getElementById('licenseNumber');
  const expiryInput  = document.getElementById('expiryDate');
  let valid = true;

  licenseInput.style.borderColor = '';
  expiryInput.style.borderColor  = '';
  licenseInput.style.color       = '';
  expiryInput.style.color        = '';

  if (!licenseInput.value.trim()) {
    licenseInput.style.borderColor = '#dc2626';
    licenseInput.style.color       = '#dc2626';
    licenseInput.placeholder       = 'License number is required';
    valid = false;
  }
  if (!expiryInput.value) {
    expiryInput.style.borderColor = '#dc2626';
    expiryInput.style.color       = '#dc2626';
    valid = false;
  }
  if (!valid) return;
  closeModal();
}

function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('photoPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function savePhoto() {
  const preview = document.getElementById('photoPreview');
  if (preview.src) {
    document.querySelector('.avatar img').src = preview.src;
  }
  closeModal();
}

// Close modal on backdrop click
document.getElementById('editProfileModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});