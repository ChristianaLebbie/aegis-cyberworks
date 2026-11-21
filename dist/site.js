
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
  const controls = carousel.querySelector('[data-carousel-controls]');
  const pause = controls.querySelector('[data-carousel-pause]');
  const photoMode = carousel.dataset.carousel === 'photos';
  const manual = carousel.hasAttribute('data-manual');
  const slides = [...track.children];
  let activePhoto = 0;
  let timer;
  let paused = slideMotion.matches;
  let visible = false;
  let hovering = false;

  function advance(direction) {
    if (photoMode) {
      slides[activePhoto].hidden = true;
      activePhoto = (activePhoto + direction + slides.length) % slides.length;
      slides[activePhoto].hidden = false;
      return;
    }
    const maximum = track.scrollWidth - track.clientWidth;
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    const position = track.scrollLeft;
    let target = position + direction * step;
    if (direction > 0 && position >= maximum - 2) target = 0;
    if (direction < 0 && position <= 2) target = maximum;
    track.scrollTo({ left: Math.max(0, Math.min(target, maximum)), behavior: slideMotion.matches ? 'instant' : 'smooth' });
  }

  function schedule() {
    clearInterval(timer);
    pause.textContent = paused ? 'Play' : 'Pause';
    if (!manual && visible && !paused && !document.hidden && !hovering && !carousel.contains(document.activeElement)) {
      timer = setInterval(() => advance(1), 5500);
    }
  }

  controls.hidden = false;
  pause.hidden = manual;
  controls.querySelector('[data-carousel-prev]').addEventListener('click', () => advance(-1));
  controls.querySelector('[data-carousel-next]').addEventListener('click', () => advance(1));
  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  if (!photoMode) {
    track.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    track.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  }
  document.addEventListener('visibilitychange', schedule);
  slideMotion.addEventListener('change', () => { if (slideMotion.matches) paused = true; schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(carousel);
  schedule();
}
