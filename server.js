require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const { isAuthenticated } = require('./middleware/auth');
const { globalSecurityHeaders } = require('./middleware/security');

const app = express();

// Database connection
require('./config/db');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(globalSecurityHeaders);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 3 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);
app.use('/settings', settingsRoutes);

// Home page
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.render('login', { message: null, isLogin: true });
  }
  res.redirect('/posts');
});

// Trang chủ sau login
app.get('/posts', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  
  const Post = require('./models/Posts');
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const tag = req.query.tag || '';
  
  // Query
  let query = { isHidden: false };
  if (tag) {
    query.tags = { $in: [tag] };
  }
  
  const totalPosts = await Post.countDocuments(query);
  const totalPages = Math.ceil(totalPosts / limit);
  
  const posts = await Post.find(query)
    .populate('author', 'username displayName avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);
  
  const allTags = await Post.distinct('tags', { isHidden: false });
  
  res.render('home', { 
    user: req.session, 
    posts, 
    currentPage: page,
    totalPages,
    tag,
    allTags
  });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});