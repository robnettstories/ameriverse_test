// Shared by the hub and every chart: offline cache, file sharing, install hint.
(function () {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;
  root.classList.toggle('is-standalone', standalone);
  root.classList.toggle('is-ios', isIOS);

  // ---- offline: register the service worker that precaches every page and file
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register(new URL('../sw.js', document.currentScript.src)).catch(() => {});
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'cached') setOffline(true);
    });
    navigator.serviceWorker.ready.then(async () => {
      const keys = await caches.keys();
      for (const k of keys) {
        if (k.startsWith('ameriverse-') && await (await caches.open(k)).match(new URL('../index.html', location.href))) setOffline(true);
      }
    }).catch(() => {});
  }
  function setOffline(on) {
    root.classList.toggle('is-offline-ready', on);
  }

  // ---- documents: keep the page's files in memory so the share sheet can open
  // synchronously on tap (iOS refuses navigator.share once the tap has gone stale)
  const blobs = {};
  function prefetch(href) {
    if (blobs[href]) return Promise.resolve(blobs[href]);
    return fetch(href).then((r) => r.ok ? r.blob() : null).then((b) => (blobs[href] = b)).catch(() => null);
  }
  function prefetchListed() {
    const meta = document.querySelector('meta[name="app-docs"]');
    const list = meta ? meta.content.split('|').filter(Boolean)
      : [...document.querySelectorAll('[data-href]')].map((el) => el.getAttribute('data-href'));
    list.forEach(prefetch);
  }
  (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(prefetchListed);

  function shareFile(href, filename, mime) {
    const blob = blobs[href];
    if (touch && blob && navigator.canShare) {
      const file = new File([blob], filename, { type: mime });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).catch((err) => {
          if (err && err.name !== 'AbortError') openFile(href, filename);
        });
        return;
      }
    }
    openFile(href, filename);
  }
  function openFile(href, filename) {
    if (standalone) {
      // inside the home-screen app a plain navigation would strand the user on
      // the document with no back button; open it in the in-app browser instead
      window.open(href, '_blank');
      return;
    }
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  window.AmeriTechApp = { shareFile, isIOS, standalone };

  document.addEventListener('click', (e) => {
    const doc = e.target.closest('button.doc[data-href]');
    if (doc) shareFile(doc.dataset.href, doc.dataset.filename, doc.dataset.mime);
    const close = e.target.closest('[data-dismiss-install]');
    if (close) {
      root.classList.add('install-dismissed');
      try { localStorage.setItem('installHintDismissed', '1'); } catch (_) {}
    }
  });
  try { if (localStorage.getItem('installHintDismissed')) root.classList.add('install-dismissed'); } catch (_) {}
})();
