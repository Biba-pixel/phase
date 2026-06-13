/* =====================================================================
   PHASE — interactions & motion
   Base behaviour uses no dependencies (IntersectionObserver).
   GSAP/ScrollTrigger are treated as progressive enhancement.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = root.classList.contains("reduced");
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }

  /* ----------------------------------------------------------------
     Year
     ---------------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------
     Preloader → hero intro
     ---------------------------------------------------------------- */
  var preloader = $("#preloader");

  function playHeroIntro() {
    var chars = $all(".hero__word .ch");
    var bits = $all(".hero__tag, .hero__sub, .hero__cta");
    if (reduced || !hasGSAP) {
      chars.forEach(function (c) { c.style.transform = "translateY(0)"; });
      bits.forEach(function (b) { b.style.opacity = 1; b.style.transform = "none"; });
      return;
    }
    var tl = gsap.timeline();
    tl.to(chars, { yPercent: -100, duration: 1.1, ease: "power4.out", stagger: 0.07 }, 0)
      .from(bits, { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.13 }, 0.5);
  }

  // Hide the preloader for good — pure DOM, never depends on GSAP firing.
  var preloaderDone = false;
  function hidePreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    if (preloader) {
      preloader.classList.add("is-done");
      preloader.style.transition = "opacity 0.5s ease, transform 0.7s cubic-bezier(0.76,0,0.24,1)";
      preloader.style.transform = "translateY(-100%)";
      preloader.style.opacity = "0";
      // remove from layout after the transition so it can never block the page
      setTimeout(function () { if (preloader) preloader.style.display = "none"; }, 750);
    }
    playHeroIntro();
  }

  function finishPreloader() {
    if (!preloader || reduced || !hasGSAP) { hidePreloader(); return; }
    var letters = $all(".preloader__word span");
    var bar = $(".preloader__bar i");
    // Animate the preloader in, then hand off to hidePreloader on complete.
    // hidePreloader is ALSO called by a hard timeout below, so a stalled GSAP
    // timeline can never leave the preloader stuck.
    gsap.timeline({ onComplete: hidePreloader })
      .to(letters, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.07 })
      .to(bar, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.25")
      .to({}, { duration: 0.2 });
  }

  // Run the intro shortly after load; a hard backstop guarantees the preloader
  // is gone within ~1.8s no matter what (GSAP present or not, load event or not).
  var started = false;
  function start() { if (started) return; started = true; finishPreloader(); }
  // Always defer (never call synchronously) so the rest of this script — the
  // reveal observer, nav, tab bar — finishes registering even if the preloader
  // animation path throws or hangs.
  on(window, "load", start);
  setTimeout(start, 600);
  // Absolute failsafe: force-hide the preloader even if everything above stalls.
  setTimeout(hidePreloader, 1800);

  /* ----------------------------------------------------------------
     Reveal on scroll (IntersectionObserver — reliable base layer)
     ---------------------------------------------------------------- */
  var revealEls = $all(".reveal, .mask, [data-reveal]");

  function showReveal(el) {
    if (el.classList.contains("is-visible")) return;
    var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
    if (delay) el.style.transitionDelay = delay + "ms";
    el.classList.add("is-visible");
    var drop = function () {
      el.classList.remove("reveal-pending");
      // Hard guarantee the element lands in its natural position even if the
      // class-based cascade is somehow defeated (stale styles, odd embeds):
      // clear the directional offset once the reveal has played.
      el.style.transform = "none";
      el.style.opacity = "1";
      el.style.filter = "none";
    };
    el.addEventListener("transitionend", drop, { once: true });
    setTimeout(drop, 1400 + delay);
  }

  if ("IntersectionObserver" in window && !reduced) {
    $all(".reveal").forEach(function (el) { el.classList.add("reveal-pending"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { showReveal(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });

    // --- Safety nets so nothing can stay stuck hidden/misaligned ---
    // (a) On scroll, reveal anything already in the viewport even if IO is laggy.
    var sweep = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { showReveal(el); io.unobserve(el); }
      });
    };
    on(window, "scroll", sweep, { passive: true });
    on(window, "resize", sweep, { passive: true });
    // (b) Run one sweep after layout settles, and a hard backstop that reveals
    //     EVERYTHING after 2.5s regardless — IO can misbehave in some embeds.
    setTimeout(sweep, 300);
    setTimeout(function () { revealEls.forEach(showReveal); }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
  // data-reveal hero bits are handled by the GSAP intro; ensure fallback
  $all("[data-reveal]").forEach(function (el) {
    el.style.opacity = el.style.opacity || "";
  });

  /* ----------------------------------------------------------------
     Nav: scrolled state + scroll progress
     ---------------------------------------------------------------- */
  var nav = $("#nav");
  var progress = $("#progress");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle("is-scrolled", y > 60);
      if (progress) {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      ticking = false;
    });
  }
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------- */
  var toggle = $("#navToggle");
  var menu = $("#menu");
  function setMenu(open) {
    if (!menu || !nav || !toggle) return;
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  on(toggle, "click", function () { setMenu(!menu.classList.contains("is-open")); });
  $all(".menu__list a").forEach(function (a) { on(a, "click", function () { setMenu(false); }); });
  on(document, "keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ----------------------------------------------------------------
     Smooth anchor scrolling (accounts for fixed nav)
     ---------------------------------------------------------------- */
  $all('a[href^="#"]').forEach(function (link) {
    on(link, "click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ----------------------------------------------------------------
     GSAP enhancements (parallax, hero quilt, marquee safety)
     ---------------------------------------------------------------- */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    // Hero quilt drift + fade on scroll
    var heroQuilt = $("#heroQuilt");
    if (heroQuilt) {
      gsap.to(heroQuilt, {
        yPercent: 18, scale: 1.1, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    gsap.to(".hero__inner", {
      yPercent: 14, opacity: 0.5, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    // Floating orbs parallax
    $all(".orb").forEach(function (orb, i) {
      gsap.to(orb, {
        yPercent: (i % 2 === 0 ? -28 : 24), ease: "none",
        scrollTrigger: { trigger: orb.closest("section") || orb, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // Brand badge gentle parallax
    var badge = $(".philosophy__badge");
    if (badge) {
      gsap.fromTo(badge, { yPercent: 8 }, {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: badge, start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    // Section heading subtle rise
    $all(".phases__head h2, .contact h2, .method__head h2").forEach(function (h) {
      gsap.from(h, {
        yPercent: 18, opacity: 0.4, ease: "none",
        scrollTrigger: { trigger: h, start: "top 92%", end: "top 50%", scrub: true }
      });
    });
  }

  /* ----------------------------------------------------------------
     Magnetic buttons (fine pointer only)
     ---------------------------------------------------------------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduced) {
    $all("[data-magnetic]").forEach(function (el) {
      var strength = 0.4;
      on(el, "mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      on(el, "mouseleave", function () { el.style.transform = "translate(0,0)"; });
    });

    // Card tilt for offers
    $all("[data-magnetic-card]").forEach(function (card) {
      on(card, "mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = "translateY(-8px) perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      on(card, "mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ----------------------------------------------------------------
     Custom cursor (fine pointer only)
     ---------------------------------------------------------------- */
  if (finePointer && !reduced) {
    var cursor = $(".cursor");
    var dot = $(".cursor-dot");
    if (cursor && dot) {
      document.body.classList.add("has-cursor");
      var cx = 0, cy = 0, tx = 0, ty = 0;
      on(window, "mousemove", function (e) {
        tx = e.clientX; ty = e.clientY;
        dot.style.transform = "translate(" + tx + "px," + ty + "px) translate(-50%,-50%)";
      });
      (function loop() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
        requestAnimationFrame(loop);
      })();
      $all("a, button, [data-magnetic], [data-magnetic-card]").forEach(function (el) {
        on(el, "mouseenter", function () { cursor.classList.add("is-hover"); });
        on(el, "mouseleave", function () { cursor.classList.remove("is-hover"); });
      });
      on(document, "mouseleave", function () { cursor.style.opacity = 0; dot.style.opacity = 0; });
      on(document, "mouseenter", function () { cursor.style.opacity = 1; dot.style.opacity = 1; });
    }
  }

  /* ----------------------------------------------------------------
     Active section in nav
     ---------------------------------------------------------------- */
  var sections = $all("main section[id]");
  var navLinks = $all(".nav__links a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (a) {
            var match = a.getAttribute("href") === "#" + id;
            a.style.opacity = match ? "1" : "";
            a.style.fontWeight = match ? "600" : "";
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ----------------------------------------------------------------
     Mobile bottom tab bar: reveal past the hero + highlight active tab
     ---------------------------------------------------------------- */
  var tabbar = $("#tabbar");
  if (tabbar) {
    var tabs = $all(".tab", tabbar);
    var hero = $(".hero");

    // Reveal the bar once the hero is mostly scrolled past
    var revealTab = function () {
      var past = hero ? window.pageYOffset > hero.offsetHeight * 0.6 : window.pageYOffset > 400;
      tabbar.classList.toggle("is-shown", past);
    };
    on(window, "scroll", revealTab, { passive: true });
    revealTab();

    // Map each content section to the tab that should light up for it.
    // (The center "Enquire" tab is an external WhatsApp link, so no section maps to it.)
    var sectionToTab = {
      philosophy: "method", method: "method",
      workshops: "workshops",
      about: "about", contact: "contact"
    };
    // Ordered list of sections we track, top→bottom
    var tracked = sections.filter(function (s) {
      return Object.prototype.hasOwnProperty.call(sectionToTab, s.getAttribute("id"));
    });

    var setActiveTab = function (want) {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", !!want && t.getAttribute("data-tab") === want);
      });
    };

    // "Current section" = the last one whose top has scrolled above an anchor
    // line ~40% down the viewport. Robust for very tall sections where a
    // centre-band test lags. Runs on the existing throttled scroll loop.
    var updateActiveTab = function () {
      var anchor = window.innerHeight * 0.4;
      var current = tracked[0];
      for (var i = 0; i < tracked.length; i++) {
        if (tracked[i].getBoundingClientRect().top <= anchor) current = tracked[i];
        else break;
      }
      setActiveTab(current ? sectionToTab[current.getAttribute("id")] : null);
    };
    on(window, "scroll", updateActiveTab, { passive: true });
    updateActiveTab();
  }
})();
