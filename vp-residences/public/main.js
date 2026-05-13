/* ============================================
   VADIVEL PATTAMMAL RESIDENCES — main.js
   All interactivity: navbar, modal, gallery,
   lightbox, animations, booking form
   ============================================ */

'use strict';

/* ─── NAVBAR SCROLL EFFECT ─── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ─── MOBILE MENU ─── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('hamburger');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open')) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

/* ─── SCROLL REVEAL ANIMATIONS ─── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .feature-item, .unit-card, .amenity-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling elements
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        const delay = siblings.indexOf(entry.target) * 100;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ─── MODAL ─── */
function openModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset form state
  resetModal();
  // Set minimum date to today
  const dateInput = document.getElementById('inp-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  // Focus first input
  setTimeout(() => {
    const nameInput = document.getElementById('inp-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(resetModal, 300);
}

function resetModal() {
  const form = document.getElementById('modalForm');
  const success = document.getElementById('modalSuccess');
  if (form) form.style.display = '';
  if (success) success.classList.remove('show');

  // Clear inputs
  ['inp-name', 'inp-mobile', 'inp-date', 'inp-unit', 'inp-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Clear errors
  ['fg-name', 'fg-mobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });

  // Reset button
  const btn = document.getElementById('btnSubmit');
  if (btn) {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeModal();
  }
});

/* ─── FORM VALIDATION & SUBMISSION ─── */
function validateName(name) {
  return /^[A-Za-z\s]{2,60}$/.test(name.trim());
}

function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

function setFieldError(groupId, hasError) {
  const group = document.getElementById(groupId);
  if (!group) return;
  if (hasError) {
    group.classList.add('error');
  } else {
    group.classList.remove('error');
  }
}

async function submitBooking() {
  const name = document.getElementById('inp-name')?.value || '';
  const mobile = document.getElementById('inp-mobile')?.value || '';
  const date = document.getElementById('inp-date')?.value || '';
  const unitType = document.getElementById('inp-unit')?.value || '';
  const message = document.getElementById('inp-msg')?.value || '';

  // Validate
  let hasError = false;

  if (!validateName(name)) {
    setFieldError('fg-name', true);
    hasError = true;
  } else {
    setFieldError('fg-name', false);
  }

  if (!validateMobile(mobile)) {
    setFieldError('fg-mobile', true);
    hasError = true;
  } else {
    setFieldError('fg-mobile', false);
  }

  if (hasError) return;

  // Show loading state
  const btn = document.getElementById('btnSubmit');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  try {
    const response = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, date, unitType, message })
    });

    const data = await response.json();

    if (data.success) {
      // Show success state
      const form = document.getElementById('modalForm');
      const success = document.getElementById('modalSuccess');
      if (form) form.style.display = 'none';
      if (success) success.classList.add('show');
    } else {
      // Server returned an error
      alert(data.error || 'Something went wrong. Please try again.');
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }
  } catch (err) {
    console.error('Booking error:', err);
    alert('Unable to connect to the server. Please try again later.');
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

// Real-time validation on mobile (digits only)
document.addEventListener('DOMContentLoaded', () => {
  const mobileInput = document.getElementById('inp-mobile');
  if (mobileInput) {
    mobileInput.addEventListener('input', () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    });
    mobileInput.addEventListener('blur', () => {
      if (mobileInput.value && !validateMobile(mobileInput.value)) {
        setFieldError('fg-mobile', true);
      } else {
        setFieldError('fg-mobile', false);
      }
    });
  }

  const nameInput = document.getElementById('inp-name');
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      if (nameInput.value && !validateName(nameInput.value)) {
        setFieldError('fg-name', true);
      } else {
        setFieldError('fg-name', false);
      }
    });
  }

  // Kick off scroll animations
  initScrollReveal();

  // Gallery init (only on gallery page)
  if (document.getElementById('galleryGrid')) {
    initGallery();
  }
});

/* ─── GALLERY ─── */
let lightboxItems = [];
let lightboxIndex = 0;

function initGallery() {
  buildLightboxItems();

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterGallery(btn.dataset.filter);
    });
  });

  // Lightbox trigger on gallery items
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      // Find the visible index among currently shown items
      const visibleItems = Array.from(items).filter(i => i.style.display !== 'none');
      const visibleIndex = visibleItems.indexOf(item);
      openLightbox(visibleIndex === -1 ? index : visibleIndex);
    });
  });

  // Reveal gallery items with stagger
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(document.querySelectorAll('.gallery-item'));
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(item);
  });
}

function buildLightboxItems() {
  const items = document.querySelectorAll('.gallery-item');
  lightboxItems = Array.from(items).map(item => ({
    src: item.querySelector('img')?.src || '',
    title: item.dataset.title || '',
    sub: item.dataset.sub || '',
    el: item
  }));
}

function filterGallery(filter) {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    const cat = item.dataset.cat || '';
    const show = filter === 'all' || cat === filter;
    item.style.display = show ? '' : 'none';

    if (show) {
      // Re-animate
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 50);
    }
  });

  // Rebuild lightbox items for visible ones
  buildLightboxItems();
  lightboxItems = lightboxItems.filter(i => i.el.style.display !== 'none');
}

/* ─── LIGHTBOX ─── */
function openLightbox(index) {
  if (!lightboxItems.length) {
    buildLightboxItems();
  }
  lightboxIndex = Math.max(0, Math.min(index, lightboxItems.length - 1));
  updateLightbox();
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function updateLightbox() {
  const item = lightboxItems[lightboxIndex];
  if (!item) return;
  const img = document.getElementById('lightboxImg');
  const title = document.getElementById('lightboxTitle');
  const sub = document.getElementById('lightboxSub');
  if (img) img.src = item.src;
  if (title) title.textContent = item.title;
  if (sub) sub.textContent = item.sub;
}

function lightboxNav(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
  const img = document.getElementById('lightboxImg');
  if (img) {
    img.style.opacity = '0';
    setTimeout(() => {
      updateLightbox();
      img.style.opacity = '1';
    }, 150);
    img.style.transition = 'opacity 0.15s ease';
  }
}

function handleLightboxClick(e) {
  if (e.target === document.getElementById('lightbox')) {
    closeLightbox();
  }
}

// Keyboard nav for lightbox
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  }
});

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});

/* ─── PARALLAX on HERO IMAGE ─── */
(function initParallax() {
  const buildingCard = document.querySelector('.building-card');
  if (!buildingCard) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const img = buildingCard.querySelector('.building-img');
    if (img && scrolled < window.innerHeight) {
      img.style.transform = `scale(1) translateY(${scrolled * 0.05}px)`;
    }
  }, { passive: true });
})();
