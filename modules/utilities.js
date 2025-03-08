// // modules/utilities.js
// const utilities = (() => {
//     let wallet = 100; // Example starting wallet balance
  
//     /**
//      * Returns the current wallet balance.
//      * @returns {number} The wallet balance.
//      */
//     function getWallet() {
//       return wallet;
//     }
  
//     /**
//      * Updates the wallet balance.
//      * @param {number} newVal - The new wallet balance.
//      */
//     function setWallet(newVal) {
//       wallet = newVal;
//       console.log("Wallet updated to:", wallet);
//     }
  
//     /**
//      * Saves post-task survey data by sending it to the backend via sessionManager.
//      * @param {Object} data - Post-task survey data.
//      */
//     function savePostTaskData(data) {
//       console.log("Post-task data to be saved:", data);
//       const payload = {
//         event: "postTaskSurvey",
//         data: data,
//         PROLIFIC_PID: sessionStorage.getItem("PROLIFIC_PID") || "TEST123",
//         STUDY_ID: sessionStorage.getItem("STUDY_ID") || "TEST_STUDY",
//         SESSION_ID: sessionStorage.getItem("SESSION_ID") || "TEST_SESSION",
//         timestamp: new Date().toISOString()
//       };
//       // sessionManager.sendData(payload);
//     }
  
//     return {
//       getWallet,
//       setWallet,
//       savePostTaskData
//     };
//   })();
  

// modules/utilities.js
const utilities = (function() {
  let wallet = 100;
  let wsInstance = null;

  function setWebSocket(ws) {
    wsInstance = ws;
  }

  function getWallet() {
    return wallet;
  }

  function setWallet(newVal) {
    wallet = newVal;
    console.log("Wallet updated to:", wallet);
  }

  function savePostTaskData(data) {
    const clientID = sessionStorage.getItem("PROLIFIC_PID") || "unknown";
    console.log("Post-task data to be saved:", data);
    const payload = {
      event: "postTaskSurvey",
      data: {
        clientID: clientID,
        performanceVal: data.performanceVal,
        aiPerfVal: data.aiPerfVal,
        finalWallet: getWallet(),
        timestamp: new Date().toISOString()
      }
    };
    if (wsInstance) {
      wsInstance.send(JSON.stringify({
        type: "sendData",
        payload: payload
      }));
    } else {
      console.error("WebSocket instance not set in utilities");
    }
  }

  return {
    getWallet,
    setWallet,
    savePostTaskData,
    setWebSocket
  };
})();


