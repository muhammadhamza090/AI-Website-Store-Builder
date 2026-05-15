"use client";

import * as React from "react";

/**
 * PAGE_MAP: Maps href paths (like "/shop") to page IDs for showPage().
 * Used to convert <a href="/shop"> clicks into showPage('shop') calls.
 */
const PAGE_MAP: Record<string, string> = {
  "/": "home",
  "/home": "home",
  "/shop": "shop",
  "/products": "shop",
  "/store": "shop",
  "/product": "product",
  "/cart": "cart",
  "/bag": "cart",
  "/checkout": "checkout",
  "/about": "about",
  "/about-us": "about",
  "/contact": "contact",
  "/contact-us": "contact",
  "/faq": "faq",
};

/**
 * Sanitize generated HTML to prevent iframe navigation issues.
 *
 * Problem: Claude generates <a href="/shop" onclick="showPage('shop')">
 * When clicked inside an iframe (srcDoc), the browser navigates the iframe
 * to localhost:3000/shop — loading the entire Next.js app inside the iframe,
 * which causes the "Page Unresponsive" freeze.
 *
 * Solution: Replace all dangerous href values with javascript:void(0),
 * and inject onclick handlers to call showPage() if not already present.
 *
 * CRITICAL: Only sanitize <a> tags in HTML portions — NEVER inside <script>
 * blocks. The regex would corrupt JavaScript template literals like:
 *   grid.innerHTML = `<a href="/product">...`
 * which breaks renderProductGrid() and causes empty product grids.
 * Dynamic links created by JS are handled by the MutationObserver + click
 * listener at runtime instead.
 */
function sanitizeHtmlForPreview(html: string): string {
  // Split HTML into script vs non-script chunks.
  // Only apply href sanitization to non-script chunks to avoid
  // corrupting JavaScript that builds product cards via innerHTML.
  const parts = html.split(/(<script[\s\S]*?<\/script>)/gi);

  for (let i = 0; i < parts.length; i++) {
    // Skip script blocks (odd indices from the split regex capture group)
    if (/^<script/i.test(parts[i])) continue;

    // Sanitize double-quoted hrefs
    parts[i] = parts[i].replace(
      /<a\s([^>]*?)href\s*=\s*"([^"]*?)"([^>]*?)>/gi,
      (_match, before, href, after) => sanitizeSingleLink(before, href, after)
    );

    // Sanitize single-quoted hrefs
    parts[i] = parts[i].replace(
      /<a\s([^>]*?)href\s*=\s*'([^']*?)'([^>]*?)>/gi,
      (_match, before, href, after) => sanitizeSingleLink(before, href, after)
    );
  }

  return parts.join("");
}

/** Shared logic for sanitizing a single <a> tag's href */
function sanitizeSingleLink(before: string, href: string, after: string): string {
  // Keep external URLs (http/https), anchors (#), and javascript: hrefs
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#") ||
    href.startsWith("javascript:") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return `<a ${before}href="${href}"${after}>`;
  }

  // Map the href to a page ID
  const path = "/" + href.replace(/^\.?\//, "").split("?")[0].split("#")[0];
  const normalizedPath = path.toLowerCase();
  const pageId =
    PAGE_MAP[normalizedPath] || PAGE_MAP["/" + href.toLowerCase()];

  // Check if onclick already exists
  const fullAttrs = before + after;
  const hasOnclick = /onclick\s*=/i.test(fullAttrs);

  const newHref = 'href="javascript:void(0)"';
  let onclickAttr = "";

  if (!hasOnclick && pageId) {
    onclickAttr = ` onclick="showPage('${pageId}')"`;
  }

  return `<a ${before}${newHref}${onclickAttr}${after}>`;
}

