(function () {
  const DETAILS = {
    1: {
      title: "BMW X5",
      meta: "2022 • SUV",
      price: "Rs1000",
      priceNote: "per day",
      image: "../assets/bmwx5.png",
      seats: "4 Seats",
      fuel: "Gasoline",
      transmission: "Automatic",
      location: "Kathmandu",
      description:
        "The BMW X5 is a mid-size luxury SUV produced by BMW. The X5 made its debut in 1999 as the first SUV ever produced by BMW, blending refined driving dynamics with everyday practicality.",
      features: [
        "Leather Seats",
        "Panoramic Sunroof",
        "Wireless Charging",
        "360 Camera",
      ],
      commentSample: {
        name: "Mike Johnson",
        text: "Great choice! The BMW X5 is awesome. Enjoyed the drive!",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        time: "5m",
      },
    },
    2: {
      title: "BMW M3",
      meta: "2022 • Sedan",
      price: "Rs2990",
      priceNote: "per day",
      image: "../assets/bmwm3.png",
      seats: "5 Seats",
      fuel: "Gasoline",
      transmission: "Automatic",
      location: "Los Angeles",
      description:
        "The BMW M3 is a high-performance legend—track-bred power with everyday usability. Sharp handling, bold design, and a cockpit built for drivers who want more from every mile.",
      features: [
        "Leather Seats",
        "Panoramic Sunroof",
        "Wireless Charging",
        "360 Camera",
      ],
      commentSample: {
        name: "Mike Johnson",
        text: "Great choice! The BMW M3 Competition is awesome. Enjoyed the drive!",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        time: "5m",
      },
    },
    3: {
      title: "Tesla Model X",
      meta: "2023 • SUV",
      price: "Rs1200",
      priceNote: "per day",
      image: "../assets/TeslaModelX.png",
      seats: "4 Seats",
      fuel: "Electric",
      transmission: "Automatic",
      location: "Kathmandu",
      description:
        "The Tesla Model X combines electric range with distinctive falcon-wing doors and a minimalist interior. Ideal for families who want zero-emission travel without sacrificing space.",
      features: [
        "Autopilot",
        "Panoramic Glass Roof",
        "Wireless Charging",
        "Premium Audio",
      ],
      commentSample: {
        name: "Sarah Chen",
        text: "So smooth and quiet. Charging was easy around the city.",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        time: "12m",
      },
    },
    4: {
      title: "BMW s1000rr",
      meta: "2021 • Sports",
      price: "Rs2000",
      priceNote: "per day",
      image: "../assets/bmws1krr.png",
      seats: "1 Seat",
      fuel: "Petrol",
      transmission: "Manual",
      location: "Kathmandu",
      description:
        "A superbike built for the track and the road—lightweight frame, aggressive ergonomics, and exhilarating acceleration for experienced riders.",
      features: ["ABS", "Riding Modes", "LED Lighting", "Quick Shifter"],
      commentSample: {
        name: "Alex Rivera",
        text: "Insane bike. Respect the power and wear proper gear.",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        time: "1h",
      },
    },
    5: {
      title: "Ducati streetfighter V4S",
      meta: "2022 • Sports",
      price: "Rs220",
      priceNote: "per day",
      image: "../assets/streetfighterV4S.png",
      seats: "1 Seat",
      fuel: "Petrol",
      transmission: "Manual",
      location: "Kathmandu",
      description:
        "Italian V4 performance in a naked streetfighter package—raw sound, precise handling, and unmistakable Ducati character.",
      features: [
        "Cornering ABS",
        "TFT Display",
        "Öhlins Suspension",
        "Quick Shift",
      ],
      commentSample: {
        name: "Jordan Lee",
        text: "Sounds incredible. Staff made pickup quick and easy.",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        time: "2d",
      },
    },
    6: {
      title: "Royal Enfield Classic 350",
      meta: "2023 • Cruiser",
      price: "Rs800",
      priceNote: "per day",
      image: "../assets/RoyalEnfield350.png",
      seats: "2 Seats",
      fuel: "Petrol",
      transmission: "Manual",
      location: "Kathmandu",
      description:
        "Timeless cruiser styling with a torque-friendly single-cylinder engine—perfect for relaxed rides through city streets and hills.",
      features: [
        "Tripper Navigation",
        "LED Headlamp",
        "Dual Channel ABS",
        "USB Charging",
      ],
      commentSample: {
        name: "Priya Sharma",
        text: "Classic look, easy to ride. Great for weekend trips.",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        time: "3d",
      },
    },
  };

  function resolveId(raw) {
    const n = parseInt(String(raw), 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    if (n >= 100) {
      const bases = [1, 2, 3];
      return bases[(n - 101) % bases.length];
    }
    return DETAILS[n] ? n : 1;
  }

  function statIcon(type) {
    const common = 'viewBox="0 0 16 16" fill="none" aria-hidden="true"';
    if (type === "seats")
      return `<svg ${common}><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
    if (type === "fuel")
      return `<svg ${common}><path d="M3 13s0-6 5-6 5 6 5 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="5" r="2" stroke="currentColor" stroke-width="1.3"/></svg>`;
    if (type === "transmission")
      return `<svg ${common}><rect x="2" y="5" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.3"/></svg>`;
    return `<svg ${common}><path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="7" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`;
  }

  function renderStats(d) {
    return [
      { icon: "seats", label: d.seats },
      { icon: "fuel", label: d.fuel },
      { icon: "transmission", label: d.transmission },
      { icon: "location", label: d.location },
    ]
      .map(
        (s) => `
      <div class="vehicle-detail-stat">
        <span class="vehicle-detail-stat__icon">${statIcon(s.icon)}</span>
        <span class="vehicle-detail-stat__label">${s.label}</span>
      </div>`,
      )
      .join("");
  }

  function renderFeatures(list) {
    return list
      .map(
        (f) => `
      <li class="vehicle-detail-feature">
        <span class="vehicle-detail-feature__check" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span>${f}</span>
      </li>`,
      )
      .join("");
  }

  function renderComment(c) {
    return `
      <div class="vehicle-detail-comment">
        <img class="vehicle-detail-comment__avatar" src="${c.avatar}" alt="" width="53" height="55" />
        <div class="vehicle-detail-comment__body">
          <div class="vehicle-detail-comment__bubble">
            <p class="vehicle-detail-comment__name">${c.name}</p>
            <p class="vehicle-detail-comment__text">${c.text}</p>
          </div>
          <div class="vehicle-detail-comment__actions">
            <button type="button" class="vehicle-detail-comment__action action-like">Like</button>
            <button type="button" class="vehicle-detail-comment__action action-reply">Reply</button>
            <span class="vehicle-detail-comment__time">${c.time}</span>
          </div>
        </div>
      </div>`;
  }

  function showToast(message) {
    if (
      window.RentWheels &&
      typeof window.RentWheels.showToast === "function"
    ) {
      window.RentWheels.showToast(message, "info");
      return;
    }
    alert(message);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = resolveId(params.get("id"));
    const from = params.get("from");
    const d = DETAILS[id];

    const back = document.getElementById("detailBack");
    if (back) {
      back.href =
        from === "cars" ? "./vehicle.html?view=cars" : "./vehicle.html";
    }

    document.title = `${d.title} – RentWheels`;

    const hero = document.getElementById("detailHeroImg");
    if (hero) {
      hero.src = d.image;
      hero.alt = d.title;
    }
    const meta = document.getElementById("detailMeta");
    if (meta) meta.textContent = d.meta;
    const title = document.getElementById("detailTitle");
    if (title) title.textContent = d.title;
    const price = document.getElementById("detailPrice");
    if (price) price.textContent = d.price;
    const priceNote = document.getElementById("detailPriceNote");
    if (priceNote) priceNote.textContent = d.priceNote;
    const desc = document.getElementById("detailDescription");
    if (desc) desc.textContent = d.description;

    const stats = document.getElementById("detailStats");
    if (stats) stats.innerHTML = renderStats(d);

    const feats = document.getElementById("detailFeatures");
    if (feats) feats.innerHTML = renderFeatures(d.features);

    const list = document.getElementById("detailCommentsList");
    if (list) {
      list.innerHTML = renderComment(d.commentSample);

      list.addEventListener("click", (e) => {
        if (e.target.classList.contains("action-like")) {
          if (e.target.textContent === "Like") {
            e.target.textContent = "Liked";
            e.target.style.color = "#2563eb";
            showToast("Comment liked");
          } else {
            e.target.textContent = "Like";
            e.target.style.color = "";
            showToast("Like removed");
          }
        } else if (e.target.classList.contains("action-reply")) {
          const comment = e.target.closest(".vehicle-detail-comment");
          const nameEl = comment.querySelector(".vehicle-detail-comment__name");
          const name = nameEl ? nameEl.textContent : "User";
          const input = document.getElementById("commentInput");
          if (input) {
            input.value = `@${name} ` + input.value;
            input.focus();
          }
        }
      });
    }

    const bookBtn = document.getElementById("bookNowBtn");
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("bookingModalContent");

    if (bookBtn && modal && modalContent) {
      bookBtn.addEventListener("click", () => {
        const pDate = document.getElementById("pickupDate").value;
        const rDate = document.getElementById("returnDate").value;

        let days = 5;
        let periodStr = "4/10/2025 - 4/15/2025 (5 Days)";

        if (pDate && rDate) {
          const start = new Date(pDate);
          const end = new Date(rDate);
          const diffSpan = end - start;
          if (diffSpan > 0) {
            days = Math.ceil(diffSpan / (1000 * 60 * 60 * 24));
            periodStr = `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${days} Days)`;
          } else {
            showToast("Return date must be after pickup date.");
            return;
          }
        } else if (pDate || rDate) {
          showToast("Please select both Pickup and Return dates.");
          return;
        }

        const basePrice = parseInt(d.price.replace(/[^0-9]/g, ""), 10) || 80;
        const carCost = basePrice * days;

        const insSelect = document.getElementById("insuranceType");
        const insType = insSelect ? insSelect.value : "none";
        let insCostPerDay = 0;
        if (insType === "basic") insCostPerDay = 15;
        if (insType === "full") insCostPerDay = 30;
        const insuranceCost = insCostPerDay * days;

        const total = carCost + insuranceCost;

        const typeLabel = d.meta.includes("•")
          ? d.meta.split("•")[1].trim()
          : "VEHICLE";

        const imgEl = document.getElementById("modalCarImg");
        if (imgEl) imgEl.src = d.image;

        const nameEl = document.getElementById("modalCarName");
        if (nameEl) nameEl.textContent = `${d.title} (${typeLabel})`;

        const periodEl = document.getElementById("modalRentalPeriod");
        if (periodEl) periodEl.textContent = periodStr;

        const daysLabelEl = document.getElementById("modalRentalDaysLabel");
        if (daysLabelEl) daysLabelEl.textContent = `Car Rental (${days} days)`;

        const rCostEl = document.getElementById("modalRentalCost");
        if (rCostEl) rCostEl.textContent = `Rs${carCost}`;

        const iCostEl = document.getElementById("modalInsuranceCost");
        if (iCostEl) iCostEl.textContent = `Rs${insuranceCost}`;

        const tCostEl = document.getElementById("modalTotalCost");
        if (tCostEl) tCostEl.textContent = `Rs${total}`;

        const payBtnEl = document.getElementById("modalPayBtn");
        if (payBtnEl) payBtnEl.textContent = `Complete & Pay Rs${total}`;

        modal.removeAttribute("hidden");
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.setAttribute("hidden", "");
        }
      });

      const payBtnEl = document.getElementById("modalPayBtn");
      if (payBtnEl) {
        payBtnEl.addEventListener("click", () => {
          modal.setAttribute("hidden", "");
          showToast("Payment Successful!");
        });
      }
    }

    const postBtn = document.getElementById("commentPost");
    const input = document.getElementById("commentInput");
    if (postBtn && input && list) {
      postBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) {
          showToast("Write a comment first");
          return;
        }
        const c = {
          name: "You",
          text,
          avatar: "https://randomuser.me/api/portraits/men/99.jpg",
          time: "now",
        };
        list.insertAdjacentHTML("afterbegin", renderComment(c));
        input.value = "";
        showToast("Comment posted");
      });
    }
  });
})();
