import { isAuthorizedEmail } from '../services/authorizedUsers.js';
import { isGmailAddress, normalizeEmail } from '../utils/emailValidation.js';

const clearSession = (req) => new Promise((resolve) => {
  req.session.destroy(() => resolve());
});

export const emailSignIn = async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !isGmailAddress(normalizedEmail)) {
    return res.status(400).json({ error: 'A valid Gmail address is required.' });
  }

  const authorized = await isAuthorizedEmail(normalizedEmail);

  if (!authorized) {
    return res.status(403).json({
      error: 'You are not authorized to access the dashboard.',
    });
  }

  req.session.user = {
    email: normalizedEmail,
    name: '',
    picture: '',
  };

  return res.json({
    user: req.session.user,
  });
};

export const getCurrentUser = async (req, res) => {
  const email = req.session?.user?.email;

  if (!email || !isGmailAddress(email)) {
    if (email) {
      await clearSession(req);
      res.clearCookie('connect.sid');
    }

    return res.status(401).json({ error: 'Authentication required.' });
  }

  const authorized = await isAuthorizedEmail(email);

  if (!authorized) {
    await clearSession(req);
    res.clearCookie('connect.sid');
    return res.status(401).json({ error: 'Authentication required.' });
  }

  return res.json({
    user: req.session.user,
  });
};

export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to sign out.' });
    }

    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
};
