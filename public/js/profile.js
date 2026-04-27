document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const previewImg = this.closest('form')?.querySelector('img');
        if (previewImg) {
          previewImg.src = ev.target.result;
        }
      }.bind(this);
      reader.readAsDataURL(file);
    }
  });
});

document.querySelectorAll('.delete-post-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Xóa bài viết này vĩnh viễn?')) return;
    const postId = btn.dataset.id;
    try {
      const res = await fetch(`/posts/${postId}/delete`, { method: 'POST' });
      if (res.ok) {
        const postItem = btn.closest('.post-item');
        if (postItem) postItem.remove();
        showToast('Đã xóa bài viết', 'success');
      } else {
        showToast('Lỗi khi xóa', 'danger');
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});

document.querySelectorAll('.delete-comment-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Xóa bình luận này?')) return;
    const commentId = btn.dataset.id;
    try {
      const res = await fetch(`/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        btn.closest('.comment-item').remove();
        showToast('Đã xóa bình luận', 'success');
      } else {
        showToast('Lỗi khi xóa', 'danger');
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});