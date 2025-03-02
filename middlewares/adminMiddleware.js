const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin Access Required" });
    }
    next();
  };
  
  module.exports = adminMiddleware;
  