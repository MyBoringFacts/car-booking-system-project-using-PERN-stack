// sessionManager.js

let currentSession = null;

function setSession(data) {
  currentSession = data;
}

function getSession() {
  return currentSession;
}

function clearSession() {
  currentSession = null;
}

module.exports = {
  setSession,
  getSession,
  clearSession,
};
