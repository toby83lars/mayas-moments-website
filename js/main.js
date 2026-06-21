/* ================================================================
   Maya's Moments FL — Shared Site JavaScript
   main.js  (loaded on every page)
   ================================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     Sticky header: add .scrolled class after a few pixels of scroll
     ---------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------
     Mobile nav toggle
     ---------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var headerEl  = document.querySelector('.site-header');

  if (navToggle && headerEl) {
    navToggle.addEventListener('click', function () {
      var isOpen = headerEl.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* Close mobile nav when a link is clicked */
    document.querySelectorAll('.nav-mobile-list .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        headerEl.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close mobile nav when clicking outside */
    document.addEventListener('click', function (e) {
      if (headerEl.classList.contains('nav-open') &&
          !headerEl.contains(e.target)) {
        headerEl.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------------
     Active nav link: mark the current page's nav link
     ---------------------------------------------------------------- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile-list .nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

})();
