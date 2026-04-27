const express = require('express');
const User = require('../models/User');
const Post = require('../models/Posts');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/multer');
const router = express.Router();

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('savedPosts');
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    const myPosts = await Post.find({ author: req.session.userId }).sort('-createdAt');
    const myComments = await Comment.find({ author: req.session.userId }).populate('post');
    res.render('profile', { 
      user, 
      myPosts, 
      myComments, 
      sessionUser: req.session 
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Lỗi server');
  }
});

// Upload avatar
router.post('/me/avatar', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không có file nào được upload' });
    }
    const avatarUrl = '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    await User.findByIdAndUpdate(req.session.userId, { avatar: avatarUrl });
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi upload avatar' });
  }
});

// Upload background
router.post('/me/background', isAuthenticated, upload.single('background'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không có file nào được upload' });
    }
    const bgUrl = '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    await User.findByIdAndUpdate(req.session.userId, { background: bgUrl });
    res.json({ success: true, background: bgUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi upload background' });
  }
});

router.get('/notifications', isAuthenticated, async (req, res) => {
  const notifs = await Notification.find({ recipient: req.session.userId })
    .sort('-createdAt')
    .populate('sender', 'username');
  res.render('notifications', { notifications: notifs, user: req.session });
});

//Lấy số lượng thông báo chưa đọc
router.get('/api/notifications/unread-count', isAuthenticated, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.session.userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.json({ count: 0 });
  }
});

//Đánh dấu một thông báo là đã đọc
router.post('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.session.userId },
      { read: true },
      { new: true }
    );
    if (notif) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Không tìm thấy thông báo' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//Đánh dấu tất cả thông báo là đã đọc
router.post('/api/notifications/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.session.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/notifications/:id/read', isAuthenticated, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// Lấy thông tin user hiện tại
router.get('/api/current', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId).select('username displayName role avatar');
  res.json({ success: true, user });
});

// Xem profile của user khác 
router.get('/profile/:userId', isAuthenticated, async (req, res) => {
  try {
    if (req.params.userId === req.session.userId.toString()) {
      return res.redirect('/users/me');
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('Không tìm thấy người dùng');
    
    const posts = await Post.find({ author: user._id, isHidden: false }).sort('-createdAt');
    
    res.render('userProfile', { 
      profileUser: user,  
      posts: posts,
      user: req.session    
    });
  } catch (err) {
    res.status(500).send('Lỗi server');
  }
});

module.exports = router;