document.addEventListener('DOMContentLoaded', () => {
  // Local fallback asset to keep UI consistent if vehicle photo is missing.
  const VEHICLE_PLACEHOLDER = "../assets/carGrey.png";

  const currentUserId = Number(
    (function () {
      try {
        return JSON.parse(sessionStorage.getItem("rw_profile") || "null")?.id;
      } catch {
        return null;
      }
    })()
  );
  const params = new URLSearchParams(window.location.search);
  const carsOnlyView = params.get('view') === 'cars';
  const bikesOnlyView = params.get('view') === 'bikes';
  const isVehiclePage = document.body?.dataset?.page === 'vehicle';

  const featuredSection = document.getElementById('featured');
  if (featuredSection) {
    featuredSection.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const card = e.target.closest('.vehicle-card');
      if (!card || !featuredSection.contains(card)) return;
      const vehicleId = card.dataset.id;
      if (!vehicleId) return;
      const fromCars = document.body.classList.contains('cars-only-view');
      const fromBikes = document.body.classList.contains('bikes-only-view');
      const fromParam = fromCars ? '&from=cars' : fromBikes ? '&from=bikes' : '';
      window.location.href = `./vehicle-detail.html?id=${encodeURIComponent(vehicleId)}${fromParam}`;
    });
  }

  function renderVehicleSkeletons(container, count = 3) {
    if (!container) return;
    container.innerHTML = '';

    // If the page already has real cards, clone layout; otherwise build a minimal skeleton.
    const template = container.querySelector('.vehicle-card');
    if (template) {
      const tempClone = template.cloneNode(true);
      // remove template content and replace with skeleton blocks
      const imgWrap = tempClone.querySelector('.vehicle-card__img-wrap');
      const img = tempClone.querySelector('.vehicle-card__img');
      const body = tempClone.querySelector('.vehicle-card__body');

      if (imgWrap) {
        imgWrap.innerHTML = '';
        imgWrap.style.background = '#f3f4f6';
      }
      if (img) img.style.display = 'none';

      const badgeAvail = tempClone.querySelector('.badge--available');
      const badgePrice = tempClone.querySelector('.badge--price');
      if (badgeAvail) badgeAvail.textContent = '';
      if (badgePrice) badgePrice.textContent = '';

      if (body) {
        body.innerHTML = `
          <div class="rw-skeleton rw-skeleton--block" style="height:14px; width:70%; margin: 8px 0 10px; border-radius:10px"></div>
          <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:45%; margin: 0 0 14px; border-radius:999px"></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap: 8px 0;">
            <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:85%; border-radius:999px"></div>
            <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:85%; border-radius:999px"></div>
            <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:85%; border-radius:999px"></div>
            <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:85%; border-radius:999px"></div>
          </div>
        `;
      }

      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const c = tempClone.cloneNode(true);
        c.removeAttribute('data-id');
        c.style.cursor = 'default';
        c.setAttribute('aria-hidden', 'true');
        container.appendChild(c);
      }
      return;
    }

    // Fallback: simple grey rectangles
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'rw-skeleton';
      sk.style.height = '220px';
      sk.style.borderRadius = '14px';
      container.appendChild(sk);
    }
  }

  function renderRecSkeletons(container, count = 6) {
    if (!container) return;
    container.innerHTML = '';
    const template = container.querySelector('.rec-card');
    if (!template) {
      const wrap = document.createElement('div');
      wrap.textContent = 'Loading recommendations…';
      container.appendChild(wrap);
      return;
    }

    const tempClone = template.cloneNode(true);
    tempClone.querySelector('.rec-card__img-wrap')?.setAttribute('style', 'background:#f3f4f6;');
    tempClone.querySelectorAll('img, .rec-price, .rec-card__title-row, .rec-card__type, .rec-spec-pill, .rec-btn').forEach(el => {
      if (el) el.style.display = 'none';
    });

    const body = tempClone.querySelector('.rec-card__body');
    if (body) {
      body.innerHTML = `
        <div class="rw-skeleton rw-skeleton--block" style="height:14px; width:65%; margin: 8px 0 10px; border-radius:10px"></div>
        <div class="rw-skeleton rw-skeleton--block" style="height:10px; width:85%; margin: 0 0 14px; border-radius:999px"></div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          <div class="rw-skeleton rw-skeleton--block" style="height:24px; width:70px; border-radius:999px"></div>
          <div class="rw-skeleton rw-skeleton--block" style="height:24px; width:70px; border-radius:999px"></div>
          <div class="rw-skeleton rw-skeleton--block" style="height:24px; width:70px; border-radius:999px"></div>
        </div>
        <div class="rw-skeleton rw-skeleton--block" style="height:38px; width:100%; margin-top:16px; border-radius:12px"></div>
      `;
    }

    for (let i = 0; i < count; i++) {
      const c = tempClone.cloneNode(true);
      c.removeAttribute('data-id');
      c.setAttribute('aria-hidden', 'true');
      c.style.cursor = 'default';
      container.appendChild(c);
    }
  }

  function setSpecText(specEl, text) {
    if (!specEl) return;
    const svg = specEl.querySelector("svg");
    specEl.innerHTML = "";
    if (svg) specEl.appendChild(svg);
    specEl.append(` ${text}`);
  }

  function isBike(vehicle) {
    const t = String(vehicle?.type?.value || "").toLowerCase();
    const c = String(vehicle?.category?.value || "").toLowerCase();
    const name = String(vehicle?.name || "").toLowerCase();
    return (
      t.includes("bike") ||
      t.includes("motor") ||
      c.includes("bike") ||
      c.includes("motor") ||
      name.includes("bike")
    );
  }

  function fillVehicleCard(card, vehicle) {
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
    if (img) img.src = photo || VEHICLE_PLACEHOLDER;
    if (img) img.alt = vehicle.name || "Vehicle";

    if (nameEl) nameEl.textContent = vehicle.name || "Vehicle";
    if (typeEl) typeEl.textContent = vehicle.type?.value || vehicle.category?.value || "";

    if (specs[0]) setSpecText(specs[0], `${vehicle.seatingCapacity || ""} Seats`.trim());
    if (specs[1]) setSpecText(specs[1], vehicle.fuelType?.value || "");
    if (specs[2]) setSpecText(specs[2], vehicle.transmission?.value || "");
    if (specs[3]) setSpecText(specs[3], vehicle.location?.value || "");
  }

  async function loadHomeVehicles() {
    const carsGrid = document.getElementById("carsGrid");
    const bikesGrid = document.getElementById("bikesGrid");
    if (!carsGrid || !bikesGrid) return;

    const carTemplate = carsGrid.querySelector(".vehicle-card");
    const bikeTemplate = bikesGrid.querySelector(".vehicle-card");
    if (!carTemplate || !bikeTemplate) return;

    // Grey skeleton placeholders while API loads
    function renderVehicleSkeletons(gridEl, count = 3) {
      if (!gridEl) return;
      const tpl = document.createElement('div');
      tpl.innerHTML = `
        <div class="rw-vehicle-skel">
          <div class="rw-vehicle-skel__img"></div>
          <div class="rw-vehicle-skel__body">
            <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__title"></div>
            <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__type"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 10px;">
              <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__spec"></div>
              <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__spec"></div>
              <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__spec"></div>
              <div class="rw-skeleton rw-skeleton--block rw-vehicle-skel__spec"></div>
            </div>
          </div>
        </div>`;

      const card = tpl.firstElementChild;
      gridEl.innerHTML = '';
      Array.from({ length: count }).forEach(() => {
        gridEl.appendChild(card.cloneNode(true));
      });
    }

    // Grey skeleton placeholders while API loads
    renderVehicleSkeletons(carsGrid, 3);
    renderVehicleSkeletons(bikesGrid, 3);

    try {
      const payload = await window.RW_API.vehicles.getAll({ limit: 60 });
      const vehicles = Array.isArray(payload?.data?.vehicles) ? payload.data.vehicles : [];

      const bikes = vehicles.filter(isBike).slice(0, 3);
      const cars = vehicles.filter((v) => !isBike(v)).slice(0, 3);

      carsGrid.innerHTML = "";
      cars.forEach((v) => {
        const card = carTemplate.cloneNode(true);
        fillVehicleCard(card, v);
        carsGrid.appendChild(card);
      });
      bikesGrid.innerHTML = "";
      bikes.forEach((v) => {
        const card = bikeTemplate.cloneNode(true);
        fillVehicleCard(card, v);
        bikesGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Home vehicles load error:", err);
      carsGrid.innerHTML = `<div style="color:#b91c1c;font-size:13px;">Failed to load vehicles.</div>`;
      bikesGrid.innerHTML = `<div style="color:#b91c1c;font-size:13px;">Failed to load vehicles.</div>`;
    }
  }

  function fillRecCard(card, vehicle) {
    card.dataset.id = String(vehicle.id);
    const price = card.querySelector(".rec-price");
    const img = card.querySelector(".rec-card__img");
    const nameEl = card.querySelector(".rec-card__name");
    const typeEl = card.querySelector(".rec-card__type");
    const pills = card.querySelectorAll(".rec-spec-pill");
    const link = card.querySelector("a.rec-btn");

    if (price) price.textContent = `Rs${Number(vehicle.dailyPrice || 0)}/day`;
    const photo = Array.isArray(vehicle.photos) && vehicle.photos.length ? vehicle.photos[0] : null;
    if (img) img.src = photo || VEHICLE_PLACEHOLDER;
    if (img) img.alt = vehicle.name || "Vehicle";
    if (nameEl) nameEl.textContent = vehicle.name || "Vehicle";
    if (typeEl) {
      const t = vehicle.type?.value || vehicle.category?.value || "";
      const loc = vehicle.location?.value || "";
      typeEl.textContent = [t, loc].filter(Boolean).join(" · ");
    }
    if (pills[0]) pills[0].textContent = `${vehicle.seatingCapacity || ""} Seats`.trim();
    if (pills[1]) pills[1].textContent = vehicle.fuelType?.value || "";
    if (pills[2]) pills[2].textContent = vehicle.transmission?.value || "";
    if (link) link.href = `../html/vehicle-detail.html?id=${encodeURIComponent(vehicle.id)}`;
  }

  async function loadRecommendations() {
    const recCarousel = document.getElementById("recCarousel");
    if (!recCarousel) return;
    const template = recCarousel.querySelector(".rec-card");
    if (!template) return;

    // Grey skeleton placeholders while API loads
    recCarousel.innerHTML = Array.from({ length: 6 }).map(() => `
      <div class="rw-rec-skel">
        <div class="rw-rec-skel__img-wrap">
          <div class="rw-skeleton rw-skeleton--img"></div>
        </div>
        <div class="rw-rec-skel__body">
          <div class="rw-skeleton rw-skeleton--block rw-rec-skel__title"></div>
          <div class="rw-skeleton rw-skeleton--block rw-rec-skel__type"></div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <div class="rw-skeleton rw-skeleton--block rw-rec-skel__pill"></div>
            <div class="rw-skeleton rw-skeleton--block rw-rec-skel__pill"></div>
            <div class="rw-skeleton rw-skeleton--block rw-rec-skel__pill"></div>
          </div>
          <div class="rw-skeleton rw-skeleton--block" style="height:36px;margin-top:16px;"></div>
        </div>
      </div>
    `).join('');
    try {
      const payload = await window.RW_API.request("/recommendations/vehicles", { params: { limit: 8 } });
      const recs = Array.isArray(payload?.data?.vehicles) ? payload.data.vehicles : [];
      if (!recs.length) {
        const fallback = await window.RW_API.vehicles.getAll({ limit: 8 });
        const vehicles = Array.isArray(fallback?.data?.vehicles) ? fallback.data.vehicles : [];
        recCarousel.innerHTML = "";
        vehicles.slice(0, 6).forEach((v) => {
          const card = template.cloneNode(true);
          fillRecCard(card, v);
          recCarousel.appendChild(card);
        });
        return;
      }

      recCarousel.innerHTML = "";
      recs.slice(0, 6).forEach((v) => {
        const card = template.cloneNode(true);
        fillRecCard(card, v);
        recCarousel.appendChild(card);
      });
    } catch (err) {
      console.error("Recommendations load error:", err);
      recCarousel.innerHTML = `<div style="color:#b91c1c;font-size:13px;padding:10px 2px;">Failed to load recommendations.</div>`;
    }
  }
  /* ── Hero search widget (hs-* IDs) ─────────────────────── */
  const hsState = {
    insurance: "",
    pickupDate: null,
    returnDate: null,
    activeCalendar: null,
    calDate: new Date(),
  };

  const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  function fmtDate(d) {
    if (!d) return "";

    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }

  function todayDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function sameDay(a, b) {
    return (
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /* ── Insurance dropdown ───────────────────────────── */

  const insBtn = document.getElementById("hs-insuranceBtn");
  const insValue = document.getElementById("hs-insuranceValue");
  const insDrop = document.getElementById("hs-insuranceDropdown");

  if (insBtn && insDrop) {
    insBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const open = insDrop.classList.toggle("open");

      insBtn.setAttribute("aria-expanded", String(open));

      closeHsCal();
    });

    insDrop.querySelectorAll(".hs-dropdown__item").forEach((item) => {
      item.addEventListener("click", () => {

        hsState.insurance = item.dataset.value;

        insValue.textContent = item.textContent;

        insDrop
          .querySelectorAll(".hs-dropdown__item")
          .forEach(i => i.classList.toggle("selected", i === item));

        insDrop.classList.remove("open");

        insBtn.setAttribute("aria-expanded", "false");

        document
          .getElementById("hs-insuranceField")
          ?.classList.remove("has-error");
      });
    });
  }

  /* ── Calendar popup ───────────────────────────────── */

  const calPopup = document.getElementById("hs-calPopup");
  const calDaysEl = document.getElementById("hs-calDays");
  const calMonthEl = document.getElementById("hs-calMonthYear");

  function openHsCal(type) {

    if (!calPopup) return;

    hsState.activeCalendar = type;

    const existing =
      type === "pickup"
        ? hsState.pickupDate
        : hsState.returnDate;

    hsState.calDate = existing
      ? new Date(existing)
      : new Date();

    hsState.calDate.setDate(1);

    renderHsCal();

    calPopup.style.display = "block";

    insDrop?.classList.remove("open");
  }

  function closeHsCal() {
    if (calPopup) {
      calPopup.style.display = "none";
    }

    hsState.activeCalendar = null;
  }

  function renderHsCal() {

    if (!calDaysEl || !calMonthEl) return;

    const year = hsState.calDate.getFullYear();
    const month = hsState.calDate.getMonth();

    calMonthEl.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth =
      new Date(year, month + 1, 0).getDate();

    const today = todayDate();

    let minDate = today;

    if (
      hsState.activeCalendar === "return" &&
      hsState.pickupDate
    ) {
      minDate = new Date(hsState.pickupDate);

      minDate.setDate(minDate.getDate() + 1);
    }

    calDaysEl.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
      const b = document.createElement("button");

      b.className = "hs-cal-day empty";

      b.disabled = true;

      calDaysEl.appendChild(b);
    }

    for (let d = 1; d <= daysInMonth; d++) {

      const dayDate = new Date(year, month, d);

      const b = document.createElement("button");

      b.className = "hs-cal-day";

      b.textContent = d;

      if (
        dayDate < minDate &&
        !sameDay(dayDate, minDate)
      ) {
        b.classList.add("past");

        b.disabled = true;

      } else {

        if (sameDay(dayDate, today)) {
          b.classList.add("today");
        }

        const selDate =
          hsState.activeCalendar === "pickup"
            ? hsState.pickupDate
            : hsState.returnDate;

        if (sameDay(dayDate, selDate)) {
          b.classList.add("selected");
        }

        b.addEventListener("click", () => {

          if (hsState.activeCalendar === "pickup") {

            hsState.pickupDate = dayDate;

            const inp =
              document.getElementById("hs-pickupDate");

            if (inp) {
              inp.value = fmtDate(dayDate);
            }

            if (
              hsState.returnDate &&
              hsState.returnDate <= dayDate
            ) {
              hsState.returnDate = null;

              const r =
                document.getElementById("hs-returnDate");

              if (r) r.value = "";
            }

          } else {

            hsState.returnDate = dayDate;

            const inp =
              document.getElementById("hs-returnDate");

            if (inp) {
              inp.value = fmtDate(dayDate);
            }
          }

          closeHsCal();
        });
      }

      calDaysEl.appendChild(b);
    }
  }

  /* ── Month navigation ─────────────────────────────── */

  document.getElementById("hs-prevMonth")
    ?.addEventListener("click", () => {

      hsState.calDate.setMonth(
        hsState.calDate.getMonth() - 1
      );

      renderHsCal();
    });

  document.getElementById("hs-nextMonth")
    ?.addEventListener("click", () => {

      hsState.calDate.setMonth(
        hsState.calDate.getMonth() + 1
      );

      renderHsCal();
    });

  /* ── Open pickup calendar ─────────────────────────── */

  ["hs-pickupDate", "hs-pickupCalBtn"].forEach(id => {

    document.getElementById(id)
      ?.addEventListener("click", (e) => {

        e.stopPropagation();

        openHsCal("pickup");
      });
  });

  /* ── Open return calendar ─────────────────────────── */

  ["hs-returnDate", "hs-returnCalBtn"].forEach(id => {

    document.getElementById(id)
      ?.addEventListener("click", (e) => {

        e.stopPropagation();

        openHsCal("return");
      });
  });

  /* ── Close dropdown/calendar on outside click ────── */

  document.addEventListener("click", (e) => {

    const search =
      document.getElementById("heroSearch");

    if (
      search &&
      !search.contains(e.target)
    ) {
      closeHsCal();

      insDrop?.classList.remove("open");
    }
  });

  /* ── Search button action ─────────────────────────── */

  document.getElementById("hs-searchBtn")
    ?.addEventListener("click", () => {

      closeHsCal();

      insDrop?.classList.remove("open");

      const params = new URLSearchParams();

      if (hsState.insurance) {
        params.set("insurance", hsState.insurance);
      }

      if (hsState.pickupDate) {
        params.set(
          "pickup",
          fmtDate(hsState.pickupDate)
        );
      }

      if (hsState.returnDate) {
        params.set(
          "return",
          fmtDate(hsState.returnDate)
        );
      }

      window.location.href =
        `../html/vehicle.html?${params.toString()}`;
    });

  const exploreCars = document.getElementById('exploreCars');
  const exploreBikes = document.getElementById('exploreBikes');

  if (exploreCars) {
    exploreCars.addEventListener('click', () => { });
  }

  if (exploreBikes) {
    exploreBikes.addEventListener('click', () => { });
  }

  if (carsOnlyView && isVehiclePage && document.getElementById('carsGrid')) {
    document.body.classList.add('cars-only-view');
  }
  /* ── Recommendations carousel ────────────────────────────── */

  const recCarousel = document.getElementById("recCarousel");
  const recPrev = document.getElementById("recPrev");
  const recNext = document.getElementById("recNext");

  if (recCarousel && recPrev && recNext) {

    const SCROLL_AMT = 292;

    function updateRecArrows() {

      const atStart =
        recCarousel.scrollLeft <= 4;

      const atEnd =
        recCarousel.scrollLeft >=
        recCarousel.scrollWidth -
        recCarousel.clientWidth - 4;

      recPrev.style.opacity =
        atStart ? "0.38" : "1";

      recPrev.style.pointerEvents =
        atStart ? "none" : "auto";

      recNext.style.opacity =
        atEnd ? "0.38" : "1";

      recNext.style.pointerEvents =
        atEnd ? "none" : "auto";
    }

    /* Left Arrow */

    recPrev.addEventListener("click", () => {

      recCarousel.scrollBy({
        left: -SCROLL_AMT,
        behavior: "smooth"
      });
    });

    /* Right Arrow */

    recNext.addEventListener("click", () => {

      recCarousel.scrollBy({
        left: SCROLL_AMT,
        behavior: "smooth"
      });
    });

    recCarousel.addEventListener(
      "scroll",
      updateRecArrows
    );

    updateRecArrows();
  }

  if (bikesOnlyView && isVehiclePage && document.getElementById('bikesGrid')) {
    document.body.classList.add('bikes-only-view');
  }

  const vehiclesSearch = document.getElementById('vehiclesSearch');
  if (vehiclesSearch) {
    vehiclesSearch.addEventListener('input', e => {
      const query = String(e.target.value || '').trim().toLowerCase();

      document.querySelectorAll('.vehicle-card').forEach(card => {
        const name = card.querySelector('.vehicle-card__name')?.textContent?.toLowerCase() || '';
        const type = card.querySelector('.vehicle-card__type')?.textContent?.toLowerCase() || '';
        const specs = Array.from(card.querySelectorAll('.spec'))
          .map(spec => spec.textContent?.toLowerCase() || '')
          .join(' ');
        const matches = !query || name.includes(query) || type.includes(query) || specs.includes(query);
        card.style.display = matches ? '' : 'none';
      });

      // Count visible cards per grid
      const visibleCars = [...document.querySelectorAll('#carsGrid .vehicle-card')]
        .filter(c => c.style.display !== 'none').length;
      const visibleBikes = [...document.querySelectorAll('#bikesGrid .vehicle-card')]
        .filter(c => c.style.display !== 'none').length;

      // Show/hide explore buttons
      const exploreCarsBtn = document.getElementById('exploreCars')?.closest('.explore-cta');
      const exploreBikesBtn = document.getElementById('exploreBikes')?.closest('.explore-cta');
      if (exploreCarsBtn) exploreCarsBtn.style.display = visibleCars > 0 ? '' : 'none';
      if (exploreBikesBtn) exploreBikesBtn.style.display = visibleBikes > 0 ? '' : 'none';

      // No results message
      let noResult = document.getElementById('rw-no-results');
      if (visibleCars === 0 && visibleBikes === 0 && query) {
        if (!noResult) {
          noResult = document.createElement('p');
          noResult.id = 'rw-no-results';
          noResult.style.cssText = 'text-align:center;color:#64748b;font-size:1rem;padding:40px 0;grid-column:1/-1;';
          noResult.textContent = 'No vehicles found matching your search.';
          document.querySelector('.vehicles-grid')?.parentElement?.appendChild(noResult);
        }
        noResult.style.display = '';
      } else {
        if (noResult) noResult.style.display = 'none';
      }
    });
  }

  const revealTargets = document.querySelectorAll(
    '.vehicle-card, .testimonial-card, .section-header'
  );

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  revealTargets.forEach(el => {
    el.addEventListener('animationend', () => observer.unobserve(el), { once: true });
    observer.observe(el);
  });

  function showToast(message, type = 'info') {
    document.querySelectorAll('.rw-toast').forEach(t => t.remove());

    const colors = {
      info: { bg: '#2563EB', icon: 'ℹ' },
      warn: { bg: '#F59E0B', icon: '⚠' },
      ok: { bg: '#22C55E', icon: '✓' },
    };
    const { bg, icon } = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = 'rw-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="rw-toast__icon">${icon}</span><span>${message}</span>`;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%) translateY(12px)',
      background: bg,
      color: '#fff',
      padding: '12px 22px',
      borderRadius: '9999px',
      fontSize: '0.88rem',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.RentWheels = { showToast };

  const loginModal = document.getElementById("loginModal");
  const loginModalClose = document.getElementById("loginModalClose");
  const switchToSignup = document.getElementById("switchToSignup");
  const signupModal = document.getElementById("signupModal");
  const signupModalClose = document.getElementById("signupModalClose");
  const switchToLogin = document.getElementById("switchToLogin");

  function openModal(el) {
    if (!el) return;
    el.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModal(el) {
    if (!el) return;
    el.style.display = "none";
    if (!loginModal || loginModal.style.display === "none") {
      if (!signupModal || signupModal.style.display === "none") {
        document.body.style.overflow = "";
      }
    }
  }

  if (loginModalClose) loginModalClose.addEventListener("click", () => closeModal(loginModal));
  if (signupModalClose) signupModalClose.addEventListener("click", () => closeModal(signupModal));
  if (switchToSignup) {
    switchToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(signupModal);
    });
  }
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(signupModal);
      openModal(loginModal);
    });
  }
  [loginModal, signupModal].forEach((m) => {
    if (!m) return;
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal(loginModal);
    closeModal(signupModal);
  });

  loadHomeVehicles();
  loadRecommendations();

});
