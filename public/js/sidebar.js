// Sidebar menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebarMenu = document.getElementById('sidebarMenu');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (menuToggle && sidebarMenu && sidebarOverlay) {
    // Mở menu
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      sidebarMenu.classList.add('open');
      sidebarOverlay.style.display = 'block';
    });
    
    // Đóng menu khi click ra ngoài
    sidebarOverlay.addEventListener('click', function() {
      sidebarMenu.classList.remove('open');
      sidebarOverlay.style.display = 'none';
    });
    
    // Đóng menu khi nhấn ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebarMenu.classList.contains('open')) {
        sidebarMenu.classList.remove('open');
        sidebarOverlay.style.display = 'none';
      }
    });
    
    const allLinks = sidebarMenu.querySelectorAll('a');
    allLinks.forEach(link => {
      link.addEventListener('click', function() {
        setTimeout(() => {
          sidebarMenu.classList.remove('open');
          sidebarOverlay.style.display = 'none';
        }, 150);
      });
    });
  }
});