/* ─────────────────────────────────────────────
   forgot-password.js  |  RentWheels
   Flow: Email → OTP → Reset Password → Success
   Mock OTP: 123456
───────────────────────────────────────────── */

'use strict';

/* ── Shared state ── */
var currentStep  = 1;
var userEmail    = '';
var otpInterval  = null;
var redirInterval = null;
var MOCK_OTP     = '123456';

/* ── Helpers ── */
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function showAlert(id, msg, type) {
  type = type || 'error';
  var el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'alert ' + type + ' show';
}

function hideAlert(id) {
  var el = document.getElementById(id);
  el.className = 'alert';
  el.textContent = '';
}

function setLoading(btnId, spId, txtId, on, label) {
  document.getElementById(btnId).disabled = on;
  document.getElementById(spId).style.display = on ? 'block' : 'none';
  document.getElementById(txtId).textContent  = on ? 'Please wait\u2026' : label;
}

function pause(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

/* ── Progress dots & step navigation ── */
function goTo(n) {
  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step' + n).classList.add('active');
  for (var i = 1; i <= 3; i++) {
    var d = document.getElementById('dot' + i);
    d.className = 'dot' + (i < n ? ' done' : i === n ? ' active' : '');
  }
}

/* ════════════════════════════════════════════
   STEP 1 – Email
════════════════════════════════════════════ */
var fpEmailEl = document.getElementById('fpEmail');

document.getElementById('emailForm').addEventListener('submit', function(e) {
  e.preventDefault();
  hideAlert('emailAlert');

  var val = fpEmailEl.value.trim();
  if (!isEmail(val)) {
    fpEmailEl.classList.add('invalid');
    document.getElementById('fpEmail-err').classList.add('show');
    return;
  }

  fpEmailEl.classList.remove('invalid');
  fpEmailEl.classList.add('valid');
  document.getElementById('fpEmail-err').classList.remove('show');
  setLoading('sendOtpBtn', 'sendSpinner', 'sendBtnText', true, 'Send OTP');

  pause(1400).then(function() {
    userEmail = val;
    document.getElementById('sentToEmail').textContent = val;
    setLoading('sendOtpBtn', 'sendSpinner', 'sendBtnText', false, 'Send OTP');
    goTo(2);
    startOtpTimer();
    document.querySelector('.otp-box').focus();
  });
});

fpEmailEl.addEventListener('input', function() {
  fpEmailEl.classList.remove('valid', 'invalid');
  document.getElementById('fpEmail-err').classList.remove('show');
  hideAlert('emailAlert');
});

/* ════════════════════════════════════════════
   STEP 2 – OTP
════════════════════════════════════════════ */
var otpBoxes = Array.from(document.querySelectorAll('.otp-box'));

otpBoxes.forEach(function(box, i) {
  box.addEventListener('input', function(e) {
    var v = e.target.value.replace(/\D/g, '');
    e.target.value = v;
    e.target.classList.toggle('filled', !!v);
    if (v && i < 5) otpBoxes[i + 1].focus();
    resetOtpState();
  });

  box.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      otpBoxes[i - 1].value = '';
      otpBoxes[i - 1].classList.remove('filled');
      otpBoxes[i - 1].focus();
    }
  });
});

document.getElementById('otpRow').addEventListener('paste', function(e) {
  e.preventDefault();
  var digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  otpBoxes.forEach(function(b, i) {
    b.value = digits[i] || '';
    b.classList.toggle('filled', !!digits[i]);
  });
  otpBoxes[Math.min(digits.length, 5)].focus();
  resetOtpState();
});

function getOtp() {
  return otpBoxes.map(function(b) { return b.value; }).join('');
}

function resetOtpState() {
  hideAlert('otpAlert');
  otpBoxes.forEach(function(b) { b.classList.remove('otp-valid', 'otp-invalid'); });
}

/* OTP countdown timer */
function startOtpTimer() {
  var secs = 60;
  document.getElementById('countdown').textContent = secs;
  document.getElementById('resendBtn').style.display  = 'none';
  document.getElementById('timerWrap').style.display  = '';
  clearInterval(otpInterval);

  otpInterval = setInterval(function() {
    secs--;
    document.getElementById('countdown').textContent = secs;
    if (secs <= 0) {
      clearInterval(otpInterval);
      document.getElementById('timerWrap').style.display = 'none';
      document.getElementById('resendBtn').style.display = 'inline';
    }
  }, 1000);
}

document.getElementById('resendBtn').addEventListener('click', function() {
  document.getElementById('resendBtn').style.display = 'none';
  otpBoxes.forEach(function(b) { b.value = ''; b.classList.remove('filled', 'otp-valid', 'otp-invalid'); });
  otpBoxes[0].focus();
  showAlert('otpAlert', 'A new code has been sent to ' + userEmail, 'success');
  startOtpTimer();
});

