const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.reduce((acc, e) => {
      acc[e.path.join('.')] = e.message;
      return acc;
    }, {});
    return res.status(400).json({ success: false, errors });
  }
  req.body = result.data; // use coerced/cleaned data
  next();
};

module.exports = validate;
