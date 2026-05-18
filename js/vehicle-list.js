(function () {
  const currentUserId = Number(
    (function () {
      try {
        return JSON.parse(sessionStorage.getItem("rw_profile") || "null")?.id;
      } catch {
        return null;
      }
    })()
  );

  function parseSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const pickup = params.get("pickup");
    const ret = params.get("return");
    return {
      pickupDate: pickup || undefined,
      returnDate: ret || undefined,
    };
  }

  function setSpecText(specEl, text) {
    if (!specEl) return;
    const svg = specEl.querySelector("svg");
    specEl.innerHTML = "";
    if (svg) specEl.appendChild(svg);
    specEl.append(` ${text}`);
  }

  function buildCardFromTemplate(templateEl, vehicle) {
    const card = templateEl.cloneNode(true);
    card.dataset.id = String(vehicle.id);

    const availableBadge = card.querySelector(".badge--available");
    const priceBadge = card.querySelector(".badge--price");
    const img = card.querySelector(".vehicle-card__img");
    const nameEl = card.querySelector(".vehicle-card__name");
    const typeEl = card.querySelector(".vehicle-card__type");
    const specs = card.querySelectorAll(".vehicle-card__specs .spec");

    const isMine = Number(vehicle?.ownerId) === currentUserId || Number(vehicle?.owner?.id) === currentUserId;
    const availability = String(vehicle.availabilityStatus || "").toUpperCase();
    const isAvailable = availability === "AVAILABLE" || vehicle.isAvailable === true;
    if (availableBadge) availableBadge.textContent = isMine ? "My Vehicle" : (isAvailable ? "Available Now" : "Not Available");
    if (priceBadge) priceBadge.textContent = `Rs${Number(vehicle.dailyPrice || 0)}/day`;

    const photo = Array.isArray(vehicle.photos) && vehicle.photos.length ? vehicle.photos[0] : null;
    if (img) img.src = photo || "https://placehold.co/640x420/e5e7eb/9ca3af?text=No+Image";
    if (img) img.alt = vehicle.name || "Vehicle";

    if (nameEl) nameEl.textContent = vehicle.name || "Vehicle";
    if (typeEl) typeEl.textContent = vehicle.type?.value || vehicle.category?.value || "";

    if (specs[0]) setSpecText(specs[0], `${vehicle.seatingCapacity || ""} Seats`.trim());
    if (specs[1]) setSpecText(specs[1], vehicle.fuelType?.value || "");
    if (specs[2]) setSpecText(specs[2], vehicle.transmission?.value || "");
    if (specs[3]) setSpecText(specs[3], vehicle.location?.value || "");

    return card;
  }

  async function loadVehicles() {
    const grid = document.getElementById("carsGrid");
    if (!grid) return;

    const template = grid.querySelector(".vehicle-card");
    const query = parseSearchParams();

    try {
      const payload = await window.RW_API.request("/vehicles", {
        params: {
          limit: 50,
          pickupDate: query.pickupDate,
          returnDate: query.returnDate,
        },
      });

      const vehicles = Array.isArray(payload?.data?.vehicles) ? payload.data.vehicles : [];
      if (!vehicles.length || !template) return;

      grid.innerHTML = "";
      vehicles.forEach((v) => {
        const card = buildCardFromTemplate(template, v);
        grid.appendChild(card);
      });
    } catch (err) {
      console.error("Vehicle list load error:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadVehicles);
})();
