// Hàm hiển thị toast thông báo
function showToast(message, type = 'success') {
  const toastHtml = `<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100"><div class="toast align-items-center text-white bg-${type} border-0" role="alert"><div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  const toastEl = document.body.lastElementChild.querySelector('.toast');
  const bsToast = new bootstrap.Toast(toastEl, { autohide: true, delay: 2000 });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.closest('.position-fixed')?.remove());
}

// Cập nhật badge thông báo
async function updateNotificationBadge() {
  try {
    const res = await fetch('/users/api/notifications/unread-count');
    const data = await res.json();
    const badge = document.getElementById('notificationBadge');
    const sidebarBadge = document.getElementById('sidebarBadge');
    if (badge) {
      badge.style.display = data.count > 0 ? 'inline-block' : 'none';
      badge.innerText = data.count > 99 ? '99+' : data.count;
    }
    if (sidebarBadge) {
      sidebarBadge.style.display = data.count > 0 ? 'inline-block' : 'none';
      sidebarBadge.innerText = data.count > 99 ? '99+' : data.count;
    }
  } catch (err) {}
}

// Load thông tin user hiện tại
async function loadUser() {
  try {
    const res = await fetch('/users/api/current');
    const data = await res.json();
    if (data.success) {
      const user = data.user;
      
      const sidebarAvatar = document.getElementById('sidebarAvatar');
      const sidebarDisplayName = document.getElementById('sidebarDisplayName');
      const sidebarUserInfo = document.getElementById('sidebarUserInfo');
      
      if (sidebarAvatar) sidebarAvatar.src = user.avatar || 'https://ui-avatars.com/api/?background=0D8F81&color=fff&name=' + encodeURIComponent(user.displayName || user.username);
      if (sidebarDisplayName) sidebarDisplayName.innerText = user.displayName || user.username;
      if (sidebarUserInfo) sidebarUserInfo.innerHTML = '@' + user.username + ' • ' + (user.role === 'admin' ? 'Quản trị viên' : 'Thành viên');
      
      const currentUsername = document.getElementById('currentUsername');
      const newDisplayName = document.getElementById('newDisplayName');
      if (currentUsername) currentUsername.innerText = user.username;
      if (newDisplayName) newDisplayName.value = user.displayName || user.username;
    }
  } catch (err) {}
}

// Khởi tạo theme
function initTheme() {
  const darkCSS = document.getElementById('theme-css');
  const themeSwitch = document.getElementById('themeSwitch');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  if (!darkCSS) return;
  
  const isDark = localStorage.getItem('theme') === 'dark';
  darkCSS.disabled = !isDark;
  if (themeSwitch) themeSwitch.checked = isDark;
  if (themeIcon) themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  if (themeText) themeText.innerText = isDark ? 'Chế độ sáng' : 'Chế độ tối';
  
  if (themeSwitch) {
    themeSwitch.addEventListener('change', function() {
      const newIsDark = this.checked;
      darkCSS.disabled = !newIsDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (themeIcon) themeIcon.className = newIsDark ? 'fas fa-sun' : 'fas fa-moon';
      if (themeText) themeText.innerText = newIsDark ? 'Chế độ sáng' : 'Chế độ tối';
    });
  }
}

// Upload ảnh chung cho Quill
async function uploadImage(file, quill, progressDivId = 'uploadProgress') {
  const progressDiv = document.getElementById(progressDivId);
  if (progressDiv) progressDiv.style.display = 'block';
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch('/posts/upload-image', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', data.url);
      quill.setSelection(range.index + 1);
      return true;
    } else {
      showToast('Upload ảnh thất bại: ' + (data.error || 'Lỗi không xác định'), 'danger');
      return false;
    }
  } catch (err) {
    showToast('Lỗi kết nối khi upload ảnh', 'danger');
    return false;
  } finally {
    if (progressDiv) progressDiv.style.display = 'none';
  }
}

// Upload file tài liệu cho Quill
async function uploadFile(file, quill, progressDivId = 'uploadProgress') {
  const progressDiv = document.getElementById(progressDivId);
  if (progressDiv) progressDiv.style.display = 'block';
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch('/posts/upload-file', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.success) {
      const range = quill.getSelection(true);
      const linkHtml = `<p><a href="${data.url}" target="_blank" download>📄 ${file.name}</a></p>`;
      quill.clipboard.dangerouslyPasteHTML(range.index, linkHtml);
      quill.setSelection(range.index + 1);
      return true;
    } else {
      showToast('Upload file thất bại: ' + (data.error || 'Lỗi không xác định'), 'danger');
      return false;
    }
  } catch (err) {
    showToast('Lỗi kết nối khi upload file', 'danger');
    return false;
  } finally {
    if (progressDiv) progressDiv.style.display = 'none';
  }
}

// Khởi tạo Quill editor
function initQuillEditor(placeholder, toolbarOptions, existingContent = null) {
  const quill = new Quill('#editor', { theme: 'snow', modules: { toolbar: toolbarOptions }, placeholder });
  if (existingContent) quill.root.innerHTML = existingContent;
  
  quill.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => { 
      if (input.files[0]) await uploadImage(input.files[0], quill); 
    };
  });
  
  quill.root.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await uploadImage(file, quill);
        break;
      }
    }
  });
  
  quill.root.addEventListener('drop', async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith('image/')) await uploadImage(file, quill);
    }
  });
  quill.root.addEventListener('dragover', (e) => e.preventDefault());
  
  return quill;
}

// Escape HTML
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Khởi tạo khi DOM load - CHỈ 1 LẦN
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNotificationBadge();
  loadUser();
  setInterval(updateNotificationBadge, 30000);
});