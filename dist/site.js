
const root = document.documentElement;
const theme = document.querySelector('#theme');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
function usesDarkMode() {
  return root.dataset.theme === 'dark' || (!root.dataset.theme && systemDark.matches);
}
function updateThemeButton() {
  const dark = usesDarkMode();
  theme.textContent = dark ? '☀' : '☾';
  theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
theme.addEventListener('click', () => {
  root.dataset.theme = usesDarkMode() ? 'light' : 'dark';
  try { localStorage.setItem('aegis-theme', root.dataset.theme); } catch {}
  updateThemeButton();
});
systemDark.addEventListener('change', updateThemeButton);
updateThemeButton();

const menu = document.querySelector('#menu');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
const header = document.querySelector('header');
function updateHeader() { header.classList.toggle('scrolled', scrollY > 32); }
addEventListener('scroll', updateHeader, { passive:true });
updateHeader();

const reasons = [...document.querySelectorAll('#reasons details')];
const tiles = [...document.querySelectorAll('.tile')];
function updateTiles() {
  tiles.forEach((tile, index) => {
    tile.classList.toggle('active', reasons[index].open);
    tile.setAttribute('aria-pressed', String(reasons[index].open));
  });
}
tiles.forEach((tile, index) => {
  tile.addEventListener('click', () => { reasons[index].open = !reasons[index].open; });
  reasons[index].addEventListener('toggle', updateTiles);
});
updateTiles();

const inquiry = document.querySelector('#inquiry');
inquiry?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(inquiry);
  const subject = encodeURIComponent(data.get('subject'));
  const body = encodeURIComponent([
    'Name: ' + data.get('name'),
    'Email: ' + data.get('email'),
    'Phone: ' + data.get('phone'),
    '',
    data.get('message')
  ].join('\r\n'));
  location.href = 'mailto:info@aegiscyberworks.com?subject=' + subject + '&body=' + body;
});


const articleSearch = document.querySelector('#article-search');
if (articleSearch) {
  const filter = articleSearch.querySelector('input');
  const status = articleSearch.querySelector('[role="status"]');
  const cards = [...document.querySelectorAll('#latest .media-card, #archive .media-card')];
  const sections = [...document.querySelectorAll('#latest, #archive')];
  articleSearch.hidden = false;
  filter.addEventListener('input', () => {
    const query = filter.value.toLowerCase().trim();
    let matches = 0;
    for (const card of cards) {
      card.hidden = !card.textContent.toLowerCase().includes(query);
      if (!card.hidden) matches += 1;
    }
    for (const section of sections) {
      section.hidden = !section.querySelector('.media-card:not([hidden])');
    }
    status.textContent = query ? matches + (matches === 1 ? ' article found' : ' articles found') : '';
  });
}

const slideMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const carousel of document.querySelectorAll('[data-carousel]')) {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = [...track.children];
  if (slides.length < 2) continue;

  const photos = carousel.dataset.carousel === 'photos';
  let active = 0;
  let visible = false;
  let hovering = false;
  let timer;

  if (photos) {
    slides[0].classList.add('current-photo');
    for (const slide of slides) slide.hidden = false;
    track.classList.add('photos-ready');
  }

  function advance() {
    if (photos) {
      slides[active].classList.remove('current-photo');
      active = (active + 1) % slides.length;
      slides[active].classList.add('current-photo');
      return;
    }

    const max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    const next = track.scrollLeft >= max - 4 ? 0 : Math.min(track.scrollLeft + step, max);
    track.scrollTo({ left: next, behavior: 'smooth' });
  }

  function schedule() {
    clearInterval(timer);
    if (visible && !slideMotion.matches && !document.hidden && !hovering && !carousel.contains(document.activeElement)) {
      timer = setInterval(advance, 5500);
    }
  }

  if (!photos && carousel.id !== 'testimonials') {
    track.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    track.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    carousel.addEventListener('focusin', schedule);
    carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  }

  document.addEventListener('visibilitychange', schedule);
  slideMotion.addEventListener('change', schedule);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(carousel);
}
