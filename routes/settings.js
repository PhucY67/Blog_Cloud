const express = require('express');
const User = require('../models/User');
const Post = require('../models/Posts');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// Lưu trữ yêu cầu xoá tạm thời
const deleteRequests = new Map();

// Trang cài đặt
router.get('/', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('settings', { user: { userId: req.session.userId, username: user.username, role: user.role, avatar: user.avatar } });
});

// Đổi mật khẩu
router.post('/change-password', isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.session.userId);
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.session.userId, { password: hashed });
  res.json({ success: true });
});

// Yêu cầu xoá tài khoản (xoá sau 1 giờ)
router.post('/request-delete', isAuthenticated, async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.session.userId);
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ error: 'Mật khẩu không đúng' });
  
  const deleteTime = Date.now() + 60 * 60 * 1000; // 1 giờ
  deleteRequests.set(req.session.userId, { deleteTime, timer: null });
  
  // Đặt thời gian xoá
  const timer = setTimeout(async () => {
    const userData = await User.findById(req.session.userId);
    if (userData) {
      await Post.deleteMany({ author: req.session.userId });
      await Comment.deleteMany({ author: req.session.userId });
      await Notification.deleteMany({ recipient: req.session.userId });
      await User.findByIdAndDelete(req.session.userId);
      deleteRequests.delete(req.session.userId);
    }
  }, 60 * 60 * 1000);
deleteRequests.set(req.session.userId, { deleteTime, timer });
  res.json({ success: true });
});

// Kiểm tra trạng thái xoá
router.get('/delete-status', isAuthenticated, async (req, res) => {
  const request = deleteRequests.get(req.session.userId);
  if (request && request.deleteTime > Date.now()) {
    res.json({ pending: true, remainingSeconds: Math.floor((request.deleteTime - Date.now()) / 1000) });
  } else {
    if (request) {
      clearTimeout(request.timer);
      deleteRequests.delete(req.session.userId);
    }
    res.json({ pending: false });
  }
});

// Huỷ yêu cầu xoá
router.post('/cancel-delete', isAuthenticated, async (req, res) => {
  const request = deleteRequests.get(req.session.userId);
  if (request) {
    clearTimeout(request.timer);
    deleteRequests.delete(req.session.userId);
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Không có yêu cầu xoá nào' });
  }
});

// Đổi tên hiển thị
router.post('/rename', isAuthenticated, async (req, res) => {
  const { newDisplayName } = req.body;
  if (!newDisplayName || newDisplayName.length < 2 || newDisplayName.length > 30) {
    return res.status(400).json({ error: 'Tên hiển thị phải từ 2-30 ký tự' });
  }
  await User.findByIdAndUpdate(req.session.userId, { displayName: newDisplayName });
  res.json({ success: true });
});
module.exports = router;