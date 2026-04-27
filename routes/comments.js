const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Posts');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/security');
const router = express.Router();

// Tạo bình luận mới
router.post('/:postId', isAuthenticated, sanitizeInput, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Nội dung bình luận không được để trống' });
    }

    // Tạo comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.session.userId,
      post: req.params.postId
    });

    // Lấy thông tin author
    const user = await User.findById(req.session.userId).select('username displayName avatar');

    // Lấy bài viết để gửi thông báo
    const post = await Post.findById(req.params.postId);

    // Gửi thông báo cho chủ bài viết
    if (post.author.toString() !== req.session.userId) {
      await Notification.create({
        recipient: post.author,
        sender: req.session.userId,
        type: 'comment',
        post: post._id,
        message: `đã bình luận: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
      });
    }
    
    res.json({
      success: true,
      comment: {
        _id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName || user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    console.error('Lỗi tạo comment:', err);
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại' });
  }
});

// Xóa bình luận
router.delete('/:commentId', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận' });
    }
    if (comment.author.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bình luận này' });
    }
    await comment.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;