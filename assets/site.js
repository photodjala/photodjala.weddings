/* PhotoDjala — zajednicka skripta */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loading screen (samo pocetna) ---------- */

  var loader = document.getElementById('loader');
  if (loader) {
    document.body.classList.add('is-loading');

    var MIN_MS = reduced ? 500 : 2100;
    var MAX_MS = reduced ? 1200 : 4500;
    var started = Date.now();
    var hidden = false;

    var hideLoader = function () {
      if (hidden) return;
      hidden = true;
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 1000);
    };

    var finish = function () {
      window.setTimeout(hideLoader, Math.max(0, MIN_MS - (Date.now() - started)));
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);

    window.setTimeout(hideLoader, MAX_MS);
  }

  /* ---------- header + mobilni meni ---------- */

  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileNav');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });

    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------- reveal na skrol ---------- */

  var revealTargets = document.querySelectorAll('[data-reveal], .shot, .portfolio-item');

  if (revealTargets.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible', 'visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      Array.prototype.forEach.call(revealTargets, function (el) { observer.observe(el); });
    } else {
      Array.prototype.forEach.call(revealTargets, function (el) {
        el.classList.add('is-visible', 'visible');
      });
    }
  }

  /* ---------- cijene paketa po broju zvanica ---------- */

  var guestSelector = document.getElementById('guestSelector');

  if (guestSelector) {
    var packagePrices = {
      small:  { essential: 700,  signature: 1400, premium: 2000 },
      medium: { essential: 800,  signature: 1600, premium: 2200 },
      large:  { essential: 1000, signature: 1800, premium: 2500 }
    };

    var guestOptions = document.querySelectorAll('.guest-option');
    var priceElements = document.querySelectorAll('.price[data-package]');

    var updatePackagePrices = function (tier, index) {
      if (!packagePrices[tier]) return;

      guestSelector.style.setProperty('--tier-index', index);

      Array.prototype.forEach.call(guestOptions, function (option) {
        option.classList.toggle('active', option.dataset.tier === tier);
      });

      Array.prototype.forEach.call(priceElements, function (priceEl) {
        priceEl.classList.add('price-changing');
        window.setTimeout(function () {
          priceEl.textContent = packagePrices[tier][priceEl.dataset.package] + ' KM';
          priceEl.classList.remove('price-changing');
        }, 170);
      });
    };

    Array.prototype.forEach.call(guestOptions, function (option) {
      option.addEventListener('click', function () {
        updatePackagePrices(option.dataset.tier, Number(option.dataset.index));
      });
    });
  }

  /* ---------- lightbox galerije ---------- */

  var shots = document.querySelectorAll('.shot');
  var lightbox = document.getElementById('lightbox');

  if (shots.length && lightbox) {
    var lbImage = lightbox.querySelector('img');
    var lbCount = lightbox.querySelector('.lb-count');
    var current = 0;

    var show = function (index) {
      current = (index + shots.length) % shots.length;
      var source = shots[current].querySelector('img');
      lbImage.src = source.dataset.full || source.src;
      lbImage.alt = source.alt;
      if (lbCount) lbCount.textContent = (current + 1) + ' / ' + shots.length;
    };

    var openBox = function (index) {
      show(index);
      lightbox.classList.add('is-open');
      document.body.classList.add('nav-open');
    };

    var closeBox = function () {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };

    Array.prototype.forEach.call(shots, function (shot, index) {
      shot.addEventListener('click', function () { openBox(index); });
    });

    lightbox.querySelector('.lb-close').addEventListener('click', closeBox);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeBox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeBox();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }
})();
