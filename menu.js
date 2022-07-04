(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("menu-action");
    const menu = document.getElementById("menu-target");
    if (button && menu) {
      button.addEventListener("click", function() {
        menu.classList.toggle("hidden");
      });
    }
  });
})();
