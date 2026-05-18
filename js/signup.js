let currentPage = 0;

function validatePassword(password) {
  const errors = [];
  if (password.length < 6) errors.push("at least 6 characters");
  if (!/[A-Z]/.test(password)) errors.push("one uppercase letter (A-Z)");
  if (!/[0-9]/.test(password)) errors.push("one number (0-9)");
  return errors;
}

function setPage(n) {
  currentPage = n;
  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === n);
  });
}

function clearErrors() {
  document
    .querySelectorAll(".input-group input, .password-wrapper input")
    .forEach((input) => {
      input.classList.remove("input-error");
    });
  document.querySelectorAll(".error-msg").forEach((el) => el.remove());
}

function showError(inputEl, message) {
  inputEl.classList.add("input-error");
  if (!message) return;
  const err = document.createElement("span");
  err.className = "error-msg";
  err.textContent = message;
  const parent = inputEl.parentNode;
  // For password fields, append to input-group instead of password-wrapper
  const container = parent.classList.contains("password-wrapper")
    ? parent.parentNode
    : parent;
  container.appendChild(err);
}

function renderPasswordStrength(password) {
  const passwordEl = document.getElementById("npassword");
  const passwordGroup = passwordEl?.closest(".input-group");
  if (!passwordEl || !passwordGroup) return;

  let hint = document.getElementById("password-strength-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "password-strength-hint";
    hint.className = "password-hint";
    passwordGroup.appendChild(hint);
  }

  if (!password) {
    hint.innerHTML = "";
    return;
  }

  const checks = [
    { label: "6+ characters", ok: password.length >= 6 },
    { label: "Uppercase letter (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Number (0-9)", ok: /[0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const colors = ["", "#ef4444", "#f97316", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Strong"];
  const color = colors[passed];
  const label = labels[passed];

  hint.innerHTML = `
    <div class="password-meter">
      ${[0, 1, 2]
        .map(
          (i) => `
        <div class="password-meter__bar" style="background:${i < passed ? color : "#e5e7eb"}"></div>
      `,
        )
        .join("")}
    </div>
    ${label ? `<span class="password-strength-label" style="color:${color};">${label}</span>` : ""}
    <ul class="password-checklist">
      ${checks
        .map(
          (c) => `
        <li class="${c.ok ? "ok" : "pending"}">
          ${c.ok ? "OK" : "-"} ${c.label}
        </li>
      `,
        )
        .join("")}
    </ul>
  `;
}

function renderConfirmPasswordHint(password, confirmPassword) {
  const confirmEl = document.getElementById("cpassword");
  const confirmGroup = confirmEl?.closest(".input-group");
  if (!confirmEl || !confirmGroup) return;

  let hint = document.getElementById("confirm-password-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "confirm-password-hint";
    hint.className = "confirm-hint pending";
    confirmGroup.appendChild(hint);
  }

  if (!confirmPassword) {
    hint.className = "confirm-hint pending";
    hint.textContent = "Please re-enter your password.";
    return;
  }

  if (confirmPassword === password) {
    hint.className = "confirm-hint ok";
    hint.textContent = "Passwords match.";
    return;
  }

  hint.className = "confirm-hint error";
  hint.textContent = "Passwords do not match.";
}

function attachLiveClearing() {
  document
    .querySelectorAll(".input-group input, .password-wrapper input")
    .forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("input-error");
        const existing = input.parentNode.querySelector(".error-msg");
        if (existing) existing.remove();
        // For password fields, also check the input-group for errors
        const parent = input.parentNode;
        if (parent.classList.contains("password-wrapper")) {
          const inputGroupError = parent.parentNode.querySelector(".error-msg");
          if (inputGroupError) inputGroupError.remove();
        }
      });
    });

  const passwordEl = document.getElementById("npassword");
  if (passwordEl) {
    passwordEl.addEventListener("input", () => {
      renderPasswordStrength(passwordEl.value);
      const confirmEl = document.getElementById("cpassword");
      renderConfirmPasswordHint(passwordEl.value, confirmEl?.value || "");
    });
  }

  const confirmEl = document.getElementById("cpassword");
  if (confirmEl) {
    confirmEl.addEventListener("input", () => {
      renderConfirmPasswordHint(passwordEl?.value || "", confirmEl.value);
    });
  }
}

function restoreSavedData() {
  const saved = sessionStorage.getItem("signupData");
  if (!saved) return;
  const { name, email, phone } = JSON.parse(saved);
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  };
  set("username", name);
  set("email", email);
  set("phone", phone);
}

