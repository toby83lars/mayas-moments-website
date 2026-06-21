/* ================================================================
   Maya's Moments FL — Gallery Filter + Lightbox
   gallery.js  (loaded only on gallery.html)
   ================================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     GALLERY FILTER
     Buttons have data-filter="category-slug" (or "all").
     Gallery items have data-category="category-slug".
     ---------------------------------------------------------------- */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var galleryGrid   = document.querySelector('.gallery-grid');
  var galleryItems  = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.gallery-item')) : [];

  function applyFilter (category) {
    /* Brief opacity dip so the re-layout feels intentional */
    galleryGrid.classList.add('filtering');

    setTimeout(function () {
      var visibleCount = 0;

      galleryItems.forEach(function (item) {
        var match = category === 'all' || item.dataset.category === category;
        item.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      /* Show/hide empty-state message */
      var emptyMsg = galleryGrid.querySelector('.gallery-empty');
      if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';

      galleryGrid.classList.remove('filtering');
    }, 180);
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* Update active state */
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      applyFilter(btn.dataset.filter || 'all');

      /* Scroll filter bar to keep active button in view on mobile */
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  /* ----------------------------------------------------------------
     PINTEREST SHARE BUTTONS
     Injected dynamically so every photo -- present and future --
     gets a Pin button without touching gallery.html.
     ---------------------------------------------------------------- */
  var PINTEREST_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>';

  function makePinButton (img) {
    var btn = document.createElement('a');
    btn.className   = 'pin-btn';
    btn.title       = 'Save to Pinterest';
    btn.setAttribute('aria-label', 'Save to Pinterest');
    btn.innerHTML   = PINTEREST_SVG;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();  /* don't open lightbox */
      e.preventDefault();

      /* Build absolute image URL from the relative src */
      var base    = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
      var imgSrc  = img.getAttribute('src');
      var imgUrl  = imgSrc.startsWith('http') ? imgSrc : base + imgSrc;
      var pageUrl = window.location.href.split('?')[0];
      var desc    = encodeURIComponent("Maya’s Moments FL — Capturing Your Moments | mayasmomentsfl.com");

      var pinUrl = 'https://pinterest.com/pin/create/button/'
        + '?url='         + encodeURIComponent(pageUrl)
        + '&media='       + encodeURIComponent(imgUrl)
        + '&description=' + desc;

      window.open(pinUrl, '_blank', 'width=750,height=550,noopener,noreferrer');
    });

    return btn;
  }

  /* Add Pin button to every gallery item's overlay */
  galleryItems.forEach(function (item) {
    var img     = item.querySelector('img');
    var overlay = item.querySelector('.gallery-item-overlay');
    if (img && overlay) overlay.appendChild(makePinButton(img));
  });

  /* ----------------------------------------------------------------
     LIGHTBOX
     ---------------------------------------------------------------- */
  var lightbox     = document.getElementById('lightbox');
  var lightboxImg  = document.getElementById('lightbox-img');
  var lightboxCap  = document.getElementById('lightbox-caption');
  var closeBtn     = document.querySelector('.lightbox-close');
  var prevBtn      = document.querySelector('.lightbox-prev');
  var nextBtn      = document.querySelector('.lightbox-next');

  var visibleImages = [];
  var currentIndex  = 0;

  function getVisibleImages () {
    return galleryItems
      .filter(function (item) { return item.style.display !== 'none'; })
      .map(function (item) { return item.querySelector('img'); })
      .filter(Boolean);
  }

  function openLightbox (img) {
    visibleImages = getVisibleImages();
    currentIndex  = visibleImages.indexOf(img);

    showImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightbox.focus();
  }

  function closeLightbox () {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage (index) {
    var img = visibleImages[index];
    if (!img) return;

    lightboxImg.src    = img.src;
    lightboxImg.alt    = img.alt;
    lightboxCap.textContent = img.closest('.gallery-item').dataset.label || '';

    /* Show/hide prev-next if only one image */
    prevBtn.style.display = visibleImages.length > 1 ? '' : 'none';
    nextBtn.style.display = visibleImages.length > 1 ? '' : 'none';
  }

  function prev () {
    currentIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
    showImage(currentIndex);
  }

  function next () {
    currentIndex = (currentIndex + 1) % visibleImages.length;
    showImage(currentIndex);
  }

  /* Click on any gallery image to open lightbox */
  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      if (img) openLightbox(img);
    });
  });

  /* Close button */
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  /* Click outside the image to close */
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content') === false) {
        /* Only close if clicking the dark backdrop, not the image itself */
        if (e.target === lightbox) closeLightbox();
      }
    });
  }

  /* Arrow buttons */
  if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });

  /* Keyboard navigation */
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* Touch swipe for mobile lightbox */
  var touchStartX = null;

  if (lightbox) {
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      touchStartX = null;
    }, { passive: true });
  }

})();
