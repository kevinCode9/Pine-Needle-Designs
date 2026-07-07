import { isAuthorizedEmail } from '../services/authorizedUsers.js';
import { isGmailAddress } from '../utils/emailValidation.js';

export const requireAuth = async (req, res, next) => {
  const email = req.session?.user?.email;

  if (!email || !isGmailAddress(email)) {
    if (email) {
      req.session.destroy(() => {});
      res.clearCookie('connect.sid');
    }

    return res.status(401).json({ error: 'Authentication required.' });
  }

  const authorized = await isAuthorizedEmail(email);

  if (!authorized) {
    req.session.destroy(() => {});
    res.clearCookie('connect.sid');
    return res.status(401).json({ error: 'Authentication required.' });
  }

  return next();
};
