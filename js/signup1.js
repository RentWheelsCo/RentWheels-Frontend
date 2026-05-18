function triggerUpload(inputId) {
  document.getElementById(inputId).click();
}

function handleUpload(input, previewId, boxId) {
  const file = input.files[0];
  if (!file) return;

  const previewEl = document.getElementById(previewId);
  const boxEl = document.getElementById(boxId);

  boxEl.classList.remove("upload-error");
  const existingErr = boxEl.parentNode.querySelector(".error-msg");
  if (existingErr) existingErr.remove();

  boxEl.classList.add("uploaded");

  const reader = new FileReader();
  reader.onload = (e) => {
    previewEl.innerHTML = `
      <img class="upload-thumb" src="${e.target.result}" alt="Preview">
      <span class="upload-filename">${file.name}</span>
    `;
  };
  reader.readAsDataURL(file);
}

function showUploadError(boxEl, message) {
  boxEl.classList.add("upload-error");
  const err = document.createElement("span");
  err.className = "error-msg";
  err.textContent = message;
  boxEl.parentNode.appendChild(err);
}

function showPageError(message) {
  let banner = document.getElementById("page-error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "page-error-banner";
    banner.style.cssText =
      "background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;" +
      "border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:0.9rem;";
    const container =
      document.querySelector(".upload-section") ||
      document.body.firstElementChild;
    container.parentNode.insertBefore(banner, container);
  }
  banner.textContent = message;
  banner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearPageError() {
  const banner = document.getElementById("page-error-banner");
  if (banner) banner.remove();
}

async function submitSignup() {
  clearPageError();
  let hasError = false;

  const profileInput = document.getElementById("profileInput");
  const licenseFrontInput = document.getElementById("licenseInput");
  const licenseBackInput = document.getElementById("licenseBackInput");
  const profileBox = document.getElementById("profileBox");
  const licenseBox = document.getElementById("licenseBox");

  [profileBox, licenseBox].forEach((box) => {
    box.classList.remove("upload-error");
    const err = box.parentNode.querySelector(".error-msg");
    if (err) err.remove();
  });

  if (!profileInput.files.length) {
    showUploadError(profileBox, "Please upload your profile picture.");
    hasError = true;
  }

  if (!licenseFrontInput.files.length) {
    showUploadError(licenseBox, "Please upload your license image.");
    hasError = true;
  }

  if (hasError) return;

  const savedData = sessionStorage.getItem("signupData");
  if (!savedData) {
    alert("Session expired. Please start the sign-up again.");
    window.location.href = "signup.html";
    return;
  }

  const { name, email, phone, password } = JSON.parse(savedData);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("password", password);
  formData.append("profilePhoto", profileInput.files[0]);
  formData.append("licensePhoto", licenseFrontInput.files[0]);
  if (licenseBackInput && licenseBackInput.files.length) {
    formData.append("licensePhoto", licenseBackInput.files[0]);
  }

  const submitBtn = document.querySelector('button[onclick="submitSignup()"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
  }

  try {
    // COOKIE AUTH IMPLEMENTED
    await window.RW_API.auth.register(formData);
    sessionStorage.removeItem("signupData");
    sessionStorage.removeItem("signupError");

    alert("Sign up complete! Redirecting…");
    window.location.href = "dashboard.html";
  } catch (err) {
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      null;

    if (message) {
      showPageError(message);
      return;
    }

    console.error("Registration error:", err);
    showPageError("Network error. Please check your connection and try again.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  }
}

function goBack() {
  window.location.href = "signup.html";
}

function goToLogin() {
  window.location.href = "login.html";
}
