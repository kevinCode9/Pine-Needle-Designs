import { AuthorizedUser } from '../models/AuthorizedUser.js';

const INITIAL_AUTHORIZED_EMAILS = [
  'Wendemalianidesigns@gmail.com',
  'alnabidrm@gmail.com',
  'muhachris297@gmail.com',
  'kevintavares0529@gmail.com',
];

export const seedAuthorizedUsers = async () => {
  const operations = INITIAL_AUTHORIZED_EMAILS.map((email) => AuthorizedUser.updateOne(
    { email: email.toLowerCase() },
    { $setOnInsert: { email: email.toLowerCase() } },
    { upsert: true },
  ));

  await Promise.all(operations);
};

export const isAuthorizedEmail = async (email) => {
  if (!email) {
    return false;
  }

  const authorizedUser = await AuthorizedUser.findOne({
    email: String(email).trim().toLowerCase(),
  }).lean();

  return Boolean(authorizedUser);
};
