document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".vehicle-card").forEach((card) => {
    card.addEventListener("click", () => {
      const vehicleId = card.dataset.id;
      const name =
        card.querySelector(".vehicle-card__name")?.textContent ?? "Vehicle";
      console.log(`[RentWheels] View vehicle: ${name} (id=${vehicleId})`);
      showToast(`Viewing details for ${name}`, "info");
    });
  });

  const exploreCars = document.getElementById("exploreCars");
  const exploreBikes = document.getElementById("exploreBikes");

  if (exploreCars) {
    exploreCars.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[RentWheels] Navigate → all cars");
      showToast("Loading all cars…", "info");
    });
  }

  if (exploreBikes) {
    exploreBikes.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[RentWheels] Navigate → all bikes");
      showToast("Loading all bikes…", "info");
    });
  }

  const vehiclesSearch = document.getElementById("vehiclesSearch");
  if (vehiclesSearch) {
    vehiclesSearch.addEventListener("input", (e) => {
      const query = String(e.target.value || "")
        .trim()
        .toLowerCase();
      document.querySelectorAll(".vehicle-card").forEach((card) => {
        const name =
          card
            .querySelector(".vehicle-card__name")
            ?.textContent?.toLowerCase() || "";
        const type =
          card
            .querySelector(".vehicle-card__type")
            ?.textContent?.toLowerCase() || "";
        const specs = Array.from(card.querySelectorAll(".spec"))
          .map((spec) => spec.textContent?.toLowerCase() || "")
          .join(" ");
        const matches =
          !query ||
          name.includes(query) ||
          type.includes(query) ||
          specs.includes(query);
        card.style.display = matches ? "" : "none";
      });
    });
  }

  const revealTargets = document.querySelectorAll(
    ".vehicle-card, .testimonial-card, .section-header",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
  );

  revealTargets.forEach((el) => {
    el.addEventListener("animationend", () => observer.unobserve(el), {
      once: true,
    });
    observer.observe(el);
  });

  function showToast(message, type = "info") {
    document.querySelectorAll(".rw-toast").forEach((t) => t.remove());

    const colors = {
      info: { bg: "#2563EB", icon: "ℹ" },
      warn: { bg: "#F59E0B", icon: "⚠" },
      ok: { bg: "#22C55E", icon: "✓" },
    };
    const { bg, icon } = colors[type] || colors.info;

    const toast = document.createElement("div");
    toast.className = "rw-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span class="rw-toast__icon">${icon}</span><span>${message}</span>`;

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "28px",
      left: "50%",
      transform: "translateX(-50%) translateY(12px)",
      background: bg,
      color: "#fff",
      padding: "12px 22px",
      borderRadius: "9999px",
      fontSize: "0.88rem",
      fontFamily: "Outfit, sans-serif",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(8px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.RentWheels = { showToast };
});
