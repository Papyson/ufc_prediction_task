// modules/postTask.js

const postTask = (() => {
    let appContainer;
    let postTaskScreen;
    
    /**
     * Initialize the post-task module by building the post-task screen.
     */
    function init() {
      appContainer = document.getElementById("app-container");
      
      // Create the post-task screen element
      postTaskScreen = document.createElement("div");
      postTaskScreen.classList.add("screen");
      postTaskScreen.innerHTML = `
        <h2>Post-Task Survey</h2>
        <p>Thank you for participating in the UFC Prediction Experiment!</p>
        <p id="final-wallet">Total Winnings: $0</p>
        <div class="form-group">
          <label for="slider-performance">How would you rate your overall performance? (0-100):</label>
          <input type="range" id="slider-performance" min="0" max="100" step="1" value="50">
        </div>
        <div class="form-group">
          <label for="slider-ai-perf">How would you rate the AI's performance? (0-100):</label>
          <input type="range" id="slider-ai-perf" min="0" max="100" step="1" value="50">
        </div>
        <button id="btn-finish">Finish</button>
        <button id="btn-download-data">Download Trial Data</button>
      `;
      appContainer.appendChild(postTaskScreen);
      
      // Attach event listeners to buttons
      postTaskScreen.querySelector("#btn-finish").addEventListener("click", onFinish);
      postTaskScreen.querySelector("#btn-download-data").addEventListener("click", onDownloadData);
    }
    
    /**
     * Show the post-task screen and update the final wallet display.
     */
    function showPostTaskScreen() {
      hideAllScreens();
      postTaskScreen.style.display = "block";
      
      // Retrieve final wallet amount from utilities (your custom module)
      const finalWallet = utilities.getWallet();
      document.getElementById("final-wallet").textContent = `Total Winnings: $${finalWallet}`;
    }
    
    /**
     * Handler for the Finish button.
     * Captures post-task survey responses, saves data, ends the session, and redirects to Prolific.
     */
    function onFinish() {
      // Capture survey responses
      const performanceVal = postTaskScreen.querySelector("#slider-performance").value;
      const aiPerfVal = postTaskScreen.querySelector("#slider-ai-perf").value;
      
      // Save post-task survey data using your utilities module
      utilities.savePostTaskData({ performanceVal, aiPerfVal });
      
      // End the experiment session (if using a session manager)
      sessionManager.endSession();
      
      // Redirect participant back to Prolific with the completion code
      redirectToProlific();
    }
    
    /**
     * Redirects the participant to the Prolific completion URL.
     * The URL includes PROLIFIC_PID and a completion code to trigger compensation.
     */
    function redirectToProlific() {
      // Define a completion code (this can be dynamically generated as needed)
      const completionCode = "COMP12345";
      
      // Retrieve Prolific parameters from session storage
      const prolificID = sessionStorage.getItem("PROLIFIC_PID") || "";
      
      // Construct the Prolific redirect URL according to their guidelines
      const redirectURL = `${CONFIG.prolificRedirectURL}?PROLIFIC_PID=${encodeURIComponent(prolificID)}&completion_code=${encodeURIComponent(completionCode)}`;
      console.log("Redirecting participant to Prolific:", redirectURL);
      window.location.href = redirectURL;
    }
    
    /**
     * Handler for downloading trial data as a JSON file.
     */
    function onDownloadData() {
      const taskData = trialPhase.getTrialResults();
      utilities.downloadJSON(taskData, "trial_data.json");
    }
    
    /**
     * Utility function to hide all screens.
     */
    function hideAllScreens() {
      document.querySelectorAll(".screen").forEach(screen => {
        screen.style.display = "none";
      });
    }
    
    return {
      init,
      showPostTaskScreen
    };
  })();
  