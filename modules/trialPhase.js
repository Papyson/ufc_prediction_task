// modules/trialPhase.js
const GROUP_TRIAL_DURATION = 15000;
let trialResults = [];
let groupChatMessages = [];
let groupTrialStartTime = null;
let autoTransitionTimerId = null;
let isGroupWagerConfirmed = false;
const GROUP_PHASE_DURATION = 15000;
let groupPhaseStartTime = null;
let autoTransitionFinalDecision = null;
let autoTransitionResult = null;
let finalDecisionConfirmed = false;
let resultConfirmed = false;
let soloInitialStartTime = null;
let soloInitialAutoTransitionTimer = null;
let soloInitialConfirmed = false;
let trialDataSaved = false;

const trialPhase = (function () {
  let appContainer;
  let initialScreen, groupDelibScreen, finalDecisionScreen, resultScreen;
  let currentTrial = 1;
  const totalTrials = 5; // For testing (use 50 in production)
  let isSolo = false;
  let currentFightData = null;
  let initialWager = 2;
  let finalWager = 2;
  let aiCorrect = false;
  let chatTimerId, wagerTimerId, proceedTimerId;
  let ws;

  function init(webSocketInstance) {
    ws = webSocketInstance;
    appContainer = document.getElementById("app-container");
    buildInitialScreen();
    buildGroupDelibScreen();
    buildFinalDecisionScreen();
    buildResultScreen();
  }

  function buildInitialScreen() {
    initialScreen = document.createElement("div");
    initialScreen.classList.add("screen");
    initialScreen.innerHTML = `
      <h2>Trial ${currentTrial} of ${totalTrials} - Initial Stage</h2>
      <div id="initial-content"></div>
      <button id="btn-confirm-initial">Confirm Initial Wager</button>
    `;
    appContainer.appendChild(initialScreen);
    initialScreen.querySelector("#btn-confirm-initial").addEventListener("click", onConfirmInitial);
  }

  function onConfirmInitial() {
    if (soloInitialConfirmed) return; // Prevent multiple calls
    soloInitialConfirmed = true;

    // Clear the auto‑transition timer if it exists
    if (soloInitialAutoTransitionTimer) {
      clearTimeout(soloInitialAutoTransitionTimer);
      soloInitialAutoTransitionTimer = null;
    }

    // Optionally disable the confirm button
    document.getElementById("btn-confirm-initial").disabled = true;

    // Append a message that we're moving to the next stage
    const contentEl = initialScreen.querySelector("#initial-content");
    const movingMsgEl = document.createElement("p");
    movingMsgEl.innerHTML = "<strong>Moving to final decision...</strong>";
    contentEl.appendChild(movingMsgEl);

    // Calculate remaining time for this phase
    let elapsed = Date.now() - soloInitialStartTime;
    let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);

    setTimeout(() => {
      finalWager = initialWager;
      hideAllScreens();
      showFinalDecisionScreen();
    }, remaining);
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
          <div id="wager-container" style="display:none; margin-top: 20px;">
            <label for="group-wager-range">Wager Scale (0-4):</label>
            <input type="range" id="group-wager-range" min="0" max="4" step="1" value="2">
            <button id="btn-confirm-group-wager">Confirm Wager</button>
          </div>
          <div id="wager-suggestion" style="margin-top:20px;"></div>
        </div>
      </div>
    `;
    appContainer.appendChild(groupDelibScreen);
    groupDelibScreen.querySelector("#chat-send-btn").addEventListener("click", onGroupChatSend);
    groupDelibScreen.querySelector("#btn-confirm-group-wager").addEventListener("click", onConfirmGroupWager);
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

    // Reset chat and wager UI elements
    groupDelibScreen.querySelector("#chat-messages").innerHTML = "";
    const chatInputDiv = groupDelibScreen.querySelector(".chat-input");
    chatInputDiv.style.display = "block";
    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    chatInput.disabled = false;
    chatInput.value = "";
    groupDelibScreen.querySelector("#chat-send-btn").disabled = false;
    groupDelibScreen.querySelector("#wager-container").style.display = "none";
    groupDelibScreen.querySelector("#wager-suggestion").innerHTML = "";
    initialWager = 2;
    finalWager = 2;
    groupDelibScreen.querySelector("#group-wager-range").value = initialWager;
    groupChatMessages = [];

    isGroupWagerConfirmed = false;

    // Append countdown element for group confirm initial wager (ensure only one exists)
    let groupCountdownEl = groupDelibScreen.querySelector("#group-initial-countdown");
    if (!groupCountdownEl) {
      groupCountdownEl = document.createElement("div");
      groupCountdownEl.id = "group-initial-countdown";
      groupCountdownEl.style.marginTop = "10px";
      groupDelibScreen.querySelector("#group-content").appendChild(groupCountdownEl);
    } else {
      groupCountdownEl.textContent = "";
    }


    // Reset timing variables for group initial phase
    groupTrialStartTime = Date.now();

    // Start countdown interval for group initial phase
    const groupInitialCountdownInterval = setInterval(() => {
      let elapsed = Date.now() - groupTrialStartTime;
      let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
      groupCountdownEl.textContent = `Time remaining: ${Math.ceil(remaining / 1000)} seconds`;
      if (remaining <= 0) {
        clearInterval(groupInitialCountdownInterval);
      }
    }, 1000);

    // Existing chat timer—here updated to use the same duration if needed
    chatTimerId = setTimeout(() => {
      // Disable chat input and button
      chatInput.disabled = true;
      groupDelibScreen.querySelector("#chat-send-btn").disabled = true;

      // Hide or clear the chat countdown element
      const groupCountdownEl = groupDelibScreen.querySelector("#group-initial-countdown");
      if (groupCountdownEl) {
        groupCountdownEl.textContent = "";
      }

      // Show the wager container
      const wagerContainer = groupDelibScreen.querySelector("#wager-container");
      wagerContainer.style.display = "block";

      // Append a new countdown element for the wager confirmation if not present
      let wagerCountdownEl = wagerContainer.querySelector("#wager-countdown");
      if (!wagerCountdownEl) {
        wagerCountdownEl = document.createElement("div");
        wagerCountdownEl.id = "wager-countdown";
        wagerCountdownEl.style.marginTop = "10px";
        wagerContainer.appendChild(wagerCountdownEl);
      } else {
        wagerCountdownEl.textContent = "";
      }

      // Reset the start time for the wager-confirmation phase
      groupTrialStartTime = Date.now();

      // Start a countdown interval for wager confirmation (e.g., 10 seconds)
      const wagerCountdownInterval = setInterval(() => {
        let elapsed = Date.now() - groupTrialStartTime;
        let remaining = Math.max(0, 10000 - elapsed); // 10 seconds for wager phase
        wagerCountdownEl.textContent = `Time remaining: ${Math.ceil(remaining / 1000)} seconds`;
        if (remaining <= 0) {
          clearInterval(wagerCountdownInterval);
        }
      }, 1000);

      // Set the auto-transition timer for wager confirmation
      wagerTimerId = setTimeout(() => {
        onConfirmGroupWager();
      }, 10000);

    }, GROUP_PHASE_DURATION);


    groupDelibScreen.style.display = "block";
  }

  function onGroupChatSend() {
    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    const message = chatInput.value.trim();
    if (message) {
      // Send the message via the chat module
      chat.sendMessage(message);
  
      // Append the message locally
      chat.appendMessage("You", message);
      groupChatMessages.push({
        user: "You",
        message: message,
        timestamp: new Date().toISOString()
      });
      chatInput.value = "";
  
      // If wager input is not yet displayed, force its display immediately.
      if (groupDelibScreen.querySelector("#wager-container").style.display === "none") {
        clearTimeout(chatTimerId);
        chatInput.disabled = true;
        groupDelibScreen.querySelector("#chat-send-btn").disabled = true;
        groupDelibScreen.querySelector("#wager-container").style.display = "block";
        startWagerTimer();
      }
    }
  }

  function startWagerTimer() {
    wagerTimerId = setTimeout(() => {
      onConfirmGroupWager();
    }, 10000);
  }

  function onConfirmGroupWager() {
    // Prevent multiple confirmations
    if (isGroupWagerConfirmed) return;
    isGroupWagerConfirmed = true;

    // Clear any pending wager timer if it exists
    if (wagerTimerId) {
      clearTimeout(wagerTimerId);
      wagerTimerId = null;
    }

    // Capture the wager
    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    initialWager = parseInt(wagerSlider.value, 10);
    finalWager = initialWager;
    groupDelibScreen.querySelector(".chat-input").style.display = "none";
    groupDelibScreen.querySelector("#wager-container").style.display = "none";
    const wagerSuggestionEl = groupDelibScreen.querySelector("#wager-suggestion");
    wagerSuggestionEl.innerHTML = `<p><strong>Your Wager:</strong> ${finalWager}</p>`;

    // Clear the auto‑transition timer if it exists
    if (autoTransitionTimerId) {
      clearTimeout(autoTransitionTimerId);
      autoTransitionTimerId = null;
    }

    // Calculate remaining time so that the final screen shows exactly at 15 seconds
    const elapsedTime = Date.now() - groupTrialStartTime;
    const remainingTime = GROUP_TRIAL_DURATION - elapsedTime;

    if (remainingTime > 0) {
      setTimeout(() => {
        showFinalDecisionScreen();
      }, remainingTime);
    } else {
      showFinalDecisionScreen();
    }
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
    finalDecisionScreen.querySelector("#btn-confirm-decision").addEventListener("click", onConfirmFinalDecision);
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
    const finalWagerSlider = contentEl.querySelector("#final-wager-range");
    finalWagerSlider.addEventListener("input", (e) => {
      finalWager = parseInt(e.target.value, 10);
    });

    // Reset flag and record start time
    finalDecisionConfirmed = false;
    groupPhaseStartTime = Date.now();

    // Start countdown interval for the final decision screen
    const countdownInterval = setInterval(() => {
      let elapsed = Date.now() - groupPhaseStartTime;
      let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
      contentEl.querySelector("#final-decision-countdown").textContent = `Time remaining: ${Math.ceil(remaining / 1000)} seconds`;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Auto-transition if user hasn’t confirmed within GROUP_PHASE_DURATION
    autoTransitionFinalDecision = setTimeout(() => {
      onConfirmFinalDecision();
    }, GROUP_PHASE_DURATION);

    finalDecisionScreen.style.display = "block";
  }

  function onConfirmFinalDecision() {
    if (finalDecisionConfirmed) return; // Prevent multiple calls
    finalDecisionConfirmed = true;

    // Clear the auto-transition timer if it exists
    if (autoTransitionFinalDecision) {
      clearTimeout(autoTransitionFinalDecision);
      autoTransitionFinalDecision = null;
    }

    // Disable the stake button to prevent further clicks
    finalDecisionScreen.querySelector("#btn-confirm-decision").disabled = true;

    // Append a message indicating the trial will move on
    const contentEl = finalDecisionScreen.querySelector("#final-decision-content");
    let movingMsgEl = document.createElement("p");
    movingMsgEl.innerHTML = "<strong>Moving to next trial...</strong>";
    contentEl.appendChild(movingMsgEl);

    // Calculate remaining time and wait until the full GROUP_PHASE_DURATION has elapsed before transitioning
    let elapsed = Date.now() - groupPhaseStartTime;
    let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
    setTimeout(() => {
      finalDecisionScreen.style.display = "none";
      showResultScreen();
    }, remaining);
  }

  function buildResultScreen() {
    resultScreen = document.createElement("div");
    resultScreen.classList.add("screen");
    resultScreen.innerHTML = `
      <h2>Fight Outcome</h2>
      <div id="result-content"></div>
      <button id="btn-next-trial">Next Trial</button>
    `;
    appContainer.appendChild(resultScreen);
    resultScreen.querySelector("#btn-next-trial").addEventListener("click", onNextTrial);
  }

  function showResultScreen() {
    if (resultScreen && resultScreen.style.display === "block") return;
    hideAllScreens();
    let walletBefore = utilities.getWallet();
    let outcomeText = "";
    let stakeAmount = finalWager;
    aiCorrect = Math.random() < 0.5;
    if (aiCorrect) {
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
      <p><strong>Fight Outcome:</strong> ${aiCorrect ? "Fighter A wins" : "Fighter B wins"}</p>
      <p>${outcomeText}</p>
      <p>Your new wallet balance is: $${walletAfter}</p>
      <div id="result-countdown" style="margin-top:10px;"></div>
    `;

    // Record start time for result screen phase and reset flag
    resultConfirmed = false;
    groupPhaseStartTime = Date.now();

    // Start countdown interval for the result screen
    const resultCountdownInterval = setInterval(() => {
      let elapsed = Date.now() - groupPhaseStartTime;
      let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
      resultScreen.querySelector("#result-countdown").textContent = `Moving to next trial in ${Math.ceil(remaining / 1000)} seconds`;
      if (remaining <= 0) {
        clearInterval(resultCountdownInterval);
      }
    }, 1000);

    // Auto-transition after GROUP_PHASE_DURATION if user hasn’t clicked Next Trial
    autoTransitionResult = setTimeout(() => {
      onNextTrial();
    }, GROUP_PHASE_DURATION);

    resultScreen.style.display = "block";
    saveTrialData(walletBefore, walletAfter);
  }

  function saveTrialData(walletBefore, walletAfter) {
    if (trialDataSaved) return;  // Prevent duplicate saving
    trialDataSaved = true;

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
      aiCorrect: aiCorrect,
      walletBefore: walletBefore,
      walletAfter: walletAfter,
      timestamp: new Date().toISOString(),
      clientID: clientID
    };
    trialResults.push(trialData);
    console.log("Trial data saved locally:", trialData);
    ws.send(JSON.stringify({
      type: "sendData",
      payload: { event: "trialData", data: trialData }
    }));
  }

  function onNextTrial() {
    if (resultConfirmed) return; // Prevent multiple calls
    resultConfirmed = true;

    // Clear the auto-transition timer if it exists
    if (autoTransitionResult) {
      clearTimeout(autoTransitionResult);
      autoTransitionResult = null;
    }

    // Optionally disable the Next Trial button to prevent multiple clicks
    resultScreen.querySelector("#btn-next-trial").disabled = true;

    // Append a message indicating the trial will move on
    let movingMsgEl = document.createElement("p");
    movingMsgEl.innerHTML = "<strong>Moving to next trial...</strong>";
    resultScreen.querySelector("#result-content").appendChild(movingMsgEl);

    // Calculate remaining time based on GROUP_PHASE_DURATION
    let elapsed = Date.now() - groupPhaseStartTime;
    let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
    setTimeout(() => {
      currentTrial++;
      trialDataSaved = false;
      if (currentTrial <= totalTrials) {
        initialWager = 2;
        finalWager = 2;
        clearTimeout(chatTimerId);
        clearTimeout(wagerTimerId);
        clearTimeout(proceedTimerId);
        // Reset flags for the next trial
        resultConfirmed = false;
        finalDecisionConfirmed = false;
        if (isSolo) {
          showTrialScreenSolo();
        } else {
          showGroupDelibScreen();
        }
      } else {
        // Instead of sending finishSession here, route to Post-Task survey.
        postTask.showPostTaskScreen();
      }
    }, remaining);
  }

  function showTrialScreenSolo() {
    hideAllScreens();
    initialScreen.querySelector("h2").innerHTML = `Trial ${currentTrial} of ${totalTrials} - Initial Stage`;
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
    `;

    // Append countdown element for solo confirm initial wager
    let soloCountdownEl = document.createElement("div");
    soloCountdownEl.id = "solo-initial-countdown";
    soloCountdownEl.style.marginTop = "10px";
    contentEl.appendChild(soloCountdownEl);

    // Initialize solo timing variables
    soloInitialConfirmed = false;
    soloInitialStartTime = Date.now();

    // Start countdown interval for solo initial phase
    const soloInitialCountdownInterval = setInterval(() => {
      let elapsed = Date.now() - soloInitialStartTime;
      let remaining = Math.max(0, GROUP_PHASE_DURATION - elapsed);
      soloCountdownEl.textContent = `Time remaining: ${Math.ceil(remaining / 1000)} seconds`;
      if (remaining <= 0) {
        clearInterval(soloInitialCountdownInterval);
      }
    }, 1000);

    // Auto-transition to onConfirmInitial when time is up
    soloInitialAutoTransitionTimer = setTimeout(() => {
      onConfirmInitial();
    }, GROUP_PHASE_DURATION);

    // Listen for changes to the wager slider
    const wagerSlider = contentEl.querySelector("#initial-wager-range");
    wagerSlider.addEventListener("input", (e) => {
      initialWager = parseInt(e.target.value, 10);
    });
    initialScreen.style.display = "block";
  }

  function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(screen => {
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
      fighterA: { wins: 8, losses: 2, age: 24.6, height: "5'10\"", strikelaM: "4.5/min", sigSacc: "40%" },
      fighterB: { wins: 11, losses: 5, age: 27.8, height: "5'11\"", strikelaM: "4.9/min", sigSacc: "50%" },
      aiPrediction: "Fighter A will win by TKO",
      aiRationale: "Better takedown defense and younger age."
    };
  }

  return {
    init,
    showTrialScreen: () => {
      if (isSolo) {
        showTrialScreenSolo();
      } else {
        showGroupDelibScreen();
      }
    },
    setMode: (soloMode) => { isSolo = soloMode; },
    getTrialResults: () => trialResults
  };
})();
