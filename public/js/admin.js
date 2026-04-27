// Xác nhận trước khi ẩn/bỏ ẩn bài viết
document.querySelectorAll('.hide-post-form, .unhide-post-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    const isHide = form.classList.contains('hide-post-form');
    const action = isHide ? 'ẩn' : 'bỏ ẩn';
    if (!confirm(`Bạn có chắc chắn muốn ${action} bài viết này?`)) {
      e.preventDefault();
    }
  });
});

// Xóa bài viết trực tiếp từ admin
document.querySelectorAll('.admin-delete-post').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Xóa bài viết vĩnh viễn? Hành động không thể hoàn tác.')) return;
    const postId = btn.dataset.id;
    try {
      const res = await fetch(`/posts/${postId}/delete`, { method: 'POST' });
      if (res.ok) {
        const row = btn.closest('tr');
        if (row) row.remove();
        showToast('Đã xóa bài viết', 'success');
        if (document.querySelectorAll('tbody tr').length === 0) {
          document.querySelector('tbody').innerHTML = '<tr><td colspan="4" class="text-muted">Không có bài viết nào bị báo cáo.</td></tr>';
        }
      } else {
        showToast('Lỗi khi xóa', 'danger');
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});