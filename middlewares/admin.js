const { response } = require("../helpers/response.formatter");

module.exports = (req, res, next) => {
    console.log("=== ADMIN MIDDLEWARE ===");
    console.log("req.user:", req.user);
    console.log("req.user.role:", req.user?.role);
    
    const userRole = req.user?.role;
    
    if (!userRole || userRole !== 'admin') {
        return res.status(403).json(response(403, 'Akses ditolak. Hanya admin yang bisa mengakses.'));
    }
    
    next();
};