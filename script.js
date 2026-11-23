const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));
document.querySelector("#year").textContent = new Date().getFullYear();
const backTop = document.querySelector(".back-top");
window.addEventListener("scroll", () => backTop.classList.toggle("visible", window.scrollY > 450));
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));