document.getElementById('otpForm').addEventListener('submit', function(e) {
  e.preventDefault();
  hideAlert('otpAlert');

  var entered = getOtp();
  if (entered.length < 6) {
    showAlert('otpAlert', 'Please enter the complete 6-digit code.');
    return;
  }

  setLoading('verifyOtpBtn', 'verifySpinner', 'verifyBtnText', true, 'Verify OTP');

  pause(1400).then(function() {
    if (entered === MOCK_OTP) {
      otpBoxes.forEach(function(b) {
        b.classList.remove('otp-invalid', 'filled');
        b.classList.add('otp-valid');
      });
      setLoading('verifyOtpBtn', 'verifySpinner', 'verifyBtnText', false, 'Verify OTP');
      clearInterval(otpInterval);
      setTimeout(function() { goTo(3); }, 300);
    } else {
      otpBoxes.forEach(function(b) {
        b.classList.add('otp-invalid');
        b.classList.remove('filled', 'otp-valid');
      });
      showAlert('otpAlert', 'Incorrect or expired OTP. Please try again.');
      setLoading('verifyOtpBtn', 'verifySpinner', 'verifyBtnText', false, 'Verify OTP');
    }
  });
});

document.getElementById('changeEmailBtn').addEventListener('click', function() {
  clearInterval(otpInterval);
  otpBoxes.forEach(function(b) { b.value = ''; b.classList.remove('filled', 'otp-valid', 'otp-invalid'); });
  hideAlert('otpAlert');
  fpEmailEl.value = '';
  fpEmailEl.classList.remove('valid', 'invalid');
  goTo(1);
});

/* ════════════════════════════════════════════
   STEP 3 – Reset Password
════════════════════════════════════════════ */
var newPwEl     = document.getElementById('newPw');
var confirmPwEl = document.getElementById('confirmPw');

var eyeOpen   = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
var eyeClosed = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

/* Password strength meter */
function calcStrength(pw) {
  var s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

newPwEl.addEventListener('input', function() {
  var s = calcStrength(newPwEl.value);
  var map = [
    { w: '0%',   c: 'transparent', l: '' },
    { w: '20%',  c: '#EF4444',     l: 'Very weak' },
    { w: '40%',  c: '#F97316',     l: 'Weak' },
    { w: '60%',  c: '#EAB308',     l: 'Fair' },
    { w: '80%',  c: '#22C55E',     l: 'Strong' },
    { w: '100%', c: '#16A34A',     l: 'Very strong' },
  ];
  var m   = map[s];
  var bar = document.getElementById('strengthBar');
  bar.style.width      = newPwEl.value ? m.w : '0%';
  bar.style.background = m.c;
  document.getElementById('strengthLabel').textContent = newPwEl.value ? m.l : '';
  document.getElementById('toggleNew').style.display   = newPwEl.value ? 'block' : 'none';
  newPwEl.classList.remove('valid', 'invalid');
  document.getElementById('newPw-err').classList.remove('show');
});

confirmPwEl.addEventListener('input', function() {
  document.getElementById('toggleConfirm').style.display = confirmPwEl.value ? 'block' : 'none';
  confirmPwEl.classList.remove('valid', 'invalid');
  document.getElementById('confirmPw-err').classList.remove('show');
});

/* Show/hide password toggles */
function makePwToggle(toggleId, inputId, svgId) {
  document.getElementById(toggleId).addEventListener('click', function() {
    var inp  = document.getElementById(inputId);
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    document.getElementById(svgId).innerHTML = show ? eyeClosed : eyeOpen;
  });
}
makePwToggle('toggleNew',     'newPw',     'eyeNew');
makePwToggle('toggleConfirm', 'confirmPw', 'eyeConfirm');

/* Reset form submit */
document.getElementById('resetForm').addEventListener('submit', function(e) {
  e.preventDefault();
  hideAlert('resetAlert');

  var pw  = newPwEl.value;
  var cpw = confirmPwEl.value;
  var ok  = true;

  if (pw.length < 8) {
    newPwEl.classList.add('invalid');
    document.getElementById('newPw-err').classList.add('show');
    ok = false;
  } else {
    newPwEl.classList.add('valid');
  }

  if (!cpw || pw !== cpw) {
    confirmPwEl.classList.add('invalid');
    document.getElementById('confirmPw-err').classList.add('show');
    ok = false;
  } else if (pw.length >= 8) {
    confirmPwEl.classList.add('valid');
  }

  if (!ok) return;

  setLoading('resetBtn', 'resetSpinner', 'resetBtnText', true, 'Reset Password');
  pause(1600).then(function() {
    setLoading('resetBtn', 'resetSpinner', 'resetBtnText', false, 'Reset Password');
    showSuccess();
  });
});

/* ════════════════════════════════════════════
   Success popup
════════════════════════════════════════════ */
function showSuccess() {
  document.getElementById('successOverlay').classList.add('show');
  var secs = 5;
  document.getElementById('redirectCount').textContent = secs;

  redirInterval = setInterval(function() {
    secs--;
    document.getElementById('redirectCount').textContent = secs;
    if (secs <= 0) {
      clearInterval(redirInterval);
      goToLogin();
    }
  }, 1000);
}

function goToLogin() {
  clearInterval(redirInterval);
  document.getElementById('successOverlay').classList.remove('show');
  window.location.href = 'login.html';
}

document.getElementById('goLoginBtn').addEventListener('click', goToLogin);
