(function () {
  'use strict';

  /* ─── State ─────────────────────────────────────────── */
  const state = {
    insurance: '',
    pickupDate: null,
    returnDate: null,
    activeCalendar: null,
    calendarDate: new Date(),
  };

  /* ─── DOM refs ───────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  const insuranceBtn = $('insuranceSelect');
  const insuranceValue = $('insuranceValue');
  const insuranceDropdown = $('insuranceDropdown');
  const insuranceField = $('insuranceField');

  const pickupInput = $('pickupDate');
  const pickupCalBtn = $('pickupCalBtn');
  const pickupField = $('pickupField');

  const returnInput = $('returnDate');
  const returnCalBtn = $('returnCalBtn');
  const returnField = $('returnField');

  const searchBtn = $('searchBtn');
  const calendarPopup = $('calendarPopup');
  const calDays = $('calDays');
  const calMonthYear = $('calMonthYear');
  const prevMonthBtn = $('prevMonth');
  const nextMonthBtn = $('nextMonth');
  const searchBar = $('searchBar');

  /* ─── Helpers ─────────────────────────────────────────── */
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function formatDate(date) {
    if (!date) return '';
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  }

  function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function sameDay(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function clearErrors() {
    [insuranceField, pickupField, returnField].forEach(el =>
      el.classList.remove('has-error')
    );
  }

  function setError(fieldEl) {
    fieldEl.classList.add('has-error');
  }

  /* ─── Insurance Dropdown ──────────────────────────────── */
  function openDropdown() {
    insuranceDropdown.classList.add('open');
    insuranceBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    insuranceDropdown.classList.remove('open');
    insuranceBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown() {
    const isOpen = insuranceDropdown.classList.contains('open');
    closeCalendar();
    isOpen ? closeDropdown() : openDropdown();
  }

  insuranceBtn.addEventListener('click', toggleDropdown);

  insuranceDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      state.insurance = item.dataset.value;
      insuranceValue.textContent = item.textContent;
      insuranceBtn.classList.add('has-value');

      insuranceDropdown.querySelectorAll('.dropdown-item')
        .forEach(i => i.classList.toggle('selected', i === item));

      insuranceField.classList.remove('has-error');
      closeDropdown();
    });
  });

  /* ─── Calendar ────────────────────────────────────────── */
  function positionCalendar(triggerEl) {
    const barRect = searchBar.getBoundingClientRect();
    const btnRect = triggerEl.getBoundingClientRect();
    let left = btnRect.left - barRect.left - 8;
    const maxLeft = barRect.width - 300 - 10;
    left = Math.max(10, Math.min(left, maxLeft));
    calendarPopup.style.left = left + 'px';
    calendarPopup.style.top = (searchBar.offsetHeight + 8) + 'px';
  }

  function openCalendar(type) {
    state.activeCalendar = type;

    const existing = type === 'pickup' ? state.pickupDate : state.returnDate;
    state.calendarDate = existing ? new Date(existing) : new Date();
    state.calendarDate.setDate(1);

    renderCalendar();
    positionCalendar(type === 'pickup' ? pickupCalBtn : returnCalBtn);

    calendarPopup.style.display = 'block';
    closeDropdown();
  }

  function closeCalendar() {
    calendarPopup.style.display = 'none';
    state.activeCalendar = null;
  }

  function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();

    calMonthYear.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = today();

    let minDate = todayDate;
    if (state.activeCalendar === 'return' && state.pickupDate) {
      minDate = new Date(state.pickupDate);
      minDate.setDate(minDate.getDate() + 1);
    }

    calDays.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('button');
      blank.className = 'cal-day other-month';
      blank.disabled = true;
      calDays.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const btn = document.createElement('button');
      btn.textContent = d;
      btn.className = 'cal-day';

      if (dayDate < minDate && !sameDay(dayDate, minDate)) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        if (sameDay(dayDate, todayDate)) btn.classList.add('today');

        btn.addEventListener('click', () => {
          if (state.activeCalendar === 'pickup') {
            state.pickupDate = dayDate;
            pickupInput.value = formatDate(dayDate);
            pickupInput.classList.add('has-value');
            pickupField.classList.remove('has-error');

            if (state.returnDate && state.returnDate <= dayDate) {
              state.returnDate = null;
              returnInput.value = '';
            }
          } else {
            state.returnDate = dayDate;
            returnInput.value = formatDate(dayDate);
            returnInput.classList.add('has-value');
            returnField.classList.remove('has-error');
          }
          closeCalendar();
        });
      }

      calDays.appendChild(btn);
    }
  }

  prevMonthBtn.onclick = () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
    renderCalendar();
  };

  nextMonthBtn.onclick = () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
    renderCalendar();
  };

  pickupInput.onclick = () => openCalendar('pickup');
  pickupCalBtn.onclick = e => { e.stopPropagation(); openCalendar('pickup'); };
  returnInput.onclick = () => openCalendar('return');
  returnCalBtn.onclick = e => { e.stopPropagation(); openCalendar('return'); };

  document.addEventListener('click', e => {
    if (!calendarPopup.contains(e.target)) closeCalendar();
    if (!insuranceBtn.contains(e.target) && !insuranceDropdown.contains(e.target)) closeDropdown();
  });

  /* ─── Validation ──────────────────────────────────────── */
  function validate() {
    clearErrors();
    let valid = true;

    if (!state.insurance) {
      setError(insuranceField);
      valid = false;
    }

    if (!state.pickupDate) {
      setError(pickupField);
      valid = false;
    }

    if (!state.returnDate || state.returnDate <= state.pickupDate) {
      setError(returnField);
      valid = false;
    }

    return valid;
  }

  /* ─── Search ─────────────────────────────────────────── */
  searchBtn.addEventListener('click', () => {
    closeCalendar();
    closeDropdown();

    if (!validate()) return;

    const params = new URLSearchParams({
      insurance: state.insurance,
      pickup: formatDate(state.pickupDate),
      return: formatDate(state.returnDate),
    });

    alert(`vehicles.html?${params.toString()}`);
  });

})();