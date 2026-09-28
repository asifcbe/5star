const path = require('path');

// Load backend/.env by absolute path so this works regardless of the cwd
// the server or a seed script is started from (pm2, repo root, etc.).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/*
 * Resolves the MongoDB connection string for 5Star from backend/.env.
 *
 * Priority:
 *   1. MONGO_URI — a full connection string
 *   2. Built from the MongoDB Atlas onboarding variables:
 *        MONGODB_URI       - mongodb+srv://[user:pass@]host   (may omit credentials and db)
 *        MONGODB_USERNAME  - used if MONGODB_URI has no embedded credentials
 *        MONGODB_PASSWORD  - "
 *   3. local fallback mongodb://localhost:27017/fivestar
 *
 * If the resolved URI has no database path segment, `/fivestar` is appended
 * (before any query string) so all collections land in one named database.
 */

// Insert user:pass into a mongodb URI that has no embedded credentials.
const withCredentials = (uri, username, password) => {
  if (!uri || !username) return uri;
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!m) return uri;
  const rest = m[2];
  if (rest.includes('@')) return uri; // already has credentials
  const user = encodeURIComponent(username);
  const pass = password ? encodeURIComponent(password) : '';
  return `${m[1]}${user}${pass ? `:${pass}` : ''}@${rest}`;
};

const ensureDbName = (uri, dbName = 'fivestar') => {
  if (!uri) return uri;
  const [base, query] = uri.split('?');
  const schemeMatch = base.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return uri;
  const rest = schemeMatch[2];
  const slashIdx = rest.indexOf('/');
  let hostPart;
  let dbPart;
  if (slashIdx === -1) {
    hostPart = rest;
    dbPart = '';
  } else {
    hostPart = rest.slice(0, slashIdx);
    dbPart = rest.slice(slashIdx + 1);
  }
  if (!dbPart) dbPart = dbName;
  const rebuilt = `${schemeMatch[1]}${hostPart}/${dbPart}`;
  return query ? `${rebuilt}?${query}` : rebuilt;
};

const getMongoUri = () => {
  if (process.env.MONGO_URI) return ensureDbName(process.env.MONGO_URI);

  const { MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;
  if (MONGODB_URI) {
    return ensureDbName(withCredentials(MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD));
  }

  return ensureDbName('mongodb://localhost:27017/fivestar');
};

module.exports = { getMongoUri };
