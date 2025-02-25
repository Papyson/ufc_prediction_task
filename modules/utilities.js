// modules/utilities.js
const utilities = (() => {
    let wallet = 100; // Example starting wallet balance
  
    /**
     * Returns the current wallet balance.
     * @returns {number} The wallet balance.
     */
    function getWallet() {
      return wallet;
    }
  
    /**
     * Updates the wallet balance.
     * @param {number} newVal - The new wallet balance.
     */
    function setWallet(newVal) {
      wallet = newVal;
      console.log("Wallet updated to:", wallet);
    }
  
    /**
     * Saves post-task survey data by sending it to the backend via sessionManager.
     * @param {Object} data - Post-task survey data.
     */
    function savePostTaskData(data) {
      console.log("Post-task data to be saved:", data);
      const payload = {
        event: "postTaskSurvey",
        data: data,
        PROLIFIC_PID: sessionStorage.getItem("PROLIFIC_PID") || "TEST123",
        STUDY_ID: sessionStorage.getItem("STUDY_ID") || "TEST_STUDY",
        SESSION_ID: sessionStorage.getItem("SESSION_ID") || "TEST_SESSION",
        timestamp: new Date().toISOString()
      };
      sessionManager.sendData(payload);
    }
  
    /**
     * Triggers a download of the provided data as a JSON file.
     * @param {Object} data - The data to download.
     * @param {string} [filename="data.json"] - The filename.
     */
    function downloadJSON(data, filename = "data.json") {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }
  
    return {
      getWallet,
      setWallet,
      savePostTaskData,
      downloadJSON
    };
  })();
  