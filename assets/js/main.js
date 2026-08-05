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
  mobileNav?.addEventListener('click', e => { if(e.target === mobileNav) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.navigation-mobile a').forEach(a => a.addEventListener('click', closeMenu));

  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    }), {threshold:.12});
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }
})();

(function () {
  var hero = document.querySelector('.hero-home .hero-home-content.hero-home-content-aligned');
  var brand = document.querySelector('.header .header-container .header-brand');
  if (!hero || !brand) return;

  function alignHeroToLogo() {
    if (window.innerWidth <= 900) {
      hero.style.setProperty('--hero-logo-align-x', '0px');
      return;
    }

    
    hero.style.setProperty('--hero-logo-align-x', '0px');
    requestAnimationFrame(function () {
      var logoLeft = brand.getBoundingClientRect().left;
      var heroLeft = hero.getBoundingClientRect().left;
      var shift = logoLeft - heroLeft;
      hero.style.setProperty('--hero-logo-align-x', shift.toFixed(2) + 'px');
    });
  }

  window.addEventListener('load', alignHeroToLogo);
  window.addEventListener('resize', alignHeroToLogo);
  document.addEventListener('DOMContentLoaded', alignHeroToLogo);

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(alignHeroToLogo);
    ro.observe(document.documentElement);
    ro.observe(brand);
  }
})();
