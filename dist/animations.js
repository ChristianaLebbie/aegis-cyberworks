
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !reducedMotion.matches) entry.target.animation.play();
    else entry.target.animation.pause();
  }
});
for (const container of document.querySelectorAll('[data-animation]')) {
  const artwork = window.aegisArtwork[container.dataset.animation];
  container.animation = window.lottie.loadAnimation({
    container,
    renderer:'svg',
    animationData:artwork,
    loop:true,
    autoplay:false
  });
  observer.observe(container);
}
reducedMotion.addEventListener('change', () => {
  for (const container of document.querySelectorAll('[data-animation]')) {
    observer.unobserve(container);
    observer.observe(container);
  }
});

