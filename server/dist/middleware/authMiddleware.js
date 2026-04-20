"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    }
    res.status(401).json({
        success: false,
        error: 'Not authenticated — please log in',
    });
};
exports.default = authMiddleware;