function nextPage() {
  clearErrors();

  const usernameEl = document.getElementById("username");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("npassword");
  const confirmEl = document.getElementById("cpassword");

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const password = passwordEl.value;
  const confirmPassword = confirmEl.value;

  let hasError = false;

  if (!username) {
    showError(usernameEl, "Name is required.");
    hasError = true;
  } else if (username.length < 2) {
    showError(usernameEl, "Name must be at least 2 characters.");
    hasError = true;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    showError(emailEl, "Email is required.");
    hasError = true;
  } else if (!emailPattern.test(email)) {
    showError(emailEl, "Invalid email format (e.g. you@example.com).");
    hasError = true;
  }

  if (!phone) {
    showError(phoneEl, "Phone number is required.");
    hasError = true;
  } else if (!/^[0-9+\-\s()]+$/.test(phone)) {
    showError(phoneEl, "Phone number contains invalid characters.");
    hasError = true;
  } else {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      showError(phoneEl, "Phone number must be 10 digits.");
      hasError = true;
    } else if (!digits.startsWith("98") && !digits.startsWith("97")) {
      showError(phoneEl, "Phone number must start with 98 or 97.");
      hasError = true;
    }
  }

  if (!password) {
    showError(passwordEl, "Password is required.");
    hasError = true;
  } else {
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      showError(passwordEl, `Password must include: ${pwErrors.join(", ")}.`);
      hasError = true;
    }
  }

  if (!confirmPassword) {
    showError(confirmEl, "Please confirm your password.");
    hasError = true;
  } else if (password && confirmPassword !== password) {
    showError(confirmEl, "Passwords do not match.");
    hasError = true;
  }

  if (hasError) return;

  // Check if email already exists
  checkEmailAndProceed(email, username, phone, password);
}

async function checkEmailAndProceed(email, username, phone, password) {
  const emailEl = document.getElementById("email");
  const nextBtn = document.querySelector(".btn-next");

  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = "Checking...";
  }

  try {
    await window.RW_API.auth.checkEmailExists(email);
    // If no error, email doesn't exist, proceed
    sessionStorage.setItem(
      "signupData",
      JSON.stringify({ name: username, email, phone, password }),
    );
    setPage(1);
    window.location.href = "signup1.html";
  } catch (err) {
    // Email already exists or other error
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      "Email already registered. Please use a different email.";

    showError(emailEl, message);

    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = "Next";
    }
  }
}

function goToLogin() {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  restoreSavedData();
  attachLiveClearing();
  renderPasswordStrength(document.getElementById("npassword")?.value || "");
  renderConfirmPasswordHint(
    document.getElementById("npassword")?.value || "",
    document.getElementById("cpassword")?.value || "",
  );

  const toggleNewPw = document.getElementById("toggle-npassword");
  const newPwInput = document.getElementById("npassword");
  if (toggleNewPw && newPwInput) {
    toggleNewPw.classList.toggle("visible", newPwInput.value.length > 0);

    newPwInput.addEventListener("input", () => {
      toggleNewPw.classList.toggle("visible", newPwInput.value.length > 0);
    });

    toggleNewPw.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = newPwInput.type === "password";
      newPwInput.type = isPassword ? "text" : "password";
      const img = toggleNewPw.querySelector("img");
      if (img) {
        img.src = isPassword ? "../assets/eyeClose.png" : "../assets/eye.png";
        img.alt = isPassword ? "hide password" : "show password";
      }
    });
  }

  const toggleConfirmPw = document.getElementById("toggle-cpassword");
  const confirmPwInput = document.getElementById("cpassword");
  if (toggleConfirmPw && confirmPwInput) {
    toggleConfirmPw.classList.toggle(
      "visible",
      confirmPwInput.value.length > 0,
    );

    confirmPwInput.addEventListener("input", () => {
      toggleConfirmPw.classList.toggle(
        "visible",
        confirmPwInput.value.length > 0,
      );
    });

    toggleConfirmPw.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = confirmPwInput.type === "password";
      confirmPwInput.type = isPassword ? "text" : "password";
      const img = toggleConfirmPw.querySelector("img");
      if (img) {
        img.src = isPassword ? "../assets/eyeClose.png" : "../assets/eye.png";
        img.alt = isPassword ? "hide password" : "show password";
      }
    });
  }
});
