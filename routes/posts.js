const express = require('express');
const upload = require('../middleware/multer');
const Post = require('../models/Posts');  
const User = require('../models/User');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');
const { sanitizeHtmlContent } = require('../middleware/security');
const router = express.Router();

// Hiển thị form tạo bài viết
router.get('/create', isAuthenticated, (req, res) => {
  res.render('createPost', { user: req.session });
});

// Xử lý tạo bài viết mới
router.post('/create', isAuthenticated, sanitizeHtmlContent, async (req, res) => {
  const { title, content, tags } = req.body;
  
  if (!title || !content) return res.status(400).send('Thiếu dữ liệu');
  
  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
  await Post.create({ title, content, tags: tagArray, author: req.session.userId });
  res.redirect('/posts');
});

// Upload ảnh
router.post('/upload-image', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không có file nào được upload' });
    }
    const imageUrl = '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi upload ảnh' });
  }
});

// Upload file
router.post('/upload-file', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Không có file nào được upload' });
    }
    const fileUrl = '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    res.json({ success: true, url: fileUrl, location: fileUrl, files: [fileUrl], filename: req.file.originalname });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi upload file' });
  }
});

// Xem bài viết chi tiết
router.get('/:id', isAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username displayName avatar');
  if (!post || post.isHidden) return res.status(404).send('Bài viết không tồn tại');
  const comments = await require('../models/Comment').find({ post: post._id }).populate('author', 'username displayName avatar')
  const user = await User.findById(req.session.userId).populate('savedPosts');
  res.render('postDetail', { post, comments, user: { userId: req.session.userId, role: req.session.role, savedPosts: user.savedPosts } });
});

// LIKE
router.post('/:id/like', isAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Bài viết không tồn tại' });
  
  const userId = req.session.userId;
  const alreadyLiked = post.likes.includes(userId);
  const alreadyDisliked = post.dislikes.includes(userId);
  
  if (alreadyLiked) {
    post.likes.pull(userId);
    await post.save();
    return res.json({ liked: false, likeCount: post.likes.length });
  } else {
    post.likes.push(userId);
    if (alreadyDisliked) {
      post.dislikes.pull(userId);
    }
    await post.save();
    
    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: post._id,
        message: 'đã thích bài viết của bạn'
      });
    }
    return res.json({ liked: true, likeCount: post.likes.length, dislikeCount: post.dislikes.length });
  }
});

// DISLIKE
router.post('/:id/dislike', isAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Bài viết không tồn tại' });
  
  const userId = req.session.userId;
  const alreadyDisliked = post.dislikes.includes(userId);
  const alreadyLiked = post.likes.includes(userId);
  
  if (alreadyDisliked) {
    post.dislikes.pull(userId);
    await post.save();
    return res.json({ disliked: false, dislikeCount: post.dislikes.length });
  } else {
    post.dislikes.push(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    }
    await post.save();
    return res.json({ disliked: true, dislikeCount: post.dislikes.length, likeCount: post.likes.length });
  }
});

// SAVE / UNSAVE
router.post('/:id/save', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const postId = req.params.id;
  const saved = user.savedPosts.includes(postId);
  if (saved) {
    user.savedPosts.pull(postId);
    await user.save();
    return res.json({ saved: false });
  } else {
    user.savedPosts.push(postId);
    await user.save();
    return res.json({ saved: true });
  }
});

// REPORT
router.post('/:id/report', isAuthenticated, async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.length > 500) {
    return res.status(400).json({ error: 'Lý do không hợp lệ' });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Bài viết không tồn tại' });
  const alreadyReported = post.reports.some(r => r.userId.toString() === req.session.userId);
  if (alreadyReported) {
    return res.status(400).json({ error: 'Bạn đã báo cáo bài viết này rồi' });
  }
  post.reports.push({ userId: req.session.userId, reason });
  await post.save();

  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    await Notification.create({
      recipient: admin._id,
      sender: req.session.userId,
      type: 'report',
      post: post._id,
      message: `Bài viết "${post.title}" bị báo cáo: ${reason}`
    });
  }
  res.json({ success: true });
});

// Xóa bài viết
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('Bài viết không tồn tại');
  const user = await User.findById(req.session.userId);
  const isAuthor = post.author.toString() === req.session.userId;
  const isAdminUser = user.role === 'admin';
  if (!isAuthor && !isAdminUser) {
    return res.status(403).send('Bạn không có quyền xóa bài viết này');
  }
  await require('../models/Comment').deleteMany({ post: post._id });
  await post.deleteOne();
  res.redirect('/posts');
});

// Hiển thị form chỉnh sửa bài viết
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('Bài viết không tồn tại');
  
  const user = await User.findById(req.session.userId);
  const isAuthor = post.author.toString() === req.session.userId;
  const isAdminUser = user.role === 'admin';
  if (!isAuthor && !isAdminUser) return res.status(403).send('Bạn không có quyền sửa bài viết này');
  
  // Escape nội dung cho JavaScript
  const escapedContent = post.content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/<\//g, '<\\/');
  
  const escapedTitle = post.title.replace(/"/g, '&quot;');
  
  res.render('editPost', { 
    post, 
    user: req.session,
    escapedContent: escapedContent,
    escapedTitle: escapedTitle
  });
});

// Xử lý cập nhật bài viết
router.post('/:id/update', isAuthenticated, sanitizeHtmlContent, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('Bài viết không tồn tại');
  
  const user = await User.findById(req.session.userId);
  const isAuthor = post.author.toString() === req.session.userId;
  const isAdminUser = user.role === 'admin';
  if (!isAuthor && !isAdminUser) return res.status(403).send('Bạn không có quyền sửa bài viết này');

  const { title, content, tags } = req.body;
  
  if (!title || !content) return res.status(400).send('Thiếu dữ liệu');
  
  post.title = title;
  post.content = content;
  post.tags = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
  post.updatedAt = Date.now();
  await post.save();
  
  res.redirect(`/posts/${post._id}`);
});

module.exports = router;