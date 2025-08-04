const formidable = require('formidable');

const parseFormData = (req, res, next) => {
  const form = formidable({
    maxFileSize: 50 * 1024 * 1024, // 50MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    req.body = fields;
    req.files = files;
    next();
  });
};

module.exports = parseFormData;
