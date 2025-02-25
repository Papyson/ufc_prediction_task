// modules/preTask.js
const preTask = (() => {
    let appContainer;
    let preTaskScreen, waitingRoomScreen;
    let waitingTimerId;
    const WAITING_DURATION = 30000; // 30 seconds
  
    // Initialize the module
    function init() {
      appContainer = document.getElementById("app-container");
  
      // For local testing: generate and store a dummy client ID
      generateAndStoreClientID();
  
      // Initialize WebSocket connection for real-time functions
      initWebSocket();
  
      // Build Pre-Task Screen with a survey field
      preTaskScreen = document.createElement("div");
      preTaskScreen.classList.add("screen");
      preTaskScreen.innerHTML = `
        <h1>Welcome to the UFC Prediction Experiment</h1>
        <p>Please complete the following survey:</p>
        <input type="text" id="survey-name" placeholder="Enter your name" required />
        <button id="btn-start-waiting">Submit Survey & Enter Waiting Room</button>
      `;
      appContainer.appendChild(preTaskScreen);
  
      // Build Waiting Room Screen
      waitingRoomScreen = document.createElement("div");
      waitingRoomScreen.classList.add("screen");
      waitingRoomScreen.innerHTML = `
        <h2>Waiting Room</h2>
        <p>Waiting for other participants...</p>
        <p id="timer-display">30 seconds remaining</p>
        <div id="mode-buttons" style="display:none;">
          <button id="btn-group-mode">Join Group Deliberation</button>
          <button id="btn-solo-mode">Proceed Solo</button>
        </div>
      `;
      appContainer.appendChild(waitingRoomScreen);
  
      preTaskScreen.querySelector("#btn-start-waiting").addEventListener("click", submitSurveyAndStartWaiting);
    }
  
    // Generate a dummy client ID and store it in sessionStorage
    function generateAndStoreClientID() {
      const dummyID = 'client-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      sessionStorage.setItem("PROLIFIC_PID", dummyID);
      console.log("Generated dummy client ID:", dummyID);
    }
  
    // Initialize WebSocket connection for real-time functions
    function initWebSocket() {
      const ws = new WebSocket(CONFIG.wsUrl);
      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "register", clientID: sessionStorage.getItem("PROLIFIC_PID") }));
        window._ws = ws; // Make available for chat.js
      };
      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error("Invalid JSON received:", event.data);
          return;
        }
        if (data.type === "participantCount") {
          console.log("Updated participant count:", data.count);
        }
      };
      ws.onerror = (error) => console.error("WebSocket error:", error);
      ws.onclose = () => console.log("WebSocket connection closed");
    }
  
    // Submit survey and transition to waiting room
    function submitSurveyAndStartWaiting() {
      const name = preTaskScreen.querySelector("#survey-name").value;
      if (!name) {
        alert("Please enter your name.");
        return;
      }
      console.log("Survey submitted by", name, "with Client ID:", sessionStorage.getItem("PROLIFIC_PID"));
      startWaitingRoom();
    }
  
    // Starts a 30-second countdown waiting room
    function startWaitingRoom() {
      hideAllScreens();
      waitingRoomScreen.style.display = "block";
      let remainingTime = WAITING_DURATION / 1000;
      const timerDisplay = waitingRoomScreen.querySelector("#timer-display");
      updateTimerDisplay(timerDisplay, remainingTime);
      waitingTimerId = setInterval(() => {
        remainingTime--;
        updateTimerDisplay(timerDisplay, remainingTime);
        if (remainingTime <= 0) {
          clearInterval(waitingTimerId);
          checkParticipants();
        }
      }, 1000);
    }
  
    // Updates timer display text
    function updateTimerDisplay(element, seconds) {
      element.textContent = `${seconds} seconds remaining`;
    }
  
    // Simulated function for participant count (replace later with real WebSocket updates)
    async function checkParticipants() {
      try {
        const count = await getParticipantCount();
        console.log("Simulated participant count:", count);
        const modeButtons = waitingRoomScreen.querySelector("#mode-buttons");
        modeButtons.style.display = "block";
        const groupButton = waitingRoomScreen.querySelector("#btn-group-mode");
        const soloButton = waitingRoomScreen.querySelector("#btn-solo-mode");
        if (count >= 3) {
          groupButton.textContent = "Join Group Deliberation";
          soloButton.style.display = "none";
        } else {
          groupButton.style.display = "none";
          soloButton.textContent = "Proceed Solo";
        }
        groupButton.addEventListener("click", () => {
          trialPhase.setMode(false); // Group mode
          trialPhase.showTrialScreen();
        });
        soloButton.addEventListener("click", () => {
          trialPhase.setMode(true); // Solo mode
          trialPhase.showTrialScreen();
        });
      } catch (error) {
        console.error("Error checking participants:", error);
        waitingRoomScreen.querySelector("#btn-solo-mode").style.display = "block";
      }
    }
  
    // Simulate participant count for testing
    async function getParticipantCount() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const simulatedCount = Math.floor(Math.random() * 5) + 1;
          resolve(simulatedCount);
        }, 500);
      });
    }
  
    // Hide all screens
    function hideAllScreens() {
      document.querySelectorAll(".screen").forEach(screen => {
        screen.style.display = "none";
      });
    }
  
    return {
      init,
      showPreTaskScreen: () => { preTaskScreen.style.display = "block"; }
    };
  })();
  