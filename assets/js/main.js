(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-close');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});
  const closeMenu = () => {
    mobileNav?.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuButton?.setAttribute('aria-expanded','false');
  };
  const openMenu = () => {
    mobileNav?.classList.add('open');
    document.body.classList.add('nav-open');
    menuButton?.setAttribute('aria-expanded','true');
  };
  menuButton?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileNav?.addEventListener('click', e => { if(e.target === mobileNav) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));

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