import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'r3_group_ultra_luxury_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const verifySuperAdmin = (req, res, next) => {
  verifyAdmin(req, res, () => {
    const userRole = req.user?.userRole;
    const username = (req.user?.username || '').toLowerCase();
    const isSuperAdmin =
      userRole === 'Super Admin' ||
      username === 'admin' ||
      username === (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Super Admin privileges required for this action.',
      });
    }

    next();
  });
};
