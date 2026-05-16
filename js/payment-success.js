(function () {
  const msg = document.getElementById("paymentText");
  const params = new URLSearchParams(window.location.search);
  const sessionId = String(params.get("session_id") || "").trim();

  if (!sessionId) {
    if (msg) msg.textContent = "Payment completed. Booking confirmation is pending. Please check My Bookings.";
    return;
  }

  window.RW_API.request("/bookings/confirm-session", {
    method: "POST",
    params: { session_id: sessionId },
  }).then(() => {
    if (msg) msg.textContent = "Your booking has been confirmed. You can now view it in My Bookings.";
  }).catch((err) => {
    if (msg) msg.textContent = err?.message || "Payment completed. Booking confirmation may take a moment.";
  });
})();
