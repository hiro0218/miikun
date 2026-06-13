let nextId = 1;
const sessions = new Map();

export const createSession = (key = null) => {
  const id = nextId++;
  sessions.set(id, { snapshot: null, key });
  return id;
};

export const stashSnapshot = (id, snap) => {
  const session = sessions.get(id);
  if (session) session.snapshot = snap;
};

// Transfers ownership: slot is nulled so the active view is the sole owner.
export const takeSnapshot = (id) => {
  const session = sessions.get(id);
  if (!session) return null;
  const snap = session.snapshot;
  session.snapshot = null;
  return snap;
};

export const getKey = (id) => sessions.get(id)?.key ?? null;

export const setKey = (id, key) => {
  const session = sessions.get(id);
  if (session) session.key = key;
};

export const markSnapshotCleanIfContentMatches = (id, content) => {
  const snapshot = sessions.get(id)?.snapshot;
  if (!snapshot || snapshot.state.doc.toString() !== content) return false;
  snapshot.cleanValue = snapshot.state.doc;
  return true;
};

export const removeSession = (id) => {
  sessions.delete(id);
};
