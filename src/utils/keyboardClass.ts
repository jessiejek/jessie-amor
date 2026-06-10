export function installKeyboardClass() {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const visualViewport = window.visualViewport;

  if (!visualViewport) return;

  const update = () => {
    const keyboardLikelyOpen = window.innerHeight - visualViewport.height > 120;
    root.classList.toggle("keyboard-open", keyboardLikelyOpen);
  };

  visualViewport.addEventListener("resize", update);
  visualViewport.addEventListener("scroll", update);

  window.addEventListener("orientationchange", () => {
    window.setTimeout(update, 250);
  });

  update();

  return () => {
    visualViewport.removeEventListener("resize", update);
    visualViewport.removeEventListener("scroll", update);
  };
}
