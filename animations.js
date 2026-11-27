const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && !reducedMotion.matches)
      entry.target.animation.play();
    else entry.target.animation.pause();
  }
});
for (const container of document.querySelectorAll("[data-animation]")) {
  const artwork = window.aegisArtwork[container.dataset.animation];
  container.animation = window.lottie.loadAnimation({
    container,
    renderer: "svg",
    animationData: artwork,
    loop: true,
    autoplay: false,
  });

  if (container.classList.contains("network-service-motion")) {
    container.animation.addEventListener("DOMLoaded", () =>
      container.classList.add("is-ready"),
    );
    const media = container.parentElement;
    media.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" || reducedMotion.matches) return;
        const rect = media.getBoundingClientRect();
        const horizontal = (event.clientX - rect.left) / rect.width - 0.5;
        const vertical = (event.clientY - rect.top) / rect.height - 0.5;
        container.style.setProperty("--network-x", -vertical * 10 + "deg");
        container.style.setProperty("--network-y", horizontal * 10 + "deg");
      },
      { passive: true },
    );
    media.addEventListener("pointerleave", () => {
      container.style.removeProperty("--network-x");
      container.style.removeProperty("--network-y");
    });
  }
  observer.observe(container);
}
reducedMotion.addEventListener("change", () => {
  for (const container of document.querySelectorAll("[data-animation]")) {
    observer.unobserve(container);
    observer.observe(container);
  }
});
