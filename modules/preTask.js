// const preTask = (() => {
//   let appContainer;
//   let preTaskScreen, waitingRoomScreen;
//   let waitingTimerId;
//   let ws; // WebSocket instance
//   let sessionInfo = null; // Holds session info from server

//   // Initialize the module with the WebSocket instance.
//   function init(webSocketInstance) {
//     ws = webSocketInstance;
//     appContainer = document.getElementById("app-container");

//     // Build Pre-Task Screen.
//     preTaskScreen = document.createElement("div");
//     preTaskScreen.classList.add("screen");
//     preTaskScreen.innerHTML = `
//       <h1>Welcome to the UFC Prediction Experiment</h1>
//       <p>Please complete the following survey:</p>
//       <label for="survey-name">Name:</label>
//       <input type="text" id="survey-name" placeholder="Enter your name" required /><br/><br/>
      
//       <label for="slider-feature1">Rank Importance of Fighter Speed (0-100):</label>
//       <input type="range" id="slider-feature1" min="0" max="100" value="50" /><br/><br/>
      
//       <label for="slider-feature2">Rank Importance of Fighter Strength (0-100):</label>
//       <input type="range" id="slider-feature2" min="0" max="100" value="50" /><br/><br/>
      
//       <label for="ai-trust">Rate your Trust in AI Predictions (0-100):</label>
//       <input type="range" id="ai-trust" min="0" max="100" value="50" /><br/><br/>
      
//       <button id="btn-start-waiting">Submit Survey & Enter Waiting Room</button>
//     `;
//     appContainer.appendChild(preTaskScreen);

//     // Build Waiting Room Screen.
//     waitingRoomScreen = document.createElement("div");
//     waitingRoomScreen.classList.add("screen");
//     waitingRoomScreen.innerHTML = `
//       <h2>Waiting Room</h2>
//       <p id="waiting-message">Waiting for other participants...</p>
//       <p id="timer-display"></p>
//       <p id="routing-message" style="display:none;"></p>
//     `;
//     appContainer.appendChild(waitingRoomScreen);

//     // Attach survey submission handler.
//     preTaskScreen.querySelector("#btn-start-waiting").addEventListener("click", submitSurveyAndStartWaiting);

//     // Set up WebSocket message handling.
//     ws.onmessage = (event) => {
//       let data;
//       try {
//         data = JSON.parse(event.data);
//       } catch (error) {
//         console.error("Invalid JSON received:", event.data);
//         return;
//       }

//       if (data.type === "sessionStarted") {
//         console.log("Session started:", data);
//         sessionStorage.setItem("sessionID", data.sessionID);
//         sessionInfo = data;
//         // Start waiting room countdown using server-provided waitingEndTime.
//         startWaitingRoom(data.waitingEndTime);
//         // If the session mode is not "waiting", route immediately.
//         if (data.mode !== 'waiting') {
//           finalizeWaitingRoom(data.mode);
//         }
//       } else if (data.type === "sessionUpdate") {
//         console.log("Session update received:", data);
//         // If the update indicates the session is now running, cancel countdown and route.
//         if (data.status === 'running') {
//           clearInterval(waitingTimerId);
//           waitingTimerId = null;
//           finalizeWaitingRoom(data.mode);
//         }
//       } else if (data.type === "participantCount") {
//         console.log("Participant count update:", data.count);
//         // Optionally update waiting room UI with participant count.
//       }
//     };

//     ws.onerror = (error) => console.error("WebSocket error:", error);
//     ws.onclose = () => console.log("WebSocket connection closed");
//   }

//   // Submit survey and start waiting room.
//   function submitSurveyAndStartWaiting() {
//     const name = preTaskScreen.querySelector("#survey-name").value;
//     if (!name) {
//       alert("Please enter your name.");
//       return;
//     }
//     console.log("Survey submitted by", name, "with Client ID:", sessionStorage.getItem("PROLIFIC_PID"));
//     ws.send(JSON.stringify({ type: "startSession", clientID: sessionStorage.getItem("PROLIFIC_PID") }));
//     hideAllScreens();
//     waitingRoomScreen.style.display = "block";
//   }

//   // Starts the waiting room countdown based on server-provided waitingEndTime.
//   function startWaitingRoom(waitingEndTime) {
//     const timerDisplay = waitingRoomScreen.querySelector("#timer-display");
//     function updateCountdown() {
//       const remaining = Math.max(0, Math.floor((waitingEndTime - Date.now()) / 1000));
//       timerDisplay.textContent = `${remaining} seconds remaining`;
//       if (remaining <= 0) {
//         clearInterval(waitingTimerId);
//         waitingTimerId = null;
//         finalizeWaitingRoom('solo'); // Default to solo if countdown expires.
//       }
//     }
//     updateCountdown();
//     waitingTimerId = setInterval(updateCountdown, 1000);
//   }

//   // Finalizes waiting room routing.
//   function finalizeWaitingRoom(mode) {
//     const routingMessage = waitingRoomScreen.querySelector("#routing-message");
//     routingMessage.style.display = "block";
//     // Use the mode from the server to set the routing message.
//     routingMessage.textContent = mode === "group"
//       ? "Proceeding to Group Deliberation..."
//       : "Proceeding to Solo Mode...";
//     console.log("Routing to", mode, "mode.");
//     setTimeout(() => {
//       trialPhase.setMode(mode === 'solo'); // true = solo, false = group
//       trialPhase.showTrialScreen();
//     }, 2000);
//   }

