const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createDirIfNotExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getDestination = (file) => {
  const mime = file.mimetype;
  const baseDir = 'public/uploads/';
  
  if (mime.startsWith('image/')) {
    return baseDir + 'images/';
  } else if (mime.startsWith('video/')) {
    return baseDir + 'videos/';
  } else if (mime.startsWith('audio/')) {
    return baseDir + 'audios/';
  } else if (mime.includes('word') || mime.includes('document')) {
    return baseDir + 'documents/doc/';
  } else if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return baseDir + 'documents/xls/';
  } else if (mime.includes('presentation') || mime.includes('powerpoint')) {
    return baseDir + 'documents/ppt/';
  } else if (mime.includes('pdf')) {
    return baseDir + 'documents/pdf/';
  } else if (mime.includes('text')) {
    return baseDir + 'documents/txt/';
  } else {
    return baseDir + 'others/';
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = getDestination(file);
    createDirIfNotExist(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, Date.now() + '-' + safeName);
  }
});

const allowedMimes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
  'video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
      '.mp4', '.mpeg', '.webm', '.mov',
      '.mp3', '.wav', '.ogg', '.m4a',
      '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
      '.txt', '.csv', '.rtf', '.odt', '.ods', '.odp'
    ];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng file không được hỗ trợ'));
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } 
});

module.exports = upload;