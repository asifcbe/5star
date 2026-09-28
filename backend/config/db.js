const fs = require('fs');
const path = require('path');

/*
 * Resolves the MongoDB connection string for 5Star.
 *
 * Priority:
 *   1. process.env.MONGO_URI (backend/.env override — a full URI)
 *   2. Built from the project-root 5Star/.env, which (per MongoDB Atlas
 *      onboarding) provides:
 *        MONGODB_URI       - mongodb+srv://[user:pass@]host   (may omit credentials and db)
 *        MONGODB_USERNAME  - used if MONGODB_URI has no embedded credentials
 *        MONGODB_PASSWORD  - "
 *   3. local fallback mongodb://localhost:27017/fivestar
 *
 * If the resolved URI has no database path segment, `/fivestar` is appended
 * (before any query string) so all collections land in one named database.
 */
const parseEnvFile = (filePath) => {
  const out = {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      val = val.replace(/^["']|["']$/g, '');
      out[key] = val;
    });
  } catch (err) {
    /* file missing — return {} */
  }
  return out;
};

const readRootEnv = () => parseEnvFile(path.join(__dirname, '..', '..', '.env'));

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

  const root = readRootEnv();
  if (root.MONGODB_URI) {
    const withCreds = withCredentials(root.MONGODB_URI, root.MONGODB_USERNAME, root.MONGODB_PASSWORD);
    return ensureDbName(withCreds);
  }

  return ensureDbName('mongodb://localhost:27017/fivestar');
};

module.exports = { getMongoUri };
