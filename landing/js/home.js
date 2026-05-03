document.addEventListener("DOMContentLoaded", () => {

  /* ── Modal helpers ──────────────────────────────────────── */
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = "flex"; document.body.style.overflow = "hidden"; }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = "none"; document.body.style.overflow = ""; }
  }

  // Close buttons
  document.getElementById("loginModalClose")?.addEventListener("click", () => closeModal("loginModal"));
  document.getElementById("signupModalClose")?.addEventListener("click", () => closeModal("signupModal"));

  // Switch between modals
  document.getElementById("switchToSignup")?.addEventListener("click", (e) => {
    e.preventDefault(); closeModal("loginModal"); openModal("signupModal");
  });
  document.getElementById("switchToLogin")?.addEventListener("click", (e) => {
    e.preventDefault(); closeModal("signupModal"); openModal("loginModal");
  });

  // Close on backdrop click (dimmed page behind stays visible)
  ["loginModal", "signupModal"].forEach((id) => {
    const overlay = document.getElementById(id);
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(id);
    });
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal("loginModal"); closeModal("signupModal"); }
  });

  // Password toggles
  function setupPwToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const inp = document.getElementById(inputId);
    if (btn && inp) {
      btn.addEventListener("click", () => {
        inp.type = inp.type === "password" ? "text" : "password";
      });
    }
  }
  setupPwToggle("loginTogglePw", "loginPw");
  setupPwToggle("signupTogglePw", "signupPw");
  setupPwToggle("signupToggleCpw", "signupCpw");

  // Login form submit
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail");
    const pw = document.getElementById("loginPw");
    let ok = true;
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      email.closest(".rw-field").classList.add("has-error"); ok = false;
    } else email.closest(".rw-field").classList.remove("has-error");
    if (!pw.value || pw.value.length < 6) {
      pw.closest(".rw-field").classList.add("has-error"); ok = false;
    } else pw.closest(".rw-field").classList.remove("has-error");
    if (!ok) return;
    // TODO: call API
    showToast("Login feature coming soon!", "info");
  });

  // Signup form submit
  document.getElementById("signupForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = document.getElementById("signupPw");
    const cpw = document.getElementById("signupCpw");
    const err = document.getElementById("signupErr");
    if (pw.value !== cpw.value) {
      err.textContent = "Passwords do not match.";
      err.style.display = "block";
      return;
    }
    err.style.display = "none";
    // TODO: call API
    showToast("Sign up feature coming soon!", "info");
  });

  /* ── Vehicle card clicks ────────────────────────────────── */
  document.querySelectorAll(".vehicle-card").forEach((card) => {
    card.addEventListener("click", () => {
      const vehicleId = card.dataset.id;
      const name = card.querySelector(".vehicle-card__name")?.textContent ?? "Vehicle";
      console.log(`[RentWheels] View vehicle: ${name} (id=${vehicleId})`);
      showToast(`Viewing details for ${name}`, "info");
    });
  });

  /* ── Explore buttons ────────────────────────────────────── */
  document.getElementById("exploreCars")?.addEventListener("click", () => {
    console.log("[RentWheels] Navigate → all cars");
  });
  document.getElementById("exploreBikes")?.addEventListener("click", () => {
    console.log("[RentWheels] Navigate → all bikes");
  });

  /* ── Featured vehicles text search ─────────────────────── */
  const vehiclesSearch = document.getElementById("vehiclesSearch");
  if (vehiclesSearch) {
    vehiclesSearch.addEventListener("input", (e) => {
      const query = (e.target.value || "").trim().toLowerCase();
      document.querySelectorAll(".vehicle-card").forEach((card) => {
        const name = card.querySelector(".vehicle-card__name")?.textContent?.toLowerCase() || "";
        const type = card.querySelector(".vehicle-card__type")?.textContent?.toLowerCase() || "";
        const specs = Array.from(card.querySelectorAll(".spec"))
          .map((s) => s.textContent?.toLowerCase() || "").join(" ");
        const matches = !query || name.includes(query) || type.includes(query) || specs.includes(query);
        card.style.display = matches ? "" : "none";
      });
    });
  }

  /* ── Hero search widget (hs-* IDs) ─────────────────────── */
  const hsState = {
    insurance: "",
    pickupDate: null,
    returnDate: null,
    activeCalendar: null,
    calDate: new Date(),
  };

  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  function fmtDate(d) {
    if (!d) return "";
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }
  function todayDate() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // Insurance dropdown
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
        insDrop.querySelectorAll(".hs-dropdown__item").forEach(i => i.classList.toggle("selected", i === item));
        insDrop.classList.remove("open");
        insBtn.setAttribute("aria-expanded", "false");
        document.getElementById("hs-insuranceField")?.classList.remove("has-error");
      });
    });
  }

  // Calendar
  const calPopup = document.getElementById("hs-calPopup");
  const calDaysEl = document.getElementById("hs-calDays");
  const calMonthEl = document.getElementById("hs-calMonthYear");

  function openHsCal(type) {
    if (!calPopup) return;
    hsState.activeCalendar = type;
    const existing = type === "pickup" ? hsState.pickupDate : hsState.returnDate;
    hsState.calDate = existing ? new Date(existing) : new Date();
    hsState.calDate.setDate(1);
    renderHsCal();
    calPopup.style.display = "block";
    insDrop?.classList.remove("open");
  }
  function closeHsCal() {
    if (calPopup) calPopup.style.display = "none";
    hsState.activeCalendar = null;
  }
  function renderHsCal() {
    if (!calDaysEl || !calMonthEl) return;
    const year = hsState.calDate.getFullYear();
    const month = hsState.calDate.getMonth();
    calMonthEl.textContent = `${MONTHS[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayDate();
    let minDate = today;
    if (hsState.activeCalendar === "return" && hsState.pickupDate) {
      minDate = new Date(hsState.pickupDate);
      minDate.setDate(minDate.getDate() + 1);
    }
    calDaysEl.innerHTML = "";
    for (let i = 0; i < firstDay; i++) {
      const b = document.createElement("button");
      b.className = "hs-cal-day empty"; b.disabled = true;
      calDaysEl.appendChild(b);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const b = document.createElement("button");
      b.className = "hs-cal-day";
      b.textContent = d;
      if (dayDate < minDate && !sameDay(dayDate, minDate)) {
        b.classList.add("past"); b.disabled = true;
      } else {
        if (sameDay(dayDate, today)) b.classList.add("today");
        const selDate = hsState.activeCalendar === "pickup" ? hsState.pickupDate : hsState.returnDate;
        if (sameDay(dayDate, selDate)) b.classList.add("selected");
        b.addEventListener("click", () => {
          if (hsState.activeCalendar === "pickup") {
            hsState.pickupDate = dayDate;
            const inp = document.getElementById("hs-pickupDate");
            if (inp) inp.value = fmtDate(dayDate);
            if (hsState.returnDate && hsState.returnDate <= dayDate) {
              hsState.returnDate = null;
              const r = document.getElementById("hs-returnDate"); if (r) r.value = "";
            }
          } else {
            hsState.returnDate = dayDate;
            const inp = document.getElementById("hs-returnDate");
            if (inp) inp.value = fmtDate(dayDate);
          }
          closeHsCal();
        });
      }
      calDaysEl.appendChild(b);
    }
  }

  document.getElementById("hs-prevMonth")?.addEventListener("click", () => {
    hsState.calDate.setMonth(hsState.calDate.getMonth() - 1); renderHsCal();
  });
  document.getElementById("hs-nextMonth")?.addEventListener("click", () => {
    hsState.calDate.setMonth(hsState.calDate.getMonth() + 1); renderHsCal();
  });

  ["hs-pickupDate", "hs-pickupCalBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", (e) => { e.stopPropagation(); openHsCal("pickup"); });
  });
  ["hs-returnDate", "hs-returnCalBtn"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", (e) => { e.stopPropagation(); openHsCal("return"); });
  });

  document.addEventListener("click", (e) => {
    const search = document.getElementById("heroSearch");
    if (search && !search.contains(e.target)) { closeHsCal(); insDrop?.classList.remove("open"); }
  });

  // Search button navigation
  document.getElementById("hs-searchBtn")?.addEventListener("click", () => {
    closeHsCal();
    insDrop?.classList.remove("open");
    const params = new URLSearchParams();
    if (hsState.insurance) params.set("insurance", hsState.insurance);
    if (hsState.pickupDate) params.set("pickup", fmtDate(hsState.pickupDate));
    if (hsState.returnDate) params.set("return", fmtDate(hsState.returnDate));
    window.location.href = `../html/vehicle.html?${params.toString()}`;
  });

  /* ── Scroll reveal ─────────────────────────────────────── */
  const revealTargets = document.querySelectorAll(".vehicle-card, .testimonial-card, .section-header");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.style.opacity = "1"; entry.target.style.transform = "translateY(0)"; observer.unobserve(entry.target); }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
  revealTargets.forEach((el) => {
    el.addEventListener("animationend", () => observer.unobserve(el), { once: true });
    observer.observe(el);
  });

  /* ── Toast ─────────────────────────────────────────────── */
  function showToast(message, type = "info") {
    document.querySelectorAll(".rw-toast").forEach((t) => t.remove());
    const colors = { info: { bg: "#2563EB", icon: "ℹ" }, warn: { bg: "#F59E0B", icon: "⚠" }, ok: { bg: "#22C55E", icon: "✓" } };
    const { bg, icon } = colors[type] || colors.info;
    const toast = document.createElement("div");
    toast.className = "rw-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    Object.assign(toast.style, {
      position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%) translateY(12px)",
      background: bg, color: "#fff", padding: "12px 22px", borderRadius: "9999px", fontSize: "0.88rem",
      fontFamily: "Outfit,sans-serif", fontWeight: "500", display: "flex", alignItems: "center",
      gap: "8px", boxShadow: "0 6px 24px rgba(0,0,0,0.18)", zIndex: "9999",
      opacity: "0", transition: "opacity 0.25s ease,transform 0.25s ease", whiteSpace: "nowrap", pointerEvents: "none",
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(0)";
    }));
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(-50%) translateY(8px)"; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  window.RentWheels = { showToast, openModal, closeModal };
});
