const xss = require('xss');

exports.validateRegister = (req, res, next) => {
    let { username, email, password } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!username || !email || !password) {
        return res.status(400).render('register', { message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).render('register', { message: 'Tên đăng nhập gồm 3-20 ký tự (a-z, A-Z, 0-9, _)' });
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).render('register', { message: 'Email không hợp lệ' });
    }

    if (password.length < 6) {
        return res.status(400).render('register', { message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    req.body.username = xss(username);
    req.body.email = xss(email);
    req.body.password = password; 
    next();
};

exports.validateLogin = (req, res, next) => {
    let { username, password } = req.body;
    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
        return res.status(400).render('login', { message: 'Vui lòng nhập tên đăng nhập và mật khẩu', isLogin: true });
    }

    if (username.length > 50 || password.length > 100) {
        return res.status(400).render('login', { message: 'Dữ liệu không hợp lệ', isLogin: true });
    }

    req.body.username = xss(username);
    req.body.password = password;
    next();
};

exports.validatePost = (req, res, next) => {
    let { title, content } = req.body;
    title = title?.trim();
    content = content?.trim();

    if (!title || !content) {
        return res.status(400).send('Tiêu đề và nội dung không được để trống');
    }

    if (title.length < 3 || title.length > 200) {
        return res.status(400).send('Tiêu đề phải từ 3 đến 200 ký tự');
    }

    if (content.length < 10) {
        return res.status(400).send('Nội dung quá ngắn (tối thiểu 10 ký tự)');
    }

    req.body.title = xss(title);
    next();
};

exports.validateComment = (req, res, next) => {
    let { content } = req.body;
    content = content?.trim();

    if (!content) {
        return res.status(400).json({ error: 'Bình luận không được để trống' });
    }

    if (content.length > 1000) {
        return res.status(400).json({ error: 'Bình luận quá dài (tối đa 1000 ký tự)' });
    }

    req.body.content = xss(content);
    next();
};

exports.validateReport = (req, res, next) => {
    let { reason } = req.body;
    reason = reason?.trim();

    if (!reason) {
        return res.status(400).json({ error: 'Vui lòng nhập lý do báo cáo' });
    }

    if (reason.length > 500) {
        return res.status(400).json({ error: 'Lý do quá dài (tối đa 500 ký tự)' });
    }

    req.body.reason = xss(reason);
    next();
};

exports.validateSearch = (req, res, next) => {
    let q = req.query.q?.trim();
    if (q && q.length > 100) {
        q = q.substring(0, 100);
    }
    req.query.q = q ? xss(q) : '';
    next();
};