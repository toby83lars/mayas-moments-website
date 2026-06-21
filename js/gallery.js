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
