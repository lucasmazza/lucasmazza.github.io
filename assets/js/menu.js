document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('menu-action');
  const menu = document.getElementById('menu-target');
  button.addEventListener('click', function() {
    menu.classList.toggle('hidden');
  });
});