//   // Hide all screens.
//   function hideAllScreens() {
//     document.querySelectorAll(".screen").forEach(screen => {
//       screen.style.display = "none";
//     });
//   }

//   return {
//     init,
//     showPreTaskScreen: () => { preTaskScreen.style.display = "block"; }
//   };
// })();

// document.addEventListener("DOMContentLoaded", () => {
//   const ws = new WebSocket("ws://localhost:8080");
//   preTask.init(ws);
// });


// modules/preTask.js
const preTask = (function() {
  let appContainer;
  let preTaskScreen, waitingRoomScreen;
  let waitingTimerId;
  let ws; // WebSocket instance
  let sessionInfo = null;
  let preTaskData = null;
  let hasRouted = false;

  function init(webSocketInstance) {
    ws = webSocketInstance;
    appContainer = document.getElementById("app-container");

    preTaskScreen = document.createElement("div");
    preTaskScreen.classList.add("screen");
    preTaskScreen.innerHTML = `
      <h1>Welcome to the UFC Prediction Experiment</h1>
      <p>Please complete the following survey:</p>
      <label for="survey-name">Name:</label>
      <input type="text" id="survey-name" placeholder="Enter your name" required /><br/><br/>
      
      <label for="slider-feature1">Rank Importance of Fighter Speed (0-100):</label>
      <input type="range" id="slider-feature1" min="0" max="100" value="50" /><br/><br/>
      
      <label for="slider-feature2">Rank Importance of Fighter Strength (0-100):</label>
      <input type="range" id="slider-feature2" min="0" max="100" value="50" /><br/><br/>
      
      <label for="ai-trust">Rate your Trust in AI Predictions (0-100):</label>
      <input type="range" id="ai-trust" min="0" max="100" value="50" /><br/><br/>
      
      <button id="btn-start-waiting">Submit Survey & Enter Waiting Room</button>
    `;
    appContainer.appendChild(preTaskScreen);

    waitingRoomScreen = document.createElement("div");
    waitingRoomScreen.classList.add("screen");
    waitingRoomScreen.innerHTML = `
      <h2>Waiting Room</h2>
      <p id="waiting-message">Waiting for other participants...</p>
      <p id="timer-display"></p>
      <p id="routing-message" style="display:none;"></p>
    `;
    appContainer.appendChild(waitingRoomScreen);

    preTaskScreen.querySelector("#btn-start-waiting").addEventListener("click", submitSurveyAndStartWaiting);

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error("Invalid JSON received:", event.data);
        return;
      }
      if (data.type === "sessionStarted") {
        console.log("Session started:", data);
        sessionStorage.setItem("sessionID", data.sessionID);
        sessionInfo = data;
        // Once we have a sessionStarted (with sessionID), send the pre-task data.
        sendPreTaskSurveyData();
        // Start the waiting room.
        startWaitingRoom(data.waitingEndTime);
      } else if (data.type === "sessionUpdate") {
        console.log("Session update received:", data);
        if (!hasRouted && data.status === 'running') {
          finalizeWaitingRoom(data.mode);
          hasRouted = true;
        }
      } else if (data.type === "participantCount") {
        console.log("Participant count update:", data.count);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket connection closed");
  }

  function submitSurveyAndStartWaiting() {
    const name = preTaskScreen.querySelector("#survey-name").value;
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    const clientID = sessionStorage.getItem("PROLIFIC_PID") || name;
    preTaskData = {
      clientID: clientID,
      name: name,
      fighterSpeedImportance: preTaskScreen.querySelector("#slider-feature1").value,
      fighterStrengthImportance: preTaskScreen.querySelector("#slider-feature2").value,
      aiTrust: preTaskScreen.querySelector("#ai-trust").value,
      timestamp: new Date().toISOString()
    };
    console.log("Pre-task survey captured:", preTaskData);
    // Do not send survey data immediately; wait for sessionStarted.
    ws.send(JSON.stringify({ type: "startSession", clientID: clientID }));
    hideAllScreens();
  }

  function sendPreTaskSurveyData() {
    if (preTaskData) {
      ws.send(JSON.stringify({
        type: "sendData",
        payload: { event: "preTaskSurvey", data: preTaskData }
      }));
      console.log("Pre-task survey data sent:", preTaskData);
    }
  }

  function startWaitingRoom(waitingEndTime) {
    const timerDisplay = waitingRoomScreen.querySelector("#timer-display");
    function updateCountdown() {
      const remaining = Math.max(0, Math.floor((waitingEndTime - Date.now()) / 1000));
      timerDisplay.textContent = `${remaining} seconds remaining`;
      if (remaining <= 0 && !hasRouted) {
        clearInterval(waitingTimerId);
        waitingTimerId = null;
        finalizeWaitingRoom('solo');
        hasRouted = true;
      }
    }
    updateCountdown();
    waitingTimerId = setInterval(updateCountdown, 1000);
    waitingRoomScreen.style.display = "block";
  }

  function finalizeWaitingRoom(mode) {
    const routingMessage = waitingRoomScreen.querySelector("#routing-message");
    routingMessage.style.display = "block";
    routingMessage.textContent = mode === "group"
      ? "Proceeding to Group Deliberation..."
      : "Proceeding to Solo Mode...";
    console.log("Routing to", mode, "mode.");
    setTimeout(() => {
      trialPhase.setMode(mode === 'solo'); // true = solo, false = group
      trialPhase.showTrialScreen();
    }, 2000);
  }

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

document.addEventListener("DOMContentLoaded", () => {});

