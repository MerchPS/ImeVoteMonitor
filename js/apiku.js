// apiku.js
// Override getApiUrl() agar aplikasi memanggil endpoint proxy /apiku
(function(){
  // Jika skrip utama mendefinisikan getApiUrl, kita override agar mengarah ke /apiku.
  window.getApiUrl = function() {
    return '/apiku';
  };

  // Intercept fetch: jika ada request ke target asli (dalam kasus ada hardcoded), redirect ke /apiku
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(resource, init) {
    try {
      let url = '';
      if (typeof resource === 'string') url = resource;
      else if (resource && resource.url) url = resource.url;

      if (url && (url.includes('generich.my.id/apivote') || url.match(/\/apikujs/i))) {
        // redirect to proxy with cache buster
        const sep = url.includes('?') ? '&' : '?';
        resource = '/apiku' + sep + '_=' + Date.now();
      }
    } catch (e) {
      // ignore
    }
    return originalFetch(resource, init);
  };

  // Light suppression of console output (keeps backups at window.console.__*)
  try {
    if (window.console) {
      ['log','info','warn','error','debug','table'].forEach(fn => {
        if (typeof window.console[fn] === 'function') {
          window.console['__' + fn] = window.console[fn];
          // replace with no-op to reduce casual leaks; developers can restore from __*
          window.console[fn] = function() {};
        }
      });
    }
  } catch (e) {}

  // Optional: simple devtools detector (not foolproof). hanya untuk deterrent UX.
  (function detectDevTools() {
    let open = false;
    const emit = (v) => {
      // can show a small visual if you want, currently we just suppress frequent logs
      open = v;
    };
    setInterval(function() {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      // threshold tuned for desktop devtools; mobile may vary
      if (widthDiff > 160 || heightDiff > 160) emit(true);
      else emit(false);
    }, 1000);
  })();

})();
