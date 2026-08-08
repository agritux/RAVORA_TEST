(() => {
  const header = document.querySelector('.header');
  const menuButton = document.querySelector('.navigation-toggle');
  const mobileNav = document.querySelector('.navigation-mobile');
  const mobileClose = document.querySelector('.navigation-close');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});

  const closeMenu = () => {
    mobileNav?.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuButton?.setAttribute('aria-expanded','false');
    mobileNav?.setAttribute('aria-hidden','true');
  };
  const openMenu = () => {
    mobileNav?.classList.add('open');
    document.body.classList.add('nav-open');
    menuButton?.setAttribute('aria-expanded','true');
    mobileNav?.setAttribute('aria-hidden','false');
  };
  menuButton?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileNav?.addEventListener('click', event => { if(event.target === mobileNav) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.navigation-mobile a').forEach(link => link.addEventListener('click', closeMenu));

  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), {threshold:.12});
    reveals.forEach(element => observer.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('visible'));
  }
})();

(() => {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const previousButton = slider.querySelector('[data-hero-prev]');
  const nextButton = slider.querySelector('[data-hero-next]');
  const toggleButton = slider.querySelector('[data-hero-toggle]');
  const status = slider.querySelector('.hero-slider-status');
  const currentLabel = slider.querySelector('[data-hero-current]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (slides.length < 2) return;

  const AUTOPLAY_DELAY = 3500;
  let currentIndex = 0;
  let autoplayTimer = 0;
  let userPaused = false;
  let hoverPaused = false;
  let focusPaused = false;
  let pointerStart = null;

  const normalizeIndex = index => (index + slides.length) % slides.length;
  const canAutoplay = () => !reduceMotion.matches && !userPaused && !hoverPaused && !focusPaused && !document.hidden;

  const updateToggle = () => {
    if (!toggleButton) return;
    toggleButton.setAttribute('aria-pressed', String(userPaused));
    toggleButton.setAttribute('aria-label', userPaused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi duraklat');
  };

  const showSlide = (index, announce = false) => {
    currentIndex = normalizeIndex(index);
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.toggleAttribute('inert', !active);
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (currentLabel) currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
    if (status) {
      status.setAttribute('aria-live', announce ? 'polite' : 'off');
      if (announce) window.setTimeout(() => status.setAttribute('aria-live', 'off'), 500);
    }
    window.dispatchEvent(new CustomEvent('ravora:hero-slide-change', {detail:{index:currentIndex}}));
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    if (!canAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      showSlide(currentIndex + 1);
      scheduleAutoplay();
    }, AUTOPLAY_DELAY);
  };

  const goToSlide = index => {
    showSlide(index, true);
    scheduleAutoplay();
  };

  previousButton?.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextButton?.addEventListener('click', () => goToSlide(currentIndex + 1));
  dots.forEach(dot => dot.addEventListener('click', () => goToSlide(Number(dot.dataset.heroDot))));
  toggleButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    updateToggle();
    scheduleAutoplay();
  });

  slider.addEventListener('mouseenter', () => {
    hoverPaused = false;
    scheduleAutoplay();
  });
  slider.addEventListener('mouseleave', () => {
    hoverPaused = false;
    scheduleAutoplay();
  });
  slider.addEventListener('focusin', () => {
    focusPaused = true;
    scheduleAutoplay();
  });
  slider.addEventListener('focusout', event => {
    if (slider.contains(event.relatedTarget)) return;
    focusPaused = false;
    scheduleAutoplay();
  });
  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(currentIndex + 1);
    }
  });

  slider.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId};
    slider.setPointerCapture?.(event.pointerId);
  });
  slider.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    goToSlide(currentIndex + (deltaX < 0 ? 1 : -1));
  });
  slider.addEventListener('pointercancel', () => { pointerStart = null; });

  document.addEventListener('visibilitychange', scheduleAutoplay);
  reduceMotion.addEventListener?.('change', scheduleAutoplay);
  showSlide(0);
  updateToggle();
  scheduleAutoplay();
})();

(() => {
  const heroes = Array.from(document.querySelectorAll('.hero-home .hero-home-content.hero-home-content-aligned'));
  const brand = document.querySelector('.header .header-container .header-brand');
  if (!heroes.length || !brand) return;

  const alignHeroToLogo = () => {
    if (window.innerWidth <= 900) {
      heroes.forEach(hero => hero.style.setProperty('--hero-logo-align-x', '0px'));
      return;
    }
    heroes.forEach(hero => hero.style.setProperty('--hero-logo-align-x', '0px'));
    requestAnimationFrame(() => {
      const shift = brand.getBoundingClientRect().left - heroes[0].getBoundingClientRect().left;
      heroes.forEach(hero => hero.style.setProperty('--hero-logo-align-x', `${shift.toFixed(2)}px`));
    });
  };

  window.addEventListener('load', alignHeroToLogo);
  window.addEventListener('resize', alignHeroToLogo);
  document.addEventListener('DOMContentLoaded', alignHeroToLogo);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(alignHeroToLogo);
    observer.observe(document.documentElement);
    observer.observe(brand);
  }
})();

