const express = require('express');
const User = require('../models/User');
const Post = require('../models/Posts');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Trang admin - bài viết bị báo cáo
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  const reportedPosts = await Post.find({ 'reports.0': { $exists: true }, isHidden: false }).populate('author');
  res.render('admin', { posts: reportedPosts, user: req.session });
});

// Danh sách bài viết đã ẩn
router.get('/hidden', isAuthenticated, isAdmin, async (req, res) => {
  const hiddenPosts = await Post.find({ isHidden: true }).populate('author');
  res.render('adminHidden', { posts: hiddenPosts, user: req.session });
});

// Ẩn bài viết
router.post('/hide/:id', isAuthenticated, isAdmin, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { isHidden: true });
  res.redirect('/admin');
});

// Bỏ ẩn bài viết
router.post('/unhide/:id', isAuthenticated, isAdmin, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { isHidden: false });
  res.redirect('/admin/hidden');
});

// Quản lý user
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.render('adminUsers', { users, user: req.session });
});

// Tạo user mới
router.post('/users/create', isAuthenticated, isAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;
  const bcrypt = require('bcrypt');
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashed, role: role || 'user' });
  res.redirect('/admin/users');
});

// Sửa user
router.post('/users/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  const { username, email, role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { username, email, role });
  res.redirect('/admin/users');
});

// Xóa user
router.post('/users/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  if (req.params.id === req.session.userId.toString()) {
    return res.status(400).send('Không thể xóa chính mình');
  }
  await User.findByIdAndDelete(req.params.id);
  await Post.deleteMany({ author: req.params.id });
  res.redirect('/admin/users');
});

const Tag = require('../models/Tag');

//Lấy tất cả tags
router.get('/api/tags', isAuthenticated, async (req, res) => {
  const tags = await Tag.find().sort('name');
  res.json({ success: true, tags: tags.map(t => t.name) });
});

module.exports = router;