
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

