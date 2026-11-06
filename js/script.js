
(() => {
  'use strict';

  const PERSIAN = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const MINUS = '−'; /* U+2212 */

  const display    = document.getElementById('counter-display');
  const displayBox = display.closest('.display');
  const btnInc     = document.getElementById('btn-increment');
  const btnDec     = document.getElementById('btn-decrement');
  const btnReset   = document.getElementById('btn-reset');

  if (!display || !btnInc || !btnDec || !btnReset) return;

  /* مقدار اولیه — هر عدد صحیحی مجاز است */
  let value = 0;
  const initial = parseInt(display.dataset.value, 10);
  if (Number.isFinite(initial)) value = initial;

  /* تبدیل عدد به رشتهٔ فارسی، با علامت منفی در صورت نیاز */
  const toPersian = (n) => {
    const negative = n < 0;
    const digits = String(Math.abs(n))
      .split('')
      .map((c) => PERSIAN[+c] ?? c)
      .join('');
    return (negative ? MINUS : '') + digits;
  };

  /* تعیین وضعیت رنگی بر اساس علامت عدد */
  function setState() {
    if (value === 0)         displayBox.dataset.state = 'zero';
    else if (value > 0)      displayBox.dataset.state = 'positive';
    else                     displayBox.dataset.state = 'negative';
  }

  /* تنظیم اندازهٔ فونت بر اساس طول متن (شامل علامت منفی) */
  function updateFontSize(text) {
    const len = text.length;
    let size = 'lg';
    if (len >= 9)      size = 'xs';
    else if (len >= 7) size = 'sm';
    else if (len >= 5) size = 'md';
    display.dataset.size = size;
  }

  /* انیمیشن بازخورد — فقط انیمیشن‌های WAAPI را لغو می‌کند */
  let currentAnim = null;
  function bump(direction) {
    const keyframes = direction === 'down'
      ? [
          { transform: 'translateY(0) scale(1)',   filter: 'brightness(1)' },
          { transform: 'translateY(5px) scale(0.94)', filter: 'brightness(1.3)', offset: 0.4 },
          { transform: 'translateY(0) scale(1)',   filter: 'brightness(1)' }
        ]
      : direction === 'reset'
      ? [
          { transform: 'scale(1)',  filter: 'brightness(1)' },
          { transform: 'scale(0.9)', filter: 'brightness(0.65)', offset: 0.4 },
          { transform: 'scale(1)',  filter: 'brightness(1)' }
        ]
      : [
          { transform: 'translateY(0) scale(1)',      filter: 'brightness(1)' },
          { transform: 'translateY(-5px) scale(1.08)', filter: 'brightness(1.35)', offset: 0.4 },
          { transform: 'translateY(0) scale(1)',      filter: 'brightness(1)' }
        ];

    if (currentAnim) currentAnim.cancel();
    currentAnim = display.animate(keyframes, {
      duration: direction === 'reset' ? 380 : 320,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    });
  }

  function render(direction) {
    const text = toPersian(value);
    display.textContent = text;
    display.dataset.value = String(value);
    updateFontSize(text);
    setState();
    if (direction) bump(direction);
  }

  /* — عملیات — بی‌نهایت، بدون سقف و کف — */
  function increment() { value += 1; render('up'); }
  function decrement() { value -= 1; render('down'); }
  function reset()     { if (value === 0) return; value = 0; render('reset'); }

  btnInc.addEventListener('click', increment);
  btnDec.addEventListener('click', decrement);
  btnReset.addEventListener('click', reset);

  /* — کیبورد — */
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    if (document.body.classList.contains('has-modal')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowUp':
      case '+':
      case '=':
        e.preventDefault(); increment(); break;
      case 'ArrowDown':
      case '-':
      case '_':
        e.preventDefault(); decrement(); break;
      case 'PageUp':
        e.preventDefault(); value += 10; render('up'); break;
      case 'PageDown':
        e.preventDefault(); value -= 10; render('down'); break;
      case 'r':
      case 'R':
      case 'Backspace':
      case 'Delete':
        e.preventDefault(); reset(); break;
    }
  });

  /* — مودال — */
  const modal   = document.getElementById('creator-modal');
  const openers = document.querySelectorAll('[href="#creator-modal"]');
  const closers = modal ? modal.querySelectorAll('[data-close-modal]') : [];
  let lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    document.body.classList.add('has-modal');
    const closeBtn = modal.querySelector('.creator__close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('has-modal');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  openers.forEach((el) => el.addEventListener('click', openModal));
  closers.forEach((el) => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
      const focusables = modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  /* — رندر اولیه — */
  render();
})();