exports.isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized - Vui lòng đăng nhập' });
    }
    return res.redirect('/auth/login');
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
        return res.status(403).json({ error: 'Forbidden - Bạn không có quyền truy cập' });
      }
      return res.status(403).send('Bạn không có quyền truy cập trang này');
    }
    next();
  } catch (err) {
    console.error('isAdmin error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};