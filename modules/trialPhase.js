
// modules/trialPhase.js

let trialResults = [];
let groupChatMessages = [];
let initialWager = 2;
let finalWager = 2;
let currentTrial = 1;
let totalTrials = 5; // For testing (use 50 in production)
let isSolo = false;
let currentFightData = null;
let serverAiCorrect = null; // Outcome provided by server
let sessionID = null;
let currentPhase = null;
let phaseStartTime = null;
let phaseDuration = 15000; // Default 15 seconds, updated by server
let ws;

const trialPhase = (function () {
  let appContainer;
  let initialScreen, groupDelibScreen, finalDecisionScreen, resultScreen;

  function init(webSocketInstance) {
    ws = webSocketInstance;
    appContainer = document.getElementById("app-container");
    buildInitialScreen();
    buildGroupDelibScreen();
    buildFinalDecisionScreen();
    buildResultScreen();

    // Set up WebSocket listener for server messages
    ws.addEventListener("message", handleServerMessage);
  }

  function handleServerMessage(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "sessionStarted") {
        sessionID = data.sessionID;
        isSolo = data.mode === "solo";
      } else if (data.type === "phaseChange") {
        // Update trial state from server
        currentTrial = data.trial;
        totalTrials = data.totalTrials;
        currentPhase = data.phase;
        phaseStartTime = data.startTime;
        phaseDuration = data.duration;

        // Handle phase-specific data (e.g., outcome for result phase)
        if (data.phase === "result" && data.aiCorrect !== undefined) {
          serverAiCorrect = data.aiCorrect;
        }

        // Display the appropriate screen
        switch (data.phase) {
          case "initial":
            showTrialScreenSolo();
            break;
          case "groupDelib":
            showGroupDelibScreen();
            break;
          case "finalDecision":
            showFinalDecisionScreen();
            break;
          case "result":
            showResultScreen();
            break;
        }

        // Set up countdown for UI feedback
        setupCountdownDisplay();
      } else if (data.type === "rejoinSession") {
        // Rejoin an active session
        sessionID = data.sessionID;
        currentTrial = data.trial;
        totalTrials = data.totalTrials;
        currentPhase = data.phase;
        isSolo = data.mode === "solo";
        phaseStartTime = Date.now() - (phaseDuration - data.remainingTime);

        // Show current phase screen
        switch (data.phase) {
          case "initial":
            showTrialScreenSolo();
            break;
          case "groupDelib":
            showGroupDelibScreen();
            break;
          case "finalDecision":
            showFinalDecisionScreen();
            break;
          case "result":
            showResultScreen();
            break;
        }

        // Set up countdown
        setupCountdownDisplay();
      } else if (data.type === "trialsCompleted") {
        // Show post-task survey when all trials are done
        postTask.showPostTaskScreen();
      } else if (data.type === "chat") {
        // Append chat messages from other participants
        groupChatMessages.push({
          user: data.clientID,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  function setupCountdownDisplay() {
    const countdownInterval = setInterval(() => {
      let elapsed = Date.now() - phaseStartTime;
      let remaining = Math.max(0, phaseDuration - elapsed);
      updateCountdownDisplay(remaining);
      if (remaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  function updateCountdownDisplay(remainingTime) {
    const seconds = Math.ceil(remainingTime / 1000);
    const countdownText = `Time remaining: ${seconds} seconds`;

    switch (currentPhase) {
      case "initial":
        const soloCountdownEl = document.getElementById("solo-initial-countdown");
        if (soloCountdownEl) soloCountdownEl.textContent = countdownText;
        break;
      case "groupDelib":
        const groupCountdownEl = document.getElementById("group-initial-countdown");
        if (groupCountdownEl) groupCountdownEl.textContent = countdownText;
        break;
      case "finalDecision":
        const finalCountdownEl = document.getElementById("final-decision-countdown");
        if (finalCountdownEl) finalCountdownEl.textContent = countdownText;
        break;
      case "result":
        const resultCountdownEl = document.getElementById("result-countdown");
        if (resultCountdownEl)
          resultCountdownEl.textContent = `Moving to next trial in ${seconds} seconds`;
        break;
    }
  }

  function buildInitialScreen() {
    initialScreen = document.createElement("div");
    initialScreen.classList.add("screen");
    initialScreen.innerHTML = `
      <h2>Trial <span id="solo-trial-number">${currentTrial}</span> of ${totalTrials} - Initial Stage</h2>
      <div id="initial-content"></div>
      <button id="btn-confirm-initial">Confirm Initial Wager</button>
    `;
    appContainer.appendChild(initialScreen);
    initialScreen
      .querySelector("#btn-confirm-initial")
      .addEventListener("click", onConfirmInitial);
  }

  function onConfirmInitial() {
    const wagerSlider = initialScreen.querySelector("#initial-wager-range");
    initialWager = parseInt(wagerSlider.value, 10);
    wagerSlider.disabled = true;
    document.getElementById("btn-confirm-initial").disabled = true;

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        wagerType: "initialWager",
        value: initialWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        phase: "initial",
      })
    );
  }

  function buildGroupDelibScreen() {
    groupDelibScreen = document.createElement("div");
    groupDelibScreen.classList.add("screen");
    groupDelibScreen.innerHTML = `
      <h2>Group Deliberation - Trial <span id="group-trial-number"></span></h2>
      <div id="group-content">
        <div id="group-fight-info"></div>
        <div id="chat-section">
          <h3>Your Opinion</h3>
          <div class="chat-container" id="chat-messages"></div>
          <div class="chat-input" style="display: block;">
            <input type="text" id="chat-input-text" placeholder="Type your opinion..." />
            <button id="chat-send-btn">Send</button>
          </div>
        </div>
        <hr>
        <div id="wager-section">
          <h3>Your Wager</h3>
          <div id="wager-container" style="display:block; margin-top: 20px;">
            <label for="group-wager-range">Wager Scale (0-4):</label>
            <input type="range" id="group-wager-range" min="0" max="4" step="1" value="2">
            <button id="btn-confirm-group-wager">Confirm Wager</button>
          </div>
        </div>
        <div id="group-initial-countdown" style="margin-top:10px;"></div>
      </div>
    `;
    appContainer.appendChild(groupDelibScreen);
    groupDelibScreen
      .querySelector("#chat-send-btn")
      .addEventListener("click", onGroupChatSend);
    groupDelibScreen
      .querySelector("#btn-confirm-group-wager")
      .addEventListener("click", onConfirmGroupWager);
  }

  function onGroupChatSend() {
    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    const message = chatInput.value.trim();
    if (message) {
      chat.sendMessage(message);
      chat.appendMessage("You", message);
      groupChatMessages.push({
        user: "You",
        message: message,
        timestamp: new Date().toISOString(),
      });
      chatInput.value = "";
    }
  }

  function onConfirmGroupWager() {
    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    initialWager = parseInt(wagerSlider.value, 10);
    wagerSlider.disabled = true;
    groupDelibScreen.querySelector("#btn-confirm-group-wager").disabled = true;

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        wagerType: "initialWager",
        value: initialWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        phase: "groupDelib",
      })
    );
  }

  function buildFinalDecisionScreen() {
    finalDecisionScreen = document.createElement("div");
    finalDecisionScreen.classList.add("screen");
    finalDecisionScreen.innerHTML = `
      <h2>Final Prediction & Stake Confirmation (Trial <span id="trial-number"></span> of ${totalTrials})</h2>
      <div id="final-decision-content"></div>
      <button id="btn-confirm-decision">Stake</button>
    `;
    appContainer.appendChild(finalDecisionScreen);
    finalDecisionScreen
      .querySelector("#btn-confirm-decision")
      .addEventListener("click", onConfirmFinalDecision);
  }

  function onConfirmFinalDecision() {
    const wagerSlider = finalDecisionScreen.querySelector("#final-wager-range");
    finalWager = parseInt(wagerSlider.value, 10);
    wagerSlider.disabled = true;
    finalDecisionScreen.querySelector("#btn-confirm-decision").disabled = true;

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        wagerType: "finalWager",
        value: finalWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID") || "unknown",
        sessionID: sessionID,
        phase: "finalDecision",
      })
    );
  }

  function buildResultScreen() {
    resultScreen = document.createElement("div");
    resultScreen.classList.add("screen");
    resultScreen.innerHTML = `
      <h2>Fight Outcome</h2>
      <div id="result-content"></div>
    `;
    appContainer.appendChild(resultScreen);
  }

  function showTrialScreenSolo() {
    hideAllScreens();
    initialScreen.querySelector("#solo-trial-number").textContent = currentTrial;
    loadTrialData();
    const contentEl = initialScreen.querySelector("#initial-content");
    const wallet = utilities.getWallet();
    contentEl.innerHTML = `
      <p><strong>Wallet:</strong> $${wallet}</p>
      ${generateFighterTableHTML()}
      <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
      <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
      <div style="margin-top: 20px;">
        <label>Initial Wager (0-4):</label>
        <input type="range" min="0" max="4" step="1" value="${initialWager}" id="initial-wager-range" />
      </div>
      <div id="solo-initial-countdown" style="margin-top:10px;"></div>
    `;
    document.getElementById("btn-confirm-initial").disabled = false;
    initialScreen.style.display = "block";
  }

  function showGroupDelibScreen() {
    hideAllScreens();
    groupDelibScreen.querySelector("#group-trial-number").textContent = currentTrial;
    loadTrialData();
    const fightInfoEl = groupDelibScreen.querySelector("#group-fight-info");
    const wallet = utilities.getWallet();
    fightInfoEl.innerHTML = `
      <p><strong>Wallet:</strong> $${wallet}</p>
      ${generateFighterTableHTML()}
      <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
      <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
    `;
    groupDelibScreen.querySelector("#chat-messages").innerHTML = "";
    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    chatInput.disabled = false;
    chatInput.value = "";
    groupDelibScreen.querySelector("#chat-send-btn").disabled = false;
    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    wagerSlider.value = initialWager;
    wagerSlider.disabled = false;
    groupDelibScreen.querySelector("#btn-confirm-group-wager").disabled = false;
    groupChatMessages = [];
    groupDelibScreen.style.display = "block";
  }

  function showFinalDecisionScreen() {
    hideAllScreens();
    finalDecisionScreen.querySelector("#trial-number").textContent = currentTrial;
    const contentEl = finalDecisionScreen.querySelector("#final-decision-content");
    const wallet = utilities.getWallet();
    contentEl.innerHTML = `
      <p><strong>Wallet:</strong> $${wallet}</p>
      ${generateFighterTableHTML()}
      <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
      <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
      <div style="margin-top: 20px;">
        <label>Stake (0-4):</label>
        <input type="range" min="0" max="4" step="1" value="${finalWager}" id="final-wager-range" />
      </div>
      <div id="final-decision-countdown" style="margin-top:10px;"></div>
    `;
    finalDecisionScreen.querySelector("#btn-confirm-decision").disabled = false;
    finalDecisionScreen.style.display = "block";
  }

  function showResultScreen() {
    hideAllScreens();
    let walletBefore = utilities.getWallet();
    let outcomeText = "";
    let stakeAmount = finalWager;
    if (serverAiCorrect) {
      let winnings = stakeAmount * 2;
      utilities.setWallet(walletBefore + winnings);
      outcomeText = `AI was correct! You win $${winnings}.`;
    } else {
      utilities.setWallet(walletBefore - stakeAmount);
      outcomeText = `AI was wrong. You lose $${stakeAmount}.`;
    }
    let walletAfter = utilities.getWallet();
    const resultContent = resultScreen.querySelector("#result-content");
    resultContent.innerHTML = `
      <p><strong>Fight Outcome:</strong> ${serverAiCorrect ? "Fighter A wins" : "Fighter B wins"}</p>
      <p>${outcomeText}</p>
      <p>Your new wallet balance is: $${walletAfter}</p>
      <div id="result-countdown" style="margin-top:10px;"></div>
    `;
    resultScreen.style.display = "block";
    saveTrialData(walletBefore, walletAfter);
  }

  function saveTrialData(walletBefore, walletAfter) {
    const clientID = sessionStorage.getItem("PROLIFIC_PID") || "unknown";
    const trialData = {
      trialNumber: currentTrial,
      mode: isSolo ? "solo" : "group",
      fighterData: currentFightData,
      aiPrediction: currentFightData.aiPrediction,
      aiRationale: currentFightData.aiRationale,
      initialWager: initialWager,
      finalWager: finalWager,
      chatMessages: isSolo ? [] : groupChatMessages,
      aiCorrect: serverAiCorrect,
      walletBefore: walletBefore,
      walletAfter: walletAfter,
      timestamp: new Date().toISOString(),
      clientID: clientID,
      sessionID: sessionID,
    };
    trialResults.push(trialData);
    console.log("Trial data saved locally:", trialData);
    ws.send(
      JSON.stringify({
        type: "sendData",
        payload: { event: "trialData", data: trialData },
      })
    );
  }

  function hideAllScreens() {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.style.display = "none";
    });
  }

  function generateFighterTableHTML() {
    return `
      <table class="fighter-table">
        <tr>
          <th></th>
          <th>Fighter A</th>
          <th>Fighter B</th>
        </tr>
        <tr>
          <td>Career Wins</td>
          <td>${currentFightData.fighterA.wins}</td>
          <td>${currentFightData.fighterB.wins}</td>
        </tr>
        <tr>
          <td>Career Losses</td>
          <td>${currentFightData.fighterA.losses}</td>
          <td>${currentFightData.fighterB.losses}</td>
        </tr>
        <tr>
          <td>Age</td>
          <td>${currentFightData.fighterA.age} years</td>
          <td>${currentFightData.fighterB.age} years</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${currentFightData.fighterA.height}</td>
          <td>${currentFightData.fighterB.height}</td>
        </tr>
        <tr>
          <td>Strikes Landed/Min</td>
          <td>${currentFightData.fighterA.strikelaM}</td>
          <td>${currentFightData.fighterB.strikelaM}</td>
        </tr>
        <tr>
          <td>Strike Accuracy</td>
          <td>${currentFightData.fighterA.sigSacc}</td>
          <td>${currentFightData.fighterB.sigSacc}</td>
        </tr>
      </table>
    `;
  }

  function loadTrialData() {
    currentFightData = {
      fighterA: {
        wins: 8,
        losses: 2,
        age: 24.6,
        height: "5'10\"",
        strikelaM: "4.5/min",
        sigSacc: "40%",
      },
      fighterB: {
        wins: 11,
        losses: 5,
        age: 27.8,
        height: "5'11\"",
        strikelaM: "4.9/min",
        sigSacc: "50%",
      },
      aiPrediction: "Fighter A will win by TKO",
      aiRationale: "Better takedown defense and younger age.",
    };
  }

  return {
    init,
    setMode: (soloMode) => {
      isSolo = soloMode;
    },
    getTrialResults: () => trialResults,
  };
})();