/**
 * Navigation guard script injected at the end of the HTML.
 *
 * This is the CRITICAL protection layer that prevents "Page Unresponsive" freezes.
 * It handles ALL edge cases that the static regex sanitization might miss:
 *
 * 1. MutationObserver — sanitizes dynamically created links (e.g., from renderProductGrid())
 * 2. Capture-phase click blocker — last-resort prevention for any unsanitized link
 * 3. showPage wrapper — defers heavy JS to prevent main-thread blocking
 * 4. localStorage/sessionStorage polyfill — prevents SecurityError crashes in sandboxed iframe
 * 5. beforeunload blocker — prevents accidental iframe self-navigation
 * 6. Form submission blocker — prevents form-based navigation
 */
const NAV_GUARD_SCRIPT = `<script>
(function() {
  var PAGE_MAP = {
    '/':'home','/home':'home',
    '/shop':'shop','/products':'shop','/store':'shop',
    '/product':'product',
    '/cart':'cart','/bag':'cart',
    '/checkout':'checkout',
    '/about':'about','/about-us':'about',
    '/contact':'contact','/contact-us':'contact',
    '/faq':'faq'
  };

  // ── 1. localStorage/sessionStorage POLYFILL ────────────────────────────────
  // Sandboxed iframes without allow-same-origin throw SecurityError on storage
  // access. This polyfill prevents JS crashes and keeps the cart functional
  // (in-memory only for preview).
  (function patchStorage() {
    function makeMemStore() {
      var d = {};
      return {
        getItem: function(k) { return d.hasOwnProperty(k) ? d[k] : null; },
        setItem: function(k, v) { d[k] = String(v); },
        removeItem: function(k) { delete d[k]; },
        clear: function() { d = {}; },
        get length() { return Object.keys(d).length; },
        key: function(i) { var ks = Object.keys(d); return i < ks.length ? ks[i] : null; }
      };
    }
    try { window.localStorage.getItem('__test'); } catch(e) {
      try { Object.defineProperty(window, 'localStorage', { value: makeMemStore(), writable: false }); } catch(e2) {}
    }
    try { window.sessionStorage.getItem('__test'); } catch(e) {
      try { Object.defineProperty(window, 'sessionStorage', { value: makeMemStore(), writable: false }); } catch(e2) {}
    }
  })();

  // ── 2. Sanitize a single link element ──────────────────────────────────────
  function sanitizeLink(a) {
    var h = a.getAttribute('href');
    if (!h) return;
    if (h.startsWith('#') || h.startsWith('javascript:') ||
        h.startsWith('http://') || h.startsWith('https://') ||
        h.startsWith('mailto:') || h.startsWith('tel:')) return;
    var path = '/' + h.replace(/^\\.?\\//, '').split('?')[0].split('#')[0];
    var pageId = PAGE_MAP[path.toLowerCase()];
    a.setAttribute('href', 'javascript:void(0)');
    if (!a.getAttribute('onclick') && pageId) {
      a.setAttribute('onclick', "showPage('" + pageId + "')");
    }
  }

  // ── 3. Sanitize ALL existing links in a root ──────────────────────────────
  function sanitizeAllLinks(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('a[href]').forEach(sanitizeLink);
  }

  // Run on existing DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { sanitizeAllLinks(document); });
  } else {
    sanitizeAllLinks(document);
  }

  // ── 4. MutationObserver — catch dynamically created links ─────────────────
  // This is CRITICAL: renderProductGrid(), showProduct(), renderCart() etc.
  // create new <a> elements via innerHTML that bypass the static regex.
  function startObserver() {
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue; // skip text nodes
          // If the added node is itself an <a>, sanitize it
          if (node.tagName === 'A') sanitizeLink(node);
          // Also sanitize any <a> descendants
          if (node.querySelectorAll) {
            node.querySelectorAll('a[href]').forEach(sanitizeLink);
          }
        }
      }
    });
    var target = document.body || document.documentElement;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    }
  }

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }

  // ── 5. Wrap showPage to be non-blocking ────────────────────────────────────
  // Uses a resilient approach: re-wraps on every call to handle redefinitions.
  (function wrapShowPage() {
    var _lastWrapped = null;

    function getWrapped() {
      var current = window.showPage;
      if (typeof current !== 'function') return null;
      // Already our wrapper — return as-is
      if (current.__isNavGuard) return current;
      // Wrap the real function
      var wrapped = function safeShowPage(pageId) {
        requestAnimationFrame(function() {
          try { current(pageId); } catch(e) { console.warn('[NavGuard] showPage error:', e); }
        });
      };
      wrapped.__isNavGuard = true;
      return wrapped;
    }

    // Initial wrap attempt
    var w = getWrapped();
    if (w) { window.showPage = w; _lastWrapped = w; }

    // Re-wrap after DOMContentLoaded (generated code may redefine showPage here)
    document.addEventListener('DOMContentLoaded', function() {
      var w2 = getWrapped();
      if (w2 && w2 !== _lastWrapped) { window.showPage = w2; _lastWrapped = w2; }
    });

    // Continuously check — generated code might define showPage on a timer
    var checks = 0;
    var interval = setInterval(function() {
      var w3 = getWrapped();
      if (w3 && w3 !== _lastWrapped) { window.showPage = w3; _lastWrapped = w3; }
      if (++checks >= 20) clearInterval(interval); // stop after ~10 seconds
    }, 500);
  })();

  // ── 6. Capture-phase click blocker (LAST RESORT) ──────────────────────────
  // Catches ANY click on an <a> with a dangerous href, even if the
  // MutationObserver hasn't sanitized it yet (race condition safety).
  document.addEventListener('click', function(e) {
    var link = e.target.closest ? e.target.closest('a') : null;
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    // This is a dangerous relative href — BLOCK IT
    e.preventDefault();
    e.stopImmediatePropagation();
    var path = '/' + href.replace(/^\\.?\\//, '').split('?')[0].split('#')[0];
    var pageId = PAGE_MAP[path.toLowerCase()];
    if (pageId && typeof window.showPage === 'function') {
      window.showPage(pageId);
    }
  }, true);

  // ── 7. Block beforeunload (prevent any iframe self-navigation) ────────────
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  });

  // ── 8. Block form submissions that would navigate ─────────────────────────
  document.addEventListener('submit', function(e) { e.preventDefault(); }, true);

  // ── 9. Block window.location assignments from generated JS ────────────────
  // Some generated code may do location.href = '/shop' which navigates the iframe.
  try {
    var _origAssign = window.location.assign.bind(window.location);
    var _origReplace = window.location.replace.bind(window.location);
    window.location.assign = function(url) {
      if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('javascript:')) {
        var path = '/' + url.replace(/^\\.?\\//, '').split('?')[0].split('#')[0];
        var pageId = PAGE_MAP[path.toLowerCase()];
        if (pageId && typeof window.showPage === 'function') { window.showPage(pageId); return; }
      }
      _origAssign(url);
    };
    window.location.replace = function(url) {
      if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('javascript:')) {
        var path = '/' + url.replace(/^\\.?\\//, '').split('?')[0].split('#')[0];
        var pageId = PAGE_MAP[path.toLowerCase()];
        if (pageId && typeof window.showPage === 'function') { window.showPage(pageId); return; }
      }
      _origReplace(url);
    };
  } catch(e) { /* location override not supported in this sandbox — click handler will catch it */ }
})();
</script>`;

/**
 * HtmlPreviewIframe — renders AI-generated HTML safely inside an iframe.
 * Sanitizes the HTML to prevent navigation-induced freezing.
 */
export function HtmlPreviewIframe({
  html,
  businessName,
  className = "h-[85vh]",
}: {
  html: string;
  businessName?: string;
  className?: string;
}) {
  const sanitizedHtml = React.useMemo(
    () => sanitizeHtmlForPreview(html) + NAV_GUARD_SCRIPT,
    [html]
  );

  return (
    <iframe
      srcDoc={sanitizedHtml}
      sandbox="allow-scripts allow-forms"
      className={`${className} w-full border-0`}
      title={
        businessName
          ? `${businessName} — AI-generated website preview`
          : "AI-generated website preview"
      }
    />
  );
}
