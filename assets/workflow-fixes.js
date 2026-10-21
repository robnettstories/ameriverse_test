// Contain focus in the foremost supplied modal, including navigation outside modalBox.
(() => {
  let active = null, returnFocus = null;
  const overlays = [...document.querySelectorAll('.modal-overlay,.lightbox-overlay,.fullview-overlay')];
  const focusables = overlay => [...overlay.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function sync() {
    const next = overlays.filter(el => el.classList.contains('open')).at(-1);
    if (next === active) return;
    if (next) {
      if (!active) returnFocus = document.activeElement;
      active = next;
      const box = next.querySelector('[role="dialog"],.modal,.lightbox,.fullview') || next;
      box.tabIndex = -1;
      if (!next.contains(document.activeElement)) (focusables(next)[0] || box).focus();
      document.body.style.overflow = 'hidden';
    } else {
      active = null;
      document.body.style.overflow = '';
      if (returnFocus?.isConnected) returnFocus.focus();
    }
  }
  overlays.forEach(el => new MutationObserver(sync).observe(el, {attributes:true,attributeFilter:['class']}));
  document.addEventListener('keydown', event => {
    if (!active || event.key !== 'Tab') return;
    const controls = focusables(active), first = controls[0], last = controls.at(-1);
    if (!controls.length) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) {event.preventDefault();first.focus();}
  }, true);
  document.addEventListener('focusin', event => { if (active && !active.contains(event.target)) focusables(active)[0]?.focus(); });
})();
