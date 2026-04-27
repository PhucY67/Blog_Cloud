const xss = require('xss');
const sanitizeHtml = require('sanitize-html');

exports.sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = xss(req.body[key].trim());
    }
  }
  next();
};

exports.sanitizeHtmlContent = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
  'img', 'video', 'iframe', 'h1', 'h2', 'font', 'span', 'u', 's',
  'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'a']),
      allowedAttributes: {
        '*': ['class', 'style', 'id'],
        'a': ['href', 'target', 'rel', 'title'],
        'img': ['src', 'alt', 'width', 'height', 'loading'],
        'video': ['src', 'controls', 'width', 'height', 'poster'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        'font': ['color', 'size', 'face'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan'],
        'span': ['style'],
        'a': ['href', 'target', 'download', 'rel', 'title'],
      },
      allowedSchemes: ['http', 'https', 'data', 'mailto'],
      allowedSchemesByTag: {
        img: ['http', 'https', 'data'],
        a: ['http', 'https', 'mailto']
      },
      allowProtocolRelative: false
    });
  }
  next();
};

exports.globalSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};