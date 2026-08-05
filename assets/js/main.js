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
  const hero = document.querySelector('.hero-home .hero-home-content.hero-home-content-aligned');
  const brand = document.querySelector('.header .header-container .header-brand');
  if (!hero || !brand) return;

  const alignHeroToLogo = () => {
    if (window.innerWidth <= 900) {
      hero.style.setProperty('--hero-logo-align-x', '0px');
      return;
    }
    hero.style.setProperty('--hero-logo-align-x', '0px');
    requestAnimationFrame(() => {
      const shift = brand.getBoundingClientRect().left - hero.getBoundingClientRect().left;
      hero.style.setProperty('--hero-logo-align-x', `${shift.toFixed(2)}px`);
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
  const modules = Array.from(document.querySelectorAll('main > .viewport-module'));
  const footer = document.querySelector('.footer');
  const targets = footer ? [...modules, footer] : modules;
  if (!modules.length) return;

  document.documentElement.classList.add('module-scroll-enabled');

  let animationFrame = 0;
  let animationActive = false;
  let wheelBurstActive = false;
  let wheelTotal = 0;
  let wheelTimer = 0;

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

  window.addEventListener('wheel', event => {
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
    if (document.body.classList.contains('nav-open')) return;
    const active = document.activeElement;
    const typing = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
    if (typing) return;

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
    ':scope > .container',
    ':scope > .split-section-content',
    ':scope > .split-hero-content',
    ':scope > .split-hero-dark-content',
    ':scope > .split-layout-content'
  ];

  const fitModules = () => {
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

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fitModules, 120);
  });
  window.addEventListener('load', fitModules);
  document.fonts?.ready.then(fitModules);
})();
