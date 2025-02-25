// backend/session.js
const admin = require('./firebaseConfig'); // Adjust path if necessary

const sessionManager = (() => {
  let sessionID = null;

  /**
   * Starts a session by generating a unique session ID and logging the event to Firebase.
   */
  async function startSession() {
    try {
      sessionID = Date.now() + '-' + Math.floor(Math.random() * 10000);
      console.log("Session started with ID:", sessionID);
      const db = admin.database();
      await db.ref('sessionLogs').push({
        event: "startSession",
        sessionID: sessionID,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error starting session:", error);
    }
  }

  /**
   * Ends the session and logs the event to Firebase.
   */
  async function endSession() {
    try {
      console.log("Session ended with ID:", sessionID);
      const db = admin.database();
      await db.ref('sessionLogs').push({
        event: "endSession",
        sessionID: sessionID,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }

  /**
   * Sends data to Firebase by pushing it under the "trialData" node.
   * @param {Object} data - The data payload to be stored.
   */
  async function sendData(data) {
    try {
      const db = admin.database();
      await db.ref('trialData').push(data);
      console.log("Data sent successfully for session:", sessionID);
    } catch (error) {
      console.error("Error sending data to Firebase:", error);
      // Optionally, implement retry logic here.
    }
  }

  function getSessionID() {
    return sessionID;
  }

  return {
    startSession,
    endSession,
    getSessionID,
    sendData
  };
})();

module.exports = sessionManager;
