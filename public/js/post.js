document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const postId = btn.dataset.id;
    try {
      const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      
      const likeIcon = btn.querySelector('i');
      const likeCount = btn.querySelector('.like-count');
      likeCount.innerText = data.likeCount;
      
      if (data.liked) {
        likeIcon.className = 'fas fa-heart';
        showToast('Đã thích bài viết', 'success');
      } else {
        likeIcon.className = 'far fa-heart';
        showToast('Đã bỏ thích', 'info');
      }

      const dislikeBtn = document.querySelector('.dislike-btn');
      if (dislikeBtn && data.dislikeCount !== undefined) {
        dislikeBtn.querySelector('.dislike-count').innerText = data.dislikeCount;
        dislikeBtn.querySelector('i').className = 'far fa-thumbs-down';
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});

document.querySelectorAll('.dislike-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const postId = btn.dataset.id;
    try {
      const res = await fetch(`/posts/${postId}/dislike`, { method: 'POST' });
      const data = await res.json();
      
      const dislikeIcon = btn.querySelector('i');
      const dislikeCount = btn.querySelector('.dislike-count');
      dislikeCount.innerText = data.dislikeCount;
      
      if (data.disliked) {
        dislikeIcon.className = 'fas fa-thumbs-down';
        showToast('Đã không thích', 'info');
      } else {
        dislikeIcon.className = 'far fa-thumbs-down';
        showToast('Đã bỏ không thích', 'info');
      }

      const likeBtn = document.querySelector('.like-btn');
      if (likeBtn && data.likeCount !== undefined) {
        likeBtn.querySelector('.like-count').innerText = data.likeCount;
        likeBtn.querySelector('i').className = 'far fa-heart';
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});

document.querySelectorAll('.save-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const postId = btn.dataset.id;
    try {
      const res = await fetch(`/posts/${postId}/save`, { method: 'POST' });
      const data = await res.json();
      if (data.saved) {
        btn.querySelector('i').className = 'fas fa-bookmark';
        showToast('Đã lưu bài viết', 'success');
      } else {
        btn.querySelector('i').className = 'far fa-bookmark';
        showToast('Đã bỏ lưu', 'info');
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
});

document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = `${window.location.origin}/posts/${btn.dataset.id}`;
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép liên kết!', 'success');
  });
});

const submitReportBtn = document.getElementById('submitReport');
if (submitReportBtn) {
  submitReportBtn.addEventListener('click', async () => {
    const postId = document.querySelector('.report-btn')?.dataset.id;
    const reason = document.getElementById('reportReason').value.trim();
    if (!reason) {
      showToast('Vui lòng nhập lý do', 'danger');
      return;
    }
    try {
      const res = await fetch(`/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        showToast('Cảm ơn bạn đã báo cáo. Quản trị viên sẽ xem xét.', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
        if (modal) modal.hide();
        document.getElementById('reportReason').value = '';
      } else {
        const err = await res.json();
        showToast(err.error || 'Lỗi gửi báo cáo', 'danger');
      }
    } catch (err) {
      showToast('Lỗi kết nối', 'danger');
    }
  });
}

document.getElementById('commentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const postId = document.getElementById('commentForm').dataset.postid;
  const content = document.getElementById('commentContent').value.trim();
  
  if (!content) {
    showToast('Vui lòng nhập nội dung bình luận', 'warning');
    return;
  }

  try {
    const res = await fetch(`/comments/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    
    if (data.success) {
      const comment = data.comment;
      const commentsList = document.getElementById('commentsList');
      const commentHtml = `
        <div class="comment-item border-bottom pb-2 mb-2" data-id="${comment._id}">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong><i class="fas fa-user-circle"></i> ${escapeHtml(comment.author.displayName || comment.author.username)}</strong>
              <small class="text-muted ms-2">${new Date().toLocaleString('vi-VN')}</small>
              <p class="mt-1 mb-0">${escapeHtml(comment.content)}</p>
            </div>
            <button class="btn btn-sm btn-outline-danger delete-comment" data-id="${comment._id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      commentsList.insertAdjacentHTML('afterbegin', commentHtml);
      
      const emptyMsg = document.getElementById('emptyCommentsMsg');
      if (emptyMsg) emptyMsg.remove();
      
      const countSpan = document.getElementById('comment-count');
      countSpan.innerText = parseInt(countSpan.innerText) + 1;
      
      document.getElementById('commentContent').value = '';
      showToast('Đã thêm bình luận!', 'success');
    } else {
      showToast(data.error || 'Lỗi gửi bình luận', 'danger');
    }
  } catch (err) {
    showToast('Lỗi kết nối', 'danger');
  }
});

// ========== DELETE COMMENT ==========
document.getElementById('commentsList')?.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-comment');
  if (!deleteBtn) return;
  
  if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
  
  const commentId = deleteBtn.dataset.id;
  try {
    const res = await fetch(`/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      deleteBtn.closest('.comment-item').remove();
      const countSpan = document.getElementById('comment-count');
      countSpan.innerText = parseInt(countSpan.innerText) - 1;
      
      if (document.querySelectorAll('.comment-item').length === 0) {
        document.getElementById('commentsList').innerHTML = '<p class="text-muted" id="emptyCommentsMsg">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
      }
      showToast('Đã xóa bình luận', 'success');
    } else {
      showToast('Không thể xóa', 'danger');
    }
  } catch (err) {
    showToast('Lỗi kết nối', 'danger');
  }
});