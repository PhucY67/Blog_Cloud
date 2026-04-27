const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { validateLogin, validateRegister } = require('../middleware/validation');
const router = express.Router();

router.get('/login', (req, res) => res.render('login', { message: null, isLogin: true }));
router.get('/register', (req, res) => res.render('register', { message: null }));

router.post('/login', validateLogin, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { message: 'Sai tên đăng nhập hoặc mật khẩu', isLogin: true });
  }
  req.session.userId = user._id;
  req.session.role = user.role;
  res.redirect('/posts');
});

router.post('/register', validateRegister, async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.render('register', { message: 'Tên đăng nhập hoặc email đã tồn tại' });
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashed });
  res.redirect('/auth/login');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;