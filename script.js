
  'use strict';

  /* ─── Navbar scroll ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ─── Mobile burger ─── */
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose  = document.getElementById('drawerClose');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burgerBtn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);

  /* ─── Modal ─── */
  const overlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  let lastFocusedEl = null;

  function openModal(source) {
    lastFocusedEl = document.activeElement;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('inputName').focus();
    trackEvent('modal_open', { source });
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Reset form
    setTimeout(() => {
      document.getElementById('modalFormState').style.display = '';
      document.getElementById('modalSuccess').classList.remove('show');
      document.getElementById('modalForm').reset();
      clearErrors();
    }, 260);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal(); });

  /* Focus trap */
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = overlay.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  /* ─── Form validation ─── */
  function clearErrors() {
    document.getElementById('fieldName').classList.remove('has-error');
    document.getElementById('fieldPhone').classList.remove('has-error');
    document.getElementById('inputName').classList.remove('is-error');
    document.getElementById('inputPhone').classList.remove('is-error');
  }

  function validatePhone(val) {
    const clean = val.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 12;
  }

  document.getElementById('modalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();

    const name  = document.getElementById('inputName').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    let valid = true;

    if (!name) {
      document.getElementById('fieldName').classList.add('has-error');
      document.getElementById('inputName').classList.add('is-error');
      valid = false;
    }
    if (!validatePhone(phone)) {
      document.getElementById('fieldPhone').classList.add('has-error');
      document.getElementById('inputPhone').classList.add('is-error');
      valid = false;
    }

    if (!valid) {
      trackEvent('lead_submit_error');
      return;
    }

    // Success
    trackEvent('lead_submit_success', { name, phone });
    document.getElementById('modalFormState').style.display = 'none';
    document.getElementById('modalSuccess').classList.add('show');
  });

  /* Phone mask */
  document.getElementById('inputPhone').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '');
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length === 0) { this.value = ''; return; }
    let masked = '+7';
    if (val.length > 1) masked += ' (' + val.slice(1, 4);
    if (val.length >= 4) masked += ') ' + val.slice(4, 7);
    if (val.length >= 7) masked += '-' + val.slice(7, 9);
    if (val.length >= 9) masked += '-' + val.slice(9, 11);
    this.value = masked;
  });

  /* ─── Cases Slider ─── */
  const track    = document.getElementById('casesTrack');
  const dotsWrap = document.getElementById('casesDots');
  const btnPrev  = document.getElementById('casesPrev');
  const btnNext  = document.getElementById('casesNext');
  const TOTAL    = 6;
  let current    = 0;
  let startX     = 0;
  let isDragging = false;

  // Build dots
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('button');
    dot.className = 'cases__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Кейс ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function goTo(index) {
    current = (index + TOTAL) % TOTAL;
    track.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.cases__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    document.getElementById('casesSlider').setAttribute('aria-label', `Кейс ${current + 1} из ${TOTAL}`);
  }

  btnPrev.addEventListener('click', () => { trackEvent('cases_slider_prev'); goTo(current - 1); });
  btnNext.addEventListener('click', () => { trackEvent('cases_slider_next'); goTo(current + 1); });

  // Keyboard
  document.getElementById('casesSlider').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // Touch / swipe
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    isDragging = false;
  }, { passive: true });

  /* ─── Fade-in on scroll ─── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ─── Analytics (stub) ─── */
  function trackEvent(name, data = {}) {
    console.log('[Analytics]', name, data);
    // Здесь подключить Yandex.Metrika / GA4
  }

  /* ─── Scroll depth ─── */
  const depths = [25, 50, 75, 100];
  const fired  = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    depths.forEach(d => { if (pct >= d && !fired.has(d)) { fired.add(d); trackEvent('scroll_depth', { depth: d }); } });
  }, { passive: true });

  /* ─── Page view ─── */
  trackEvent('page_view');
