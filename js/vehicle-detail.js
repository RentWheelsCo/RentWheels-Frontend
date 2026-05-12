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
      if (n >= 200) {
        const bikeBases = [4, 5, 6];
        return bikeBases[(n - 201) % bikeBases.length];
      }
      const carBases = [1, 2, 3];
      return carBases[(n - 101) % carBases.length];
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderComment(c) {
    const isOwn = c.name === "You";
    const commentId = isOwn ? c.commentId || `me-${Date.now()}` : "";
    const idAttr = commentId ? ` data-comment-id="${escapeHtml(commentId)}"` : "";
    const ownClass = isOwn ? " vehicle-detail-comment--own" : "";

    const imageMarkup = c.image
      ? `<button type="button" class="vehicle-detail-comment__photo-btn" aria-label="Expand image">
            <img class="vehicle-detail-comment__photo-thumb" src="${c.image}" alt="Comment image" />
         </button>`
      : "";

    const kebabBlock = isOwn
      ? `<div class="vehicle-detail-comment__menu-wrap">
          <button type="button" class="vehicle-detail-comment__kebab" aria-label="Comment options" aria-expanded="false" aria-haspopup="true" title="More">
            <svg class="vehicle-detail-comment__kebab-icon" viewBox="0 0 4 16" fill="none" aria-hidden="true">
              <circle cx="2" cy="2.5" r="1.25" fill="currentColor"/>
              <circle cx="2" cy="8" r="1.25" fill="currentColor"/>
              <circle cx="2" cy="13.5" r="1.25" fill="currentColor"/>
            </svg>
          </button>
          <div class="vehicle-detail-comment__menu" role="menu" hidden>
            <button type="button" role="menuitem" class="vehicle-detail-comment__menu-item action-edit-comment">Edit</button>
            <button type="button" role="menuitem" class="vehicle-detail-comment__menu-item action-delete-comment">Delete</button>
          </div>
        </div>`
      : "";

    const nameBlock = isOwn
      ? `<div class="vehicle-detail-comment__bubble-head">
          <p class="vehicle-detail-comment__name">${escapeHtml(c.name)}</p>
          ${kebabBlock}
        </div>`
      : `<p class="vehicle-detail-comment__name">${escapeHtml(c.name)}</p>`;

    return `
      <div class="vehicle-detail-comment${ownClass}"${idAttr}>
        <img class="vehicle-detail-comment__avatar" src="${c.avatar}" alt="" width="53" height="55" />
        <div class="vehicle-detail-comment__body">
          <div class="vehicle-detail-comment__bubble">
            ${nameBlock}
            <p class="vehicle-detail-comment__text">${escapeHtml(c.text)}</p>
            ${imageMarkup}
          </div>
          <div class="vehicle-detail-comment__actions">
            <button type="button" class="vehicle-detail-comment__action action-like">Like</button>
            <button type="button" class="vehicle-detail-comment__action action-reply">Reply</button>
            <span class="vehicle-detail-comment__time">${escapeHtml(c.time)}</span>
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

  function resizeImageDataUrl(file, maxWidth = 1280, maxHeight = 1280) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          const targetW = Math.round(img.width * scale);
          const targetH = Math.round(img.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not process image"));
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = () => reject(new Error("Invalid image file"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }

  function createHeroSlides(id, d) {
    const allVehicleImages = Object.keys(DETAILS).map((key) => DETAILS[key].image);
    const uniqueImages = [...new Set([d.image, ...allVehicleImages])];
    const fallbackSlides = [d.image, d.image, d.image, d.image, d.image];
    const slides = uniqueImages.slice(0, 5);
    return slides.length >= 2 ? slides : fallbackSlides;
  }

  function setupHeroCarousel(id, d) {
    const heroImg = document.getElementById("detailHeroImg");
    const prevBtn = document.getElementById("detailHeroPrev");
    const nextBtn = document.getElementById("detailHeroNext");
    const dotsWrap = document.getElementById("detailHeroDots");
    if (!heroImg || !prevBtn || !nextBtn || !dotsWrap) return;

    const slides = createHeroSlides(id, d);
    let active = 0;

    function renderDots() {
      dotsWrap.innerHTML = slides
        .map(
          (_, index) =>
            `<button type="button" class="vehicle-detail-hero__dot ${
              index === active ? "is-active" : ""
            }" data-index="${index}" aria-label="Go to image ${index + 1}"></button>`,
        )
        .join("");
    }

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      heroImg.classList.add("is-fading");
      heroImg.src = slides[active];
      heroImg.alt = `${d.title} view ${active + 1}`;
      renderDots();
      window.setTimeout(() => {
        heroImg.classList.remove("is-fading");
      }, 120);
    }

    prevBtn.addEventListener("click", () => setSlide(active - 1));
    nextBtn.addEventListener("click", () => setSlide(active + 1));
    dotsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".vehicle-detail-hero__dot");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (Number.isFinite(idx)) setSlide(idx);
    });

    setSlide(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = resolveId(params.get("id"));
    const from = params.get("from");
    const d = DETAILS[id];

    const back = document.getElementById("detailBack");
    if (back) {
      const backLabel =
        from === "cars"
          ? "Back to all cars"
          : from === "bikes"
            ? "Back to all bikes"
            : "Back to vehicles";

      if (from === "cars") {
        back.href = "./vehicle.html?view=cars";
      } else if (from === "bikes") {
        back.href = "./vehicle.html?view=bikes";
      } else {
        back.href = "./vehicle.html";
      }

      const icon = back.querySelector(".vehicle-detail-back__icon");
      if (icon) {
        back.innerHTML = "";
        back.appendChild(icon);
        back.append(` ${backLabel}`);
      } else {
        back.textContent = backLabel;
      }
    }

    document.title = `${d.title} – RentWheels`;

    setupHeroCarousel(id, d);
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
    const imageBtn = document.getElementById("commentImageBtn");
    const imageInput = document.getElementById("commentImageInput");
    const attachment = document.getElementById("commentImageAttachment");
    const attachmentThumb = document.getElementById("commentImageAttachmentThumb");
    const imageRemoveBtn = document.getElementById("commentImageRemove");
    const imageModal = document.getElementById("commentImageModal");
    const imageModalImg = document.getElementById("commentImageModalImg");
    const imageModalClose = document.getElementById("commentImageModalClose");
    let selectedImage = "";

    function clearImageSelection() {
      selectedImage = "";
      if (imageInput) imageInput.value = "";
      if (attachment) attachment.hidden = true;
      if (attachmentThumb) attachmentThumb.src = "";
    }

    if (imageBtn && imageInput) {
      imageBtn.addEventListener("click", () => imageInput.click());
      imageInput.addEventListener("change", async () => {
        const file = imageInput.files && imageInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          showToast("Please choose an image file.");
          clearImageSelection();
          return;
        }
        try {
          selectedImage = await resizeImageDataUrl(file);
          if (attachmentThumb) attachmentThumb.src = selectedImage;
          if (attachment) attachment.hidden = false;
        } catch (error) {
          showToast("Could not load image. Try another one.");
          clearImageSelection();
        }
      });
    }

    if (imageRemoveBtn) {
      imageRemoveBtn.addEventListener("click", clearImageSelection);
    }

    if (imageModal && imageModalClose) {
      imageModalClose.addEventListener("click", () => {
        imageModal.setAttribute("hidden", "");
        if (imageModalImg) imageModalImg.src = "";
      });
      imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) {
          imageModal.setAttribute("hidden", "");
          if (imageModalImg) imageModalImg.src = "";
        }
      });
    }

    if (list) {
      const editState = new WeakMap();

      function closeAllCommentMenus() {
        list.querySelectorAll(".vehicle-detail-comment__menu").forEach((menu) => {
          menu.hidden = true;
          const kebab = menu.previousElementSibling;
          if (kebab && kebab.classList.contains("vehicle-detail-comment__kebab")) {
            kebab.setAttribute("aria-expanded", "false");
          }
        });
      }

      function startEditComment(comment) {
        if (!comment || comment.classList.contains("is-editing")) return;
        const textEl = comment.querySelector(".vehicle-detail-comment__text");
        if (!textEl) return;
        editState.set(comment, { original: textEl.textContent });
        textEl.hidden = true;
        comment.classList.add("is-editing");

        const editWrap = document.createElement("div");
        editWrap.className = "vehicle-detail-comment__edit-wrap";
        const ta = document.createElement("textarea");
        ta.className = "vehicle-detail-comment__edit-input";
        ta.value = textEl.textContent;
        const actions = document.createElement("div");
        actions.className = "vehicle-detail-comment__edit-actions";
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "vehicle-detail-comment__edit-save";
        saveBtn.textContent = "Save";
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "vehicle-detail-comment__edit-cancel";
        cancelBtn.textContent = "Cancel";
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        editWrap.appendChild(ta);
        editWrap.appendChild(actions);
        textEl.insertAdjacentElement("afterend", editWrap);
        ta.focus();
      }

      function cancelEditComment(comment) {
        const state = editState.get(comment);
        const textEl = comment.querySelector(".vehicle-detail-comment__text");
        const editWrap = comment.querySelector(".vehicle-detail-comment__edit-wrap");
        if (textEl && state) textEl.textContent = state.original;
        if (textEl) textEl.hidden = false;
        editWrap?.remove();
        comment.classList.remove("is-editing");
        editState.delete(comment);
      }

      function saveEditComment(comment) {
        const ta = comment.querySelector(".vehicle-detail-comment__edit-input");
        const textEl = comment.querySelector(".vehicle-detail-comment__text");
        const editWrap = comment.querySelector(".vehicle-detail-comment__edit-wrap");
        const next = (ta?.value ?? "").trim() || " ";
        if (textEl) textEl.textContent = next;
        if (textEl) textEl.hidden = false;
        editWrap?.remove();
        comment.classList.remove("is-editing");
        editState.delete(comment);
        showToast("Comment updated");
      }

      document.addEventListener("click", (e) => {
        if (!list.isConnected) return;
        if (e.target.closest(".vehicle-detail-comment__menu-wrap")) return;
        closeAllCommentMenus();
      });

      list.innerHTML = renderComment(d.commentSample);

      list.addEventListener("click", (e) => {
        const saveEdit = e.target.closest(".vehicle-detail-comment__edit-save");
        if (saveEdit) {
          const comment = saveEdit.closest(".vehicle-detail-comment");
          if (comment) saveEditComment(comment);
          return;
        }

        const cancelEdit = e.target.closest(".vehicle-detail-comment__edit-cancel");
        if (cancelEdit) {
          const comment = cancelEdit.closest(".vehicle-detail-comment");
          if (comment) cancelEditComment(comment);
          return;
        }

        const kebab = e.target.closest(".vehicle-detail-comment__kebab");
        if (kebab) {
          e.preventDefault();
          const commentRow = kebab.closest(".vehicle-detail-comment");
          if (commentRow?.classList.contains("is-editing")) return;
          const menu = kebab.nextElementSibling;
          if (!menu || !menu.classList.contains("vehicle-detail-comment__menu")) return;
          const willOpen = menu.hidden;
          closeAllCommentMenus();
          if (willOpen) {
            menu.hidden = false;
            kebab.setAttribute("aria-expanded", "true");
          }
          return;
        }

        const deleteBtn = e.target.closest(".action-delete-comment");
        if (deleteBtn) {
          const comment = deleteBtn.closest(".vehicle-detail-comment");
          closeAllCommentMenus();
          comment?.remove();
          showToast("Comment deleted");
          return;
        }

        const editBtn = e.target.closest(".action-edit-comment");
        if (editBtn) {
          const comment = editBtn.closest(".vehicle-detail-comment");
          closeAllCommentMenus();
          if (comment) startEditComment(comment);
          return;
        }

        const likeBtn = e.target.closest(".action-like");
        if (likeBtn) {
          if (likeBtn.textContent === "Like") {
            likeBtn.textContent = "Liked";
            likeBtn.style.color = "#2563eb";
            showToast("Comment liked");
          } else {
            likeBtn.textContent = "Like";
            likeBtn.style.color = "";
            showToast("Like removed");
          }
          return;
        }

        const replyBtn = e.target.closest(".action-reply");
        if (replyBtn) {
          const comment = replyBtn.closest(".vehicle-detail-comment");
          const nameEl = comment?.querySelector(".vehicle-detail-comment__name");
          const name = nameEl ? nameEl.textContent.trim() : "User";
          const input = document.getElementById("commentInput");
          if (input) {
            input.value = `@${name} ` + input.value;
            input.focus();
          }
          return;
        }

        const imageThumb = e.target.closest(".vehicle-detail-comment__photo-btn");
        if (imageThumb && imageModal && imageModalImg) {
          const img = imageThumb.querySelector(".vehicle-detail-comment__photo-thumb");
          if (img && img.src) {
            imageModalImg.src = img.src;
            imageModal.removeAttribute("hidden");
          }
        }
      });
    }

    const bookBtn = document.getElementById("bookNowBtn");
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("bookingModalContent");
    const pickupInput = document.getElementById("pickupDate");
    const returnInput = document.getElementById("returnDate");
    const pickupError = document.getElementById("pickupDateError");
    const returnError = document.getElementById("returnDateError");

    function setDateError(inputEl, errorEl, message) {
      if (!inputEl || !errorEl) return;
      errorEl.textContent = message;
      inputEl.classList.toggle("vehicle-detail-field__control--error", !!message);
    }

    function clearDateErrors() {
      setDateError(pickupInput, pickupError, "");
      setDateError(returnInput, returnError, "");
    }

    if (bookBtn && modal && modalContent) {
      if (pickupInput && pickupError) {
        pickupInput.addEventListener("input", () =>
          setDateError(pickupInput, pickupError, ""),
        );
      }
      if (returnInput && returnError) {
        returnInput.addEventListener("input", () =>
          setDateError(returnInput, returnError, ""),
        );
      }
      bookBtn.addEventListener("click", () => {
        const pDate = pickupInput ? pickupInput.value : "";
        const rDate = returnInput ? returnInput.value : "";
        clearDateErrors();

        if (!pDate) {
          setDateError(pickupInput, pickupError, "**Pickup date is required.");
        }
        if (!rDate) {
          setDateError(returnInput, returnError, "**Return date is required.");
        }
        if (!pDate || !rDate) {
          return;
        }
        const start = new Date(pDate);
        const end = new Date(rDate);
        const diffSpan = end - start;
        if (diffSpan <= 0) {
          setDateError(
            returnInput,
            returnError,
            "Return date must be after pickup date.",
          );
          return;
        }
        const days = Math.ceil(diffSpan / (1000 * 60 * 60 * 24));
        const periodStr = `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${days} Days)`;

        const basePrice = parseInt(d.price.replace(/[^0-9]/g, ""), 10) || 80;
        const carCost = basePrice * days;

        const insSelect = document.getElementById("insuranceType");
        const insType = insSelect ? insSelect.value : "none";
        let insCostPerDay = 0;
        if (insType === "half") insCostPerDay = 15;
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
        if (!text && !selectedImage) {
          showToast("Write a comment or attach an image first");
          return;
        }
        const c = {
          name: "You",
          text: text || " ",
          avatar: "https://randomuser.me/api/portraits/men/99.jpg",
          time: "now",
          image: selectedImage || "",
          commentId: `me-${Date.now()}`,
        };
        list.insertAdjacentHTML("afterbegin", renderComment(c));
        input.value = "";
        clearImageSelection();
        showToast("Comment posted");
      });
    }
  });
})();
