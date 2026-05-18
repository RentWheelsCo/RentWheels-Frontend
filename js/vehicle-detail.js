(function () {
  // <!-- FULL API INTEGRATION ADDED -->
  // NOTE: This file previously used static vehicle data. It's now backend-driven.
  // Avoid demo images: use a lightweight inline placeholder when the API has no photos.
  const VEHICLE_PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
        <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs>
        <rect width="640" height="420" rx="24" fill="url(#g)"/>
        <path d="M220 250c0-18 14-32 32-32h150c14 0 26 9 31 21l10 29h22c18 0 33 15 33 33v16h-28c-6 19-23 33-44 33s-38-14-44-33H288c-6 19-23 33-44 33s-38-14-44-33h-28v-32c0-21 17-38 38-38h26l8-22c5-14 17-23 32-23h135" fill="none" stroke="#9ca3af" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="244" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
        <circle cx="440" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
      </svg>`,
    );
  const FALLBACK_IMAGES = [VEHICLE_PLACEHOLDER];

  function resolveId(raw) {
    const n = parseInt(String(raw), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
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
    const fromApi = Array.isArray(d?.photos) ? d.photos.filter(Boolean) : [];
    // Use exactly the photos the seller uploaded. Only fall back to a placeholder if there are none.
    if (fromApi.length) {
      const uniq = [...new Set(fromApi)].filter(Boolean);
      return uniq.slice(0, 10);
    }
    return FALLBACK_IMAGES.slice(0, 1);
  }

  function setupHeroCarousel(id, d) {
    const heroImg = document.getElementById("detailHeroImg");
    const prevBtn = document.getElementById("detailHeroPrev");
    const nextBtn = document.getElementById("detailHeroNext");
    const dotsWrap = document.getElementById("detailHeroDots");
    if (!heroImg || !prevBtn || !nextBtn || !dotsWrap) return;

    const slides = createHeroSlides(id, d);
    let active = 0;

    const hasCarousel = slides.length > 1;
    prevBtn.style.display = hasCarousel ? "" : "none";
    nextBtn.style.display = hasCarousel ? "" : "none";
    dotsWrap.style.display = hasCarousel ? "" : "none";

    function renderDots() {
      if (!hasCarousel) {
        dotsWrap.innerHTML = "";
        return;
      }
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
      active = slides.length ? (index + slides.length) % slides.length : 0;
      heroImg.classList.add("is-fading");
      heroImg.src = slides[active] || FALLBACK_IMAGES[0];
      heroImg.alt = `${d.title} view ${active + 1}`;
      renderDots();
      window.setTimeout(() => {
        heroImg.classList.remove("is-fading");
      }, 120);
    }

    if (hasCarousel) {
      prevBtn.addEventListener("click", () => setSlide(active - 1));
      nextBtn.addEventListener("click", () => setSlide(active + 1));
      dotsWrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".vehicle-detail-hero__dot");
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        if (Number.isFinite(idx)) setSlide(idx);
      });
    }

    setSlide(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = resolveId(params.get("id"));
    const from = params.get("from");
    if (!id) {
      window.location.href = "./vehicle.html";
      return;
    }
    let currentVehicle = null;

    const back = document.getElementById("detailBack");
    if (back) {
      back.href =
        from === "cars" ? "./vehicle.html?view=cars" : "./vehicle.html";
    }

    // Load vehicle detail from backend
    window.RW_API.vehicles.getDetail(id).then((payload) => {
      const vehicle = payload?.data || null;
      if (!vehicle) throw new Error("Vehicle not found");
      currentVehicle = vehicle;

      document.title = `${vehicle.name || "Vehicle"} – RentWheels`;

      // Hero carousel: reuse existing function, but feed it with vehicle photos
      const heroImg = document.getElementById("detailHeroImg");
      if (heroImg) {
        const photo = Array.isArray(vehicle.photos) && vehicle.photos.length ? vehicle.photos[0] : null;
        heroImg.src = photo || heroImg.src;
        heroImg.alt = vehicle.name || "Vehicle";
      }

      const meta = document.getElementById("detailMeta");
      if (meta) meta.textContent = `${vehicle.year || ""} • ${vehicle.category?.value || vehicle.type?.value || ""}`.trim();
      const title = document.getElementById("detailTitle");
      if (title) title.textContent = vehicle.name || "Vehicle";
      const price = document.getElementById("detailPrice");
      if (price) price.textContent = `Rs${Number(vehicle.dailyPrice || 0)}`;
      const priceNote = document.getElementById("detailPriceNote");
      if (priceNote) priceNote.textContent = "per day";
      const desc = document.getElementById("detailDescription");
      if (desc) desc.textContent = vehicle.description || "";

      const stats = document.getElementById("detailStats");
      if (stats) {
        stats.innerHTML = renderStats({
          seats: `${vehicle.seatingCapacity || ""} Seats`.trim(),
          fuel: vehicle.fuelType?.value || "",
          transmission: vehicle.transmission?.value || "",
          location: vehicle.location?.value || "",
        });
      }
      setupHeroCarousel(id, vehicle);
    }).catch((err) => {
      console.error("Vehicle detail load error:", err);
      showToast(err?.message || "Failed to load vehicle details.");
    });

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

    function loadComments() {
      if (!list) return;
      list.innerHTML = `<div style="color:#7b8292;font-size:13px;">Loading comments…</div>`;
      window.RW_API.comments.getVehicleComments(id, { page: 1, pageSize: 10 })
        .then((payload) => {
          const comments = Array.isArray(payload?.data?.comments) ? payload.data.comments : [];
          if (!comments.length) {
            list.innerHTML = `<div style="color:#7b8292;font-size:13px;">No comments yet.</div>`;
            return;
          }
          list.innerHTML = comments.map((c) => renderComment({
            name: c?.user?.name || "User",
            text: c?.content || "",
            avatar: c?.user?.profilePhoto || "../assets/Person-Icon.png",
            time: new Date(c.createdAt).toLocaleDateString(),
            image: "",
            commentId: c.id,
          })).join("");
        })
        .catch(() => {
          list.innerHTML = `<div style="color:#b91c1c;font-size:13px;">Failed to load comments.</div>`;
        });
    }

    if (list) {
      loadComments();

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
          const cid = Number(comment?.dataset?.commentId || 0);
          if (!cid) return;
          window.RW_API.comments.delete(cid)
            .then(() => {
              showToast("Comment deleted");
              loadComments();
            })
            .catch((err) => showToast(err?.message || "Failed to delete comment."));
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
          const row = likeBtn.closest(".vehicle-detail-comment");
          const cid = Number(row?.dataset?.commentId || 0);
          if (!cid) return;
          const willLike = likeBtn.textContent === "Like";
          likeBtn.disabled = true;
          (willLike ? window.RW_API.comments.like(cid) : window.RW_API.comments.unlike(cid))
            .then(() => {
              likeBtn.textContent = willLike ? "Liked" : "Like";
              likeBtn.style.color = willLike ? "#2563eb" : "";
              showToast(willLike ? "Comment liked" : "Like removed");
            })
            .catch((err) => showToast(err?.message || "Failed to update like."))
            .finally(() => { likeBtn.disabled = false; });
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

        const basePrice = Number(currentVehicle?.dailyPrice || 0);
        const carCost = basePrice * days;

        const insSelect = document.getElementById("insuranceType");
        const insType = insSelect ? insSelect.value : "none";
        let insCostPerDay = 0;
        if (insType === "half") insCostPerDay = basePrice * 0.025;
        if (insType === "full") insCostPerDay = basePrice * 0.05;
        const insuranceCost = insCostPerDay * days;

        const total = carCost + insuranceCost;

        const typeLabel = currentVehicle?.category?.value || currentVehicle?.type?.value || "VEHICLE";

        const imgEl = document.getElementById("modalCarImg");
        if (imgEl) imgEl.src = (Array.isArray(currentVehicle?.photos) && currentVehicle.photos.length ? currentVehicle.photos[0] : null) || imgEl.src;

        const nameEl = document.getElementById("modalCarName");
        if (nameEl) nameEl.textContent = `${currentVehicle?.name || document.getElementById("detailTitle")?.textContent || "Vehicle"} (${typeLabel})`;

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
          const pDate = document.getElementById("pickupDate").value;
          const rDate = document.getElementById("returnDate").value;
          const insSelect = document.getElementById("insuranceType");
          const insType = insSelect ? insSelect.value : "none";
          const apiInsurance = insType === "full" ? "FULL_INSURANCE" : insType === "half" ? "HALF_INSURANCE" : "NO_INSURANCE";

          payBtnEl.disabled = true;
          const original = payBtnEl.textContent;
          payBtnEl.textContent = "Redirecting to payment…";

          window.RW_API.payments.processPayment({
            vehicleId: id,
            pickupDate: pDate,
            returnDate: rDate,
            insuranceType: apiInsurance,
          }).then((payload) => {
            const stripeUrl = payload?.data?.stripeUrl;
            if (stripeUrl) {
              window.location.href = stripeUrl;
              return;
            }
            showToast("Checkout created, but missing Stripe URL.");
          }).catch((err) => {
            showToast(err?.message || "Payment failed. Please try again.");
          }).finally(() => {
            payBtnEl.disabled = false;
            payBtnEl.textContent = original;
            modal.setAttribute("hidden", "");
          });
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
        window.RW_API.comments.create({ vehicleId: id, content: text }).then(() => {
          input.value = "";
          clearImageSelection();
          loadComments();
          showToast("Comment posted");
        }).catch((err) => {
          showToast(err?.message || "Failed to post comment.");
        });
      });
    }
  });
})();
