document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const carsOnlyView = params.get('view') === 'cars';
  const bikesOnlyView = params.get('view') === 'bikes';
  const isVehiclePage = document.body?.dataset?.page === 'vehicle';

  document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
      const vehicleId = card.dataset.id;
      const fromCars = document.body.classList.contains('cars-only-view');
      const fromParam = fromCars ? '&from=cars' : '';
      window.location.href = `./vehicle-detail.html?id=${encodeURIComponent(vehicleId)}${fromParam}`;
    });
  });
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

  const exploreCars  = document.getElementById('exploreCars');
  const exploreBikes = document.getElementById('exploreBikes');

  if (exploreCars) {
    exploreCars.addEventListener('click', () => {
      console.log('[RentWheels] Navigate → all cars');
    });
  }

  if (exploreBikes) {
    exploreBikes.addEventListener('click', e => {
      // Allow default navigation
      console.log('[RentWheels] Navigate → all bikes');
    });
  }

  if (carsOnlyView && isVehiclePage && document.getElementById('carsGrid')) {
    document.body.classList.add('cars-only-view');
    const carsOnlyToolbar = document.getElementById('carsOnlyToolbar');
    if (carsOnlyToolbar) carsOnlyToolbar.hidden = false;

    const carsGrid = document.getElementById('carsGrid');
    if (carsGrid) {
      const baseCards = Array.from(carsGrid.children);
      let index = 0;
      while (carsGrid.children.length < 9 && baseCards.length > 0) {
        const clone = baseCards[index % baseCards.length].cloneNode(true);
        const idValue = 100 + carsGrid.children.length + 1;
        clone.dataset.id = String(idValue);
        carsGrid.appendChild(clone);
        index += 1;
      }
    }
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
    
    // We can reuse carsOnlyToolbar but modify its text
    const toolbar = document.getElementById('carsOnlyToolbar');
    if (toolbar) {
      toolbar.hidden = false;
      const title = toolbar.querySelector('.cars-only-title');
      if (title) title.textContent = 'Bikes Ready For Rent';
    }

    const bikesGrid = document.getElementById('bikesGrid');
    if (bikesGrid) {
      const baseCards = Array.from(bikesGrid.children);
      let index = 0;
      while (bikesGrid.children.length < 9 && baseCards.length > 0) {
        const clone = baseCards[index % baseCards.length].cloneNode(true);
        const idValue = 200 + bikesGrid.children.length + 1;
        clone.dataset.id = String(idValue);
        bikesGrid.appendChild(clone);
        index += 1;
      }
    }
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
      const visibleCars  = [...document.querySelectorAll('#carsGrid .vehicle-card')]
        .filter(c => c.style.display !== 'none').length;
      const visibleBikes = [...document.querySelectorAll('#bikesGrid .vehicle-card')]
        .filter(c => c.style.display !== 'none').length;

      // Show/hide explore buttons
      const exploreCarsBtn  = document.getElementById('exploreCars')?.closest('.explore-cta');
      const exploreBikesBtn = document.getElementById('exploreBikes')?.closest('.explore-cta');
      if (exploreCarsBtn)  exploreCarsBtn.style.display  = visibleCars  > 0 ? '' : 'none';
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
      info : { bg: '#2563EB', icon: 'ℹ' },
      warn : { bg: '#F59E0B', icon: '⚠' },
      ok   : { bg: '#22C55E', icon: '✓' },
    };
    const { bg, icon } = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = 'rw-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="rw-toast__icon">${icon}</span><span>${message}</span>`;

    Object.assign(toast.style, {
      position       : 'fixed',
      bottom         : '28px',
      left           : '50%',
      transform      : 'translateX(-50%) translateY(12px)',
      background     : bg,
      color          : '#fff',
      padding        : '12px 22px',
      borderRadius   : '9999px',
      fontSize       : '0.88rem',
      fontFamily     : 'Outfit, sans-serif',
      fontWeight     : '500',
      display        : 'flex',
      alignItems     : 'center',
      gap            : '8px',
      boxShadow      : '0 6px 24px rgba(0,0,0,0.18)',
      zIndex         : '9999',
      opacity        : '0',
      transition     : 'opacity 0.25s ease, transform 0.25s ease',
      whiteSpace     : 'nowrap',
      pointerEvents  : 'none',
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.RentWheels = { showToast };

});