(() => {
  const page = document.body;
  if (!page.classList.contains('module-scroll-page')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const enhancedScroll = window.matchMedia('(min-width: 1180px) and (min-height: 760px) and (hover: hover) and (pointer: fine)');
  const modules = Array.from(document.querySelectorAll('main > .viewport-module'));
  const footer = document.querySelector('.footer');
  const targets = footer ? [...modules, footer] : modules;
  if (!modules.length) return;

  let animationFrame = 0;
  let animationActive = false;
  let wheelBurstActive = false;
  let wheelTotal = 0;
  let wheelTimer = 0;
  let enhancedScrollEnabled = false;

  const targetTop = element => Math.round(element.getBoundingClientRect().top + window.scrollY);
  const currentIndex = () => {
    const position = window.scrollY + window.innerHeight * .45;
    let bestIndex = 0;
    let bestDistance = Infinity;
    targets.forEach((target, index) => {
      const distance = Math.abs(targetTop(target) - position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const easeInOut = value => value < .5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

  const scrollToTarget = index => {
    const bounded = Math.max(0, Math.min(targets.length - 1, index));
    const destination = targetTop(targets[bounded]);
    const origin = window.scrollY;
    const distance = destination - origin;
    if (Math.abs(distance) < 2) return;

    cancelAnimationFrame(animationFrame);
    if (reduceMotion.matches) {
      window.scrollTo(0, destination);
      return;
    }

    animationActive = true;
    const duration = 820;
    const start = performance.now();
    const animate = now => {
      const progress = Math.min(1, (now - start) / duration);
      window.scrollTo(0, origin + distance * easeInOut(progress));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        animationActive = false;
        window.scrollTo(0, destination);
      }
    };
    animationFrame = requestAnimationFrame(animate);
  };

  const navigate = direction => {
    const index = currentIndex();
    const next = Math.max(0, Math.min(targets.length - 1, index + direction));
    if (next !== index) scrollToTarget(next);
  };

  const resetWheelBurst = () => {
    wheelBurstActive = false;
    wheelTotal = 0;
  };

  const resetContentZoom = () => {
    modules.forEach(module => {
      module.querySelectorAll('.hero-slide .container').forEach(content => { content.style.zoom = ''; });
      const content = fitSelectors.map(selector => module.querySelector(selector)).find(Boolean);
      if (content) content.style.zoom = '';
    });
  };

  const updateScrollMode = () => {
    enhancedScrollEnabled = enhancedScroll.matches && !reduceMotion.matches;
    document.documentElement.classList.toggle('module-scroll-enabled', enhancedScrollEnabled);
    if (!enhancedScrollEnabled) {
      cancelAnimationFrame(animationFrame);
      animationActive = false;
      clearTimeout(wheelTimer);
      resetWheelBurst();
      resetContentZoom();
    }
  };

  window.addEventListener('wheel', event => {
    if (!enhancedScrollEnabled) return;
    if (event.ctrlKey || document.body.classList.contains('nav-open')) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();

    clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(resetWheelBurst, 260);
    if (wheelBurstActive || animationActive) return;

    const normalized = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    wheelTotal += normalized;
    if (Math.abs(wheelTotal) < 24) return;

    wheelBurstActive = true;
    navigate(wheelTotal > 0 ? 1 : -1);
  }, {passive:false});

  document.addEventListener('keydown', event => {
    if (!enhancedScrollEnabled) return;
    if (document.body.classList.contains('nav-open')) return;
    const active = document.activeElement;
    const interactive = active && active.closest?.('input,textarea,select,button,a,[contenteditable="true"]');
    if (interactive) return;

    if (['ArrowDown','PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) {
      event.preventDefault();
      if (!animationActive) navigate(1);
    } else if (['ArrowUp','PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)) {
      event.preventDefault();
      if (!animationActive) navigate(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollToTarget(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollToTarget(targets.length - 1);
    }
  });

  const fitSelectors = [
    ':scope > .hero-slides > .hero-slide.is-active > .container',
    ':scope > .container',
    ':scope > .split-section-content',
    ':scope > .split-hero-content',
    ':scope > .split-hero-dark-content',
    ':scope > .split-layout-content'
  ];

  const fitModules = () => {
    if (!enhancedScrollEnabled) {
      resetContentZoom();
      return;
    }
    modules.forEach(module => {
      const content = fitSelectors.map(selector => module.querySelector(selector)).find(Boolean);
      if (!content) return;
      content.style.zoom = '';
      requestAnimationFrame(() => {
        const moduleRect = module.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const contentHeight = Math.max(content.scrollHeight, contentRect.height, 1);
        const contentWidth = Math.max(content.scrollWidth, contentRect.width, 1);
        const verticalRoom = Math.min(moduleRect.height - 16, content.clientHeight || moduleRect.height - 16);
        const horizontalRoom = Math.min(moduleRect.width - 16, content.clientWidth || moduleRect.width - 16);
        const verticalScale = verticalRoom / contentHeight;
        const horizontalScale = horizontalRoom / contentWidth;
        const scale = Math.min(1, verticalScale, horizontalScale);
        if (scale < .985) content.style.zoom = String(Math.max(.72, scale));
      });
    });
  };

  window.addEventListener('ravora:hero-slide-change', () => {
    requestAnimationFrame(fitModules);
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      updateScrollMode();
      fitModules();
    }, 120);
  });
  enhancedScroll.addEventListener?.('change', () => {
    updateScrollMode();
    fitModules();
  });
  reduceMotion.addEventListener?.('change', () => {
    updateScrollMode();
    fitModules();
  });
  updateScrollMode();
  window.addEventListener('load', () => {
    updateScrollMode();
    fitModules();
  });
  document.fonts?.ready.then(() => {
    updateScrollMode();
    fitModules();
  });
})();
