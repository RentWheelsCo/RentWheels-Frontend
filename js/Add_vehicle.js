function logout() {
  window.RW_API?.auth?.logout?.().catch(() => {});
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "login.html";
}

function bindLogout() {
  const logoutLink = document.getElementById("rw-sidebar-logout");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

function setProfileName() {
  const el = document.querySelector(".profile-name");
  if (!el) return;
  window.RW_API?.auth?.profile?.()
    .then((p) => { if (p?.data?.name) el.textContent = p.data.name; })
    .catch(() => {});
}

function showPageError(message) {
  let banner = document.getElementById("page-error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "page-error-banner";
    banner.style.cssText =
      "background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;" +
      "border-radius:8px;padding:10px 14px;margin:0 0 14px 0;font-size:0.9rem;";
    const container = document.querySelector(".main-content");
    container.insertBefore(banner, container.firstChild?.nextSibling || container.firstChild);
  }
  banner.textContent = message;
  banner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearPageError() {
  const banner = document.getElementById("page-error-banner");
  if (banner) banner.remove();
}

function setLoading(isLoading) {
  const btn = document.querySelector(".submit-btn");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? "0.75" : "1";
  btn.style.cursor = isLoading ? "not-allowed" : "pointer";
}

function markInvalid(el, isInvalid) {
  if (!el) return;
  el.style.borderColor = isInvalid ? "#dc2626" : "";
}

// €€ Vehicle Photo Preview €€
function previewVehiclePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById("vehiclePhotoPreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

async function fetchOptions(type, parentId) {
  const payload = await window.RW_API.request("/vehicles/options", {
    params: {
      type,
      limit: 50,
      parentId: parentId ? String(parentId) : undefined,
    },
  });
  return payload?.data?.options || [];
}

function fillSelect(selectEl, options, placeholder) {
  const safePlaceholder = placeholder || "Select";
  selectEl.innerHTML = `<option value="">${safePlaceholder}</option>`;
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = String(opt.id);
    o.textContent = opt.value;
    selectEl.appendChild(o);
  });
}

async function initVehicleDropdowns() {
  const typeSelect = document.getElementById("typeId");
  const brandSelect = document.getElementById("brandId");
  const modelSelect = document.getElementById("modelId");
  const categorySelect = document.getElementById("categoryId");
  const transmissionSelect = document.getElementById("transmissionId");
  const fuelTypeSelect = document.getElementById("fuelTypeId");
  const locationSelect = document.getElementById("locationId");

  const [types, brands, categories, transmissions, fuelTypes, locations] = await Promise.all([
    fetchOptions("VEHICLE_TYPE"),
    fetchOptions("BRAND"),
    fetchOptions("CATEGORY"),
    fetchOptions("TRANSMISSION"),
    fetchOptions("FUEL_TYPE"),
    fetchOptions("LOCATION"),
  ]);

  fillSelect(typeSelect, types, "Select vehicle type");
  fillSelect(brandSelect, brands, "Select brand");
  fillSelect(categorySelect, categories, "Select category");
  fillSelect(transmissionSelect, transmissions, "Select transmission");
  fillSelect(fuelTypeSelect, fuelTypes, "Select fuel type");
  fillSelect(locationSelect, locations, "Select location");

  modelSelect.disabled = true;
  modelSelect.innerHTML = `<option value="">Select model</option>`;

  brandSelect.addEventListener("change", async () => {
    clearPageError();
    modelSelect.disabled = true;
    modelSelect.innerHTML = `<option value="">Loading models...</option>`;

    const brandId = Number(brandSelect.value);
    if (!brandId) {
      modelSelect.innerHTML = `<option value="">Select model</option>`;
      return;
    }

    try {
      const models = await fetchOptions("MODEL", brandId);
      fillSelect(modelSelect, models, "Select model");
      modelSelect.disabled = false;
    } catch (e) {
      modelSelect.innerHTML = `<option value="">Select model</option>`;
      showPageError(e?.message || "Failed to load models.");
    }
  });
}

// €€ Submit €€
async function handleSubmit() {
  clearPageError();
  // COOKIE AUTH IMPLEMENTED: dashboard is protected by 401 redirect in api.js

  const typeId = document.getElementById("typeId");
  const brandId = document.getElementById("brandId");
  const modelId = document.getElementById("modelId");
  const categoryId = document.getElementById("categoryId");
  const transmissionId = document.getElementById("transmissionId");
  const fuelTypeId = document.getElementById("fuelTypeId");
  const locationId = document.getElementById("locationId");
  const year = document.getElementById("year");
  const dailyPrice = document.getElementById("dailyPrice");
  const seatingCapacity = document.getElementById("seatingCapacity");
  const description = document.getElementById("description");
  const photosInput = document.getElementById("vehiclePhotos");

  const requiredFields = [
    typeId,
    brandId,
    modelId,
    categoryId,
    transmissionId,
    fuelTypeId,
    locationId,
    year,
    dailyPrice,
    seatingCapacity,
  ];

  let hasError = false;
  requiredFields.forEach((el) => {
    markInvalid(el, false);
    if (!String(el.value || "").trim()) {
      markInvalid(el, true);
      hasError = true;
    }
  });

  if (!photosInput?.files?.length) {
    showPageError("Please upload at least one vehicle photo.");
    return;
  }

  if (hasError) {
    showPageError("Please fill all required fields.");
    return;
  }

  const fd = new FormData();
  fd.append("typeId", typeId.value);
  fd.append("brandId", brandId.value);
  fd.append("modelId", modelId.value);
  fd.append("categoryId", categoryId.value);
  fd.append("transmissionId", transmissionId.value);
  fd.append("fuelTypeId", fuelTypeId.value);
  fd.append("locationId", locationId.value);
  fd.append("year", year.value);
  fd.append("dailyPrice", dailyPrice.value);
  fd.append("seatingCapacity", seatingCapacity.value);
  if (description?.value?.trim()) fd.append("description", description.value.trim());

  Array.from(photosInput.files).forEach((file) => {
    fd.append("vehiclePhotos", file);
  });

  setLoading(true);
  try {
    await window.RW_API.request("/vehicles", {
      method: "POST",
      body: fd,
    });

    alert("Vehicle listed successfully!");
    window.location.href = "Manage_vehicle.html";
  } catch (e) {
    console.error("Add vehicle error:", e);
    showPageError(e?.message || "Failed to list vehicle.");
  } finally {
    setLoading(false);
  }
}

// €€ Modal Controls (identical to dashboard) €€
function openModal() {
  showMainOptions();
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("editProfileModal").style.display = "none";
}
function showMainOptions() {
  document.getElementById("mainOptions").style.display = "block";
  document.getElementById("photoEdit").style.display = "none";
  document.getElementById("licenseEdit").style.display = "none";
}
function showPhotoEdit() {
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display = "block";
  document.getElementById("licenseEdit").style.display = "none";
}
function showLicenseEdit() {
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display = "none";
  document.getElementById("licenseEdit").style.display = "block";
}

function previewLicense(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById("licensePreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function saveLicense() {
  const licenseInput = document.getElementById("licenseNumber");
  const expiryInput = document.getElementById("expiryDate");
  let valid = true;

  licenseInput.style.borderColor = "";
  expiryInput.style.borderColor = "";
  licenseInput.style.color = "";
  expiryInput.style.color = "";

  if (!licenseInput.value.trim()) {
    licenseInput.style.borderColor = "#dc2626";
    licenseInput.style.color = "#dc2626";
    licenseInput.placeholder = "License number is required";
    valid = false;
  }
  if (!expiryInput.value) {
    expiryInput.style.borderColor = "#dc2626";
    expiryInput.style.color = "#dc2626";
    valid = false;
  }
  if (!valid) return;
  closeModal();
}

function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById("photoPreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function savePhoto() {
  const preview = document.getElementById("photoPreview");
  if (preview.src) {
    document.querySelector(".avatar img").src = preview.src;
  }
  closeModal();
}

document.addEventListener("DOMContentLoaded", () => {
  // COOKIE AUTH IMPLEMENTED: protected by 401 redirect in api.js
  bindLogout();
  setProfileName();

  initVehicleDropdowns().catch((e) => {
    console.error("Dropdown init error:", e);
    showPageError(e?.message || "Failed to load dropdown options.");
  });

  const modal = document.getElementById("editProfileModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  }
});