// Like
async function handleLike(postId, btn) {
    try {
        const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
        const data = await res.json();
        
        const likeIcon = btn.querySelector('i');
        const likeCount = btn.querySelector('.like-count');
        if (likeCount) likeCount.innerText = data.likeCount;
        
        if (data.liked) {
            likeIcon.className = 'fas fa-heart';
            showToast('Đã thích bài viết', 'success');
        } else {
            likeIcon.className = 'far fa-heart';
            showToast('Đã bỏ thích', 'info');
        }
        
        // Cập nhật nút dislike nếu có
        const dislikeBtn = document.querySelector('.dislike-btn');
        if (dislikeBtn && data.dislikeCount !== undefined) {
            dislikeBtn.querySelector('.dislike-count').innerText = data.dislikeCount;
            dislikeBtn.querySelector('i').className = 'far fa-thumbs-down';
        }
    } catch (err) {
        showToast('Lỗi kết nối', 'danger');
    }
}

// Dislike
async function handleDislike(postId, btn) {
    try {
        const res = await fetch(`/posts/${postId}/dislike`, { method: 'POST' });
        const data = await res.json();
        
        // Cập nhật icon và count cho nút dislike
        const dislikeIcon = btn.querySelector('i');
        const dislikeCount = btn.querySelector('.dislike-count');
        if (dislikeCount) dislikeCount.innerText = data.dislikeCount;
        
        if (data.disliked) {
            dislikeIcon.className = 'fas fa-thumbs-down';
            showToast('Đã không thích', 'info');
        } else {
            dislikeIcon.className = 'far fa-thumbs-down';
            showToast('Đã bỏ không thích', 'info');
        }
        
        // Cập nhật nút like nếu có
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn && data.likeCount !== undefined) {
            likeBtn.querySelector('.like-count').innerText = data.likeCount;
            likeBtn.querySelector('i').className = 'far fa-heart';
        }
    } catch (err) {
        showToast('Lỗi kết nối', 'danger');
    }
}

// Save
async function handleSave(postId, btn) {
    try {
        const res = await fetch(`/posts/${postId}/save`, { method: 'POST' });
        const data = await res.json();
        
        const saveIcon = btn.querySelector('i');
        if (data.saved) {
            saveIcon.className = 'fas fa-bookmark';
            showToast('Đã lưu bài viết', 'success');
        } else {
            saveIcon.className = 'far fa-bookmark';
            showToast('Đã bỏ lưu', 'info');
        }
    } catch (err) {
        showToast('Lỗi kết nối', 'danger');
    }
}

// Share
function sharePost(postId) {
    navigator.clipboard.writeText(window.location.origin + '/posts/' + postId);
    showToast('Đã sao chép liên kết!', 'success');
}