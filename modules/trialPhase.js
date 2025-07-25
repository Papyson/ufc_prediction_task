let trialResults = [];
let groupChatMessages = [];
let initialWager = 2;
let finalWager = 2;
let currentTrial = 1;
let totalTrials = 50;
let isSolo = false;
let currentFightData = null;
let serverAiCorrect = null;
let sessionID = null;
let currentPhase = null;
let currentSubPhase = null;
let phaseStartTime = null;
let phaseDuration = null;
let wagerDuration = null;
let chatDuration = null;
let ws;

let isGroupWagerConfirmed = false;
let finalDecisionConfirmed = false;
let resultConfirmed = false;
let soloInitialConfirmed = false;
let trialDataSaved = false;
let chatInputEnabled = false;
let countdownIntervalId = null;
let autoTransitionTimerId = null;

let collectedWagers = {};
let collectedUserNames = {};
let playerNumberMap = new Map();
let expectedParticipants = 3;
let autoConfirmTriggered = false;

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

      if (data.type === "startOnboarding") {
        onboarding.startOnboarding(data.mode, data.sessionID);
        return;
      }

      if (data.type === "onboardingComplete") {
        onboarding.completeOnboarding();
        return;
      }

      if (data.type === "sessionStarted" || data.type === "sessionUpdate") {
        if (data.sessionID) sessionID = data.sessionID;
        if (data.mode) isSolo = data.mode === "solo";
        console.log(
          `Session update: ID=${sessionID}, Mode=${
            isSolo ? "Solo" : "Group"
          }, Status=${data.status}`
        );
      } else if (data.type === "phaseChange") {
        clearAllTimers();

        if (data.trial !== currentTrial && currentTrial !== 0) {
          initialWager = 2;
          finalWager = 2;
        }

        if (
          !isSolo &&
          data.phase === "groupDelib" &&
          data.subPhase === "wager"
        ) {
          expectedParticipants = 3;
          collectedWagers = {};
          collectedUserNames = {};
        }

        window.aiMode = data.aiMode || null;
        sessionID = data.sessionID || sessionID;
        currentTrial = data.trial;
        totalTrials = data.totalTrials;
        currentPhase = data.phase;
        currentSubPhase = data.subPhase;
        phaseStartTime = data.startTime;
        phaseDuration = data.duration;
        wagerDuration = data.wagerDuration;
        chatDuration = data.chatDuration;

        if (data.trialData) {
          window.currentTrialData = window.currentTrialData || {};
          window.currentTrialData[currentTrial] = data.trialData;
          loadTrialData();
        }

        resetPhaseFlags();
        if (currentPhase !== "result") {
          trialDataSaved = false;
        }

        if (currentPhase === "result" && currentFightData) {
          serverAiCorrect =
            currentFightData.winner ==
            currentFightData.predicted_winner_numeric;
        } else if (currentPhase === "result") {
          console.warn("Result phase started but currentFightData is missing.");
        }

        const forceShowScreen = () => {
          hideAllScreens();

          console.log(
            `Showing screen for phase: ${currentPhase}, subPhase: ${currentSubPhase}`
          );

          switch (currentPhase) {
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
          setupDynamicCountdown();

          setTimeout(() => {
            const visibleScreen = document.querySelector(
              '.screen[style*="block"]'
            );
            if (!visibleScreen) {
              console.warn("No screen visible after transition, retrying...");
              forceShowScreen();
            }
          }, 500);
        };

        setTimeout(forceShowScreen, 100);
      } else if (data.type === "rejoinSession") {
        clearAllTimers();
        window.aiMode = data.aiMode || null;
        sessionID = data.sessionID;
        currentTrial = data.trial;
        totalTrials = data.totalTrials;
        currentPhase = data.phase;
        currentSubPhase = data.subPhase;
        isSolo = data.mode === "solo";
        phaseDuration = data.remainingTime;
        phaseStartTime = Date.now();

        if (data.trialData) {
          window.currentTrialData = window.currentTrialData || {};
          window.currentTrialData[currentTrial] = data.trialData;
          loadTrialData();
        } else {
          console.warn(
            `Trial data missing on rejoin for trial ${currentTrial}`
          );
        }

        resetPhaseFlags();

        switch (currentPhase) {
          case "initial":
            showTrialScreenSolo();
            break;
          case "groupDelib":
            showGroupDelibScreen(data.currentWagers);
            break;
          case "finalDecision":
            showFinalDecisionScreen();
            break;
          case "result":
            showResultScreen();
            break;
        }

        setupDynamicCountdown();
      } else if (data.type === "trialsCompleted") {
        clearAllTimers();
        postTask.showPostTaskScreen();
      } else if (data.type === "allWagersSubmitted" && !isSolo) {
        if (data.userNames) {
          collectedUserNames = { ...data.userNames };
        }
        displayAllConfirmedWagers(data.wagers);
        const wagersDisplay = groupDelibScreen.querySelector(
          "#confirmed-wagers-display"
        );
        if (wagersDisplay) {
          wagersDisplay.style.display = "flex";
        }
      } else if (data.type === "individualWager" && !isSolo) {
        collectedWagers[data.clientID] = data.wager;
        if (data.userName) {
          collectedUserNames[data.clientID] = data.userName;
        }
        const wagerCount = Object.keys(collectedWagers).length;
        updateWaitingMessage(wagerCount, expectedParticipants);
      } else if (data.type === "wagerUpdated") {
        console.log(
          `Server confirmed ${data.wagerType} update to ${data.value}`
        );
      } else if (data.type === "dataSent") {
        if (data.event === "trialData") {
          trialDataSaved = true;
        }
      } else if (data.type === "waitingForOthers") {
        console.log("Waiting for other participants:", data.message);
      } else if (data.type === "onboardingAndPracticeComplete") {
        console.log("All participants ready, trials will begin shortly");
      }
    } catch (error) {
      console.error(
        "Error handling WebSocket message:",
        error,
        "Data:",
        event.data
      );
    }
  }

  function updateWaitingMessage(received, total) {
    const wagersContainer =
      groupDelibScreen?.querySelector("#wagers-container");
    if (!wagersContainer) return;

    let waitingMsg = wagersContainer.querySelector(".waiting-message");

    if (waitingMsg && waitingMsg.classList.contains("persistent-waiting")) {
      waitingMsg.innerHTML = `Your bet of ${initialWager} has been confirmed.`;
    }
  }

  function resetPhaseFlags() {
    soloInitialConfirmed = currentPhase !== "initial";
    isGroupWagerConfirmed = !(
      currentPhase === "groupDelib" && currentSubPhase === "wager"
    );
    finalDecisionConfirmed = currentPhase !== "finalDecision";
    resultConfirmed = currentPhase !== "result";
    chatInputEnabled =
      currentPhase === "groupDelib" && currentSubPhase === "chat";
    autoConfirmTriggered = false;

    if (currentPhase === "groupDelib" && currentSubPhase === "chat") {
      groupChatMessages = [];
    }

    if (currentPhase === "groupDelib" && currentSubPhase === "wager") {
      collectedWagers = {};
      collectedUserNames = {};
    }
  }

  function clearAllTimers() {
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    if (autoTransitionTimerId) clearTimeout(autoTransitionTimerId);
    countdownIntervalId = null;
    autoTransitionTimerId = null;
  }

  function setupDynamicCountdown() {
    if (countdownIntervalId) clearInterval(countdownIntervalId);

    updateCountdownDisplay();

    countdownIntervalId = setInterval(() => {
      updateCountdownDisplay();
    }, 1000);

    if (autoTransitionTimerId) clearTimeout(autoTransitionTimerId);
    autoTransitionTimerId = setTimeout(() => {
      handleAutoConfirm();
    }, phaseDuration);
  }

  function updateCountdownDisplay() {
    const now = Date.now();
    const elapsed = now - phaseStartTime;
    const remaining = Math.max(0, phaseDuration - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    let countdownEl = null;
    let textPrefix = "";

    switch (currentPhase) {
      case "initial":
        countdownEl = document.getElementById("solo-initial-countdown");
        textPrefix = "Time remaining:";
        break;
      case "groupDelib":
        countdownEl = document.getElementById("group-countdown");
        if (currentSubPhase === "wager") {
          textPrefix = "Bet time remaining:";
          if (seconds <= 1 && !isGroupWagerConfirmed && !autoConfirmTriggered) {
            autoConfirmTriggered = true;
            onConfirmGroupWager();
          }
        } else if (currentSubPhase === "chat") {
          textPrefix = "Chat time remaining:";
        }
        break;
      case "finalDecision":
        countdownEl = document.getElementById("final-decision-countdown");
        textPrefix = "Time remaining:";
        break;
      case "result":
        countdownEl = document.getElementById("result-countdown");
        textPrefix = "Next trial in:";
        break;
    }

    if (countdownEl) {
      countdownEl.textContent = `${textPrefix} ${seconds} seconds`;
    }

    if (currentPhase === "groupDelib") {
      const wagerSection = groupDelibScreen.querySelector("#wager-section");
      const chatSection = groupDelibScreen.querySelector("#chat-section");
      const confirmedWagersDisplay = groupDelibScreen.querySelector(
        "#confirmed-wagers-display"
      );

      if (currentSubPhase === "wager") {
        wagerSection.style.display = "block";
        chatSection.style.display = "none";
        const hasContent =
          confirmedWagersDisplay.querySelector(".wager-column") ||
          confirmedWagersDisplay.querySelector(".waiting-message");
        if (hasContent || isGroupWagerConfirmed) {
          confirmedWagersDisplay.style.display = "flex";
        } else {
          confirmedWagersDisplay.style.display = "none";
        }
      } else if (currentSubPhase === "chat") {
        wagerSection.style.display = "none";
        chatSection.style.display = "block";
        confirmedWagersDisplay.style.display = "flex";
        enableChatInputUI(true);
      }
    }

    if (remaining <= 0 && countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      if (countdownEl) countdownEl.textContent = "Time's up!";
    }
  }

  function enableChatInputUI(enable) {
    const chatInput = groupDelibScreen?.querySelector("#chat-input-text");
    const chatSendBtn = groupDelibScreen?.querySelector("#chat-send-btn");
    if (chatInput && chatSendBtn) {
      chatInput.disabled = !enable;
      chatSendBtn.disabled = !enable;
      chatInputEnabled = enable;
    }
  }

  function handleAutoConfirm() {
    switch (currentPhase) {
      case "initial":
        if (!soloInitialConfirmed) onConfirmInitial();
        break;
      case "groupDelib":
        if (currentSubPhase === "wager" && !isGroupWagerConfirmed) {
          const myClientID = sessionStorage.getItem("PROLIFIC_PID");
          const myUserName = sessionStorage.getItem("userName");
          const wagerSlider =
            groupDelibScreen.querySelector("#group-wager-range");
          initialWager = parseInt(wagerSlider.value, 10);

          collectedWagers[myClientID] = initialWager;

          ws.send(
            JSON.stringify({
              type: "updateWager",
              clientID: myClientID,
              username: myUserName,
              sessionID: sessionID,
              wagerType: "initialWager",
              value: initialWager,
            })
          );
        }
        break;
      case "finalDecision":
        if (!finalDecisionConfirmed) onConfirmFinalDecision();
        break;
      case "result":
        if (!resultConfirmed) onNextTrial();
        break;
    }
  }

  function buildInitialScreen() {
    initialScreen = document.createElement("div");
    initialScreen.classList.add("screen");
    initialScreen.id = "initial-screen";
    initialScreen.innerHTML = `
    <h2>Trial <span id="solo-trial-number">${currentTrial}</span> of ${totalTrials} - Initial Bet</h2>
    <div id="initial-content"></div>
    <div id="solo-initial-countdown"></div>
  `;
    appContainer.appendChild(initialScreen);
  }

  function onConfirmInitial() {
    if (soloInitialConfirmed) return;
    soloInitialConfirmed = true;

    const wagerSlider = initialScreen.querySelector("#initial-wager-range");
    const confirmButton = initialScreen.querySelector("#btn-confirm-initial");
    initialWager = parseInt(wagerSlider.value, 10);

    wagerSlider.disabled = true;
    confirmButton.disabled = true;
    confirmButton.textContent = "Bet Confirmed";

    const contentEl = initialScreen.querySelector("#initial-content");
    const movingMsgEl = document.createElement("p");
    movingMsgEl.innerHTML = `<strong>Bet confirmed: ${initialWager}.</strong>`;
    movingMsgEl.style.marginTop = "15px";
    movingMsgEl.style.color = "#00ff00";
    contentEl.appendChild(movingMsgEl);

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: sessionStorage.getItem("PROLIFIC_PID"),
        sessionID: sessionID,
        wagerType: "initialWager",
        value: initialWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID"),
        sessionID: sessionID,
        phase: "initial",
      })
    );
  }

  function buildGroupDelibScreen() {
    groupDelibScreen = document.createElement("div");
    groupDelibScreen.classList.add("screen");
    groupDelibScreen.id = "group-delib-screen";
    groupDelibScreen.innerHTML = `
    <h2>Group Trial <span id="group-trial-number"></span> - <span id="group-phase-title">Bet Phase</span></h2>
    <div id="group-countdown"></div>
    <div class="main-layout">
      <div class="left-section">
        <div id="group-fight-info"></div>
      </div>
      <div class="right-section">
        <div id="wager-section" style="display: none;">
          <h3>Your Bet</h3>
          <div class="wager-slider-container">
            <label for="group-wager-range">Bet Scale (0-4): <span id="group-wager-value">2</span></label>
            <input type="range" id="group-wager-range" min="0" max="4" step="1" value="2">
          </div>
          <div class="confirm-bet-area">
            <button id="btn-confirm-group-wager">Confirm Bet</button>
          </div>
        </div>

        <div id="confirmed-wagers-display" class="confirmed-wagers-display" style="display: none;">
          <h3 class="wagers-title">Initial Bets</h3>
          <div id="wagers-container" class="wagers-container">
            <p style="color: #aaa; width: 100%; text-align: center;">Waiting for all bets...</p>
          </div>
        </div>

        <div id="chat-section" style="display: none;">
          <h3>Group Chat</h3>
          <div class="chat-container" id="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-input-text" placeholder="Type your opinion..." disabled />
            <button id="chat-send-btn" disabled>Send</button>
          </div>
        </div>
      </div>
    </div>`;
    appContainer.appendChild(groupDelibScreen);

    groupDelibScreen
      .querySelector("#group-wager-range")
      .addEventListener("input", (e) => {
        initialWager = parseInt(e.target.value, 10);
        document.getElementById("group-wager-value").textContent = initialWager;
      });
    groupDelibScreen
      .querySelector("#btn-confirm-group-wager")
      .addEventListener("click", onConfirmGroupWager);
    groupDelibScreen
      .querySelector("#chat-send-btn")
      .addEventListener("click", onGroupChatSend);
    groupDelibScreen
      .querySelector("#chat-input-text")
      .addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !this.disabled) {
          onGroupChatSend();
        }
      });
  }

  function displayAllConfirmedWagers(wagers) {
    const displayContainer =
      groupDelibScreen.querySelector("#wagers-container");
    const wagersDisplay = groupDelibScreen.querySelector(
      "#confirmed-wagers-display"
    );

    if (!displayContainer) return;

    wagersDisplay.style.display = "flex";
    displayContainer.innerHTML = "";

    const currentUserClientID = sessionStorage.getItem("PROLIFIC_PID");
    const clientIDs = Object.keys(wagers).sort();

    if (clientIDs.length === 0) {
      displayContainer.innerHTML =
        '<p style="color: #aaa; width: 100%; text-align: center;">Waiting for all bets...</p>';
      return;
    }

    clientIDs.forEach((clientID) => {
      const wagerValue = wagers[clientID];
      const isCurrentUser = clientID === currentUserClientID;
      let displayName = collectedUserNames[clientID] || clientID;

      const column = document.createElement("div");
      column.classList.add("wager-column");
      if (isCurrentUser) {
        column.classList.add("my-wager");
        displayName += " (You)";
      }

      const idElement = document.createElement("div");
      idElement.classList.add("wager-participant-id");
      idElement.textContent = displayName += " 🤹‍♂️";

      const valueElement = document.createElement("div");
      valueElement.classList.add("wager-value");
      valueElement.textContent = wagerValue;

      column.appendChild(idElement);
      column.appendChild(valueElement);
      displayContainer.appendChild(column);
    });
  }

  function onGroupChatSend() {
    if (!chatInputEnabled) return;

    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    const message = chatInput.value.trim();
    if (message) {
      const clientID = sessionStorage.getItem("PROLIFIC_PID");
      const timestamp = new Date().toISOString();

      chat.appendMessage("You", message);

      groupChatMessages.push({
        user: clientID,
        userName: sessionStorage.getItem("userName"),
        message: message,
        timestamp: timestamp,
      });

      ws.send(
        JSON.stringify({
          type: "chat",
          clientID: clientID,
          userName: sessionStorage.getItem("userName"),
          sessionID: sessionID,
          message: message,
          timestamp: timestamp,
        })
      );

      chatInput.value = "";
    }
  }

  function onConfirmGroupWager() {
    if (isGroupWagerConfirmed) return;
    isGroupWagerConfirmed = true;

    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    const confirmButton = groupDelibScreen.querySelector(
      "#btn-confirm-group-wager"
    );

    initialWager = parseInt(wagerSlider.value, 10);

    wagerSlider.disabled = true;
    confirmButton.disabled = true;
    confirmButton.textContent = "Bet Confirmed";

    const myClientID = sessionStorage.getItem("PROLIFIC_PID");
    const myUserName = sessionStorage.getItem("userName") || "You";

    collectedWagers[myClientID] = initialWager;
    collectedUserNames[myClientID] = myUserName;

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: myClientID,
        username: myUserName,
        sessionID: sessionID,
        wagerType: "initialWager",
        value: initialWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: myClientID,
        username: myUserName,
        sessionID: sessionID,
        phase: "groupDelib",
      })
    );

    const confirmationMsg = document.createElement("div");
    confirmationMsg.className = "confirmation-message persistent-waiting";
    confirmationMsg.innerHTML = `Your bet of ${initialWager} has been confirmed.`;
    confirmationMsg.style.color = "#00ff00";
    confirmationMsg.style.marginTop = "15px";

    const wagersContainer = groupDelibScreen.querySelector("#wagers-container");
    wagersContainer.innerHTML = "";
    wagersContainer.appendChild(confirmationMsg);

    const wagersDisplay = groupDelibScreen.querySelector(
      "#confirmed-wagers-display"
    );
    wagersDisplay.style.display = "flex";
  }

  function buildFinalDecisionScreen() {
    finalDecisionScreen = document.createElement("div");
    finalDecisionScreen.classList.add("screen");
    finalDecisionScreen.id = "final-decision-screen";
    finalDecisionScreen.innerHTML = `
    <h2>Final Prediction & Bet Confirmation (Trial <span id="final-trial-number"></span> of ${totalTrials})</h2>
    <div id="final-decision-content"></div>
    <div id="final-decision-countdown"></div>
  `;
    appContainer.appendChild(finalDecisionScreen);
  }

  function onConfirmFinalDecision() {
    if (finalDecisionConfirmed) return;
    finalDecisionConfirmed = true;

    const wagerSlider = finalDecisionScreen.querySelector("#final-wager-range");
    const confirmButton = finalDecisionScreen.querySelector(
      "#btn-confirm-decision"
    );
    finalWager = parseInt(wagerSlider.value, 10);

    wagerSlider.disabled = true;
    confirmButton.disabled = true;
    confirmButton.textContent = "Final Bet Confirmed";

    const contentEl = finalDecisionScreen.querySelector(
      "#final-decision-content"
    );
    const movingMsgEl = document.createElement("p");
    movingMsgEl.innerHTML =
      "<strong>Bet confirmed. Waiting for results...</strong>";
    movingMsgEl.style.marginTop = "15px";
    movingMsgEl.style.color = "#00ff00";
    contentEl.appendChild(movingMsgEl);

    ws.send(
      JSON.stringify({
        type: "updateWager",
        clientID: sessionStorage.getItem("PROLIFIC_PID"),
        sessionID: sessionID,
        wagerType: "finalWager",
        value: finalWager,
      })
    );
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID"),
        sessionID: sessionID,
        phase: "finalDecision",
      })
    );
  }

  function buildResultScreen() {
    resultScreen = document.createElement("div");
    resultScreen.classList.add("screen");
    resultScreen.id = "result-screen";
    resultScreen.innerHTML = `
    <h2>Trial <span id="result-trial-number"></span> Outcome</h2>
    <div id="result-content"></div>
    <div id="result-countdown"></div>
  `;
    appContainer.appendChild(resultScreen);
  }

  function onNextTrial() {
    if (resultConfirmed) return;
    resultConfirmed = true;

    // Send confirmation to server
    ws.send(
      JSON.stringify({
        type: "confirmDecision",
        clientID: sessionStorage.getItem("PROLIFIC_PID"),
        sessionID: sessionID,
        phase: "result",
      })
    );
  }

  function showTrialScreenSolo() {
    hideAllScreens();
    if (!initialScreen || !currentFightData) {
      console.error("Cannot show solo screen - missing screen or data");
      return;
    }

    console.log("Showing solo trial screen for trial", currentTrial);

    initialScreen.querySelector("#solo-trial-number").textContent =
      currentTrial;

    initialWager = 2;

    const contentEl = initialScreen.querySelector("#initial-content");
    const wallet = utilities.getWallet();
    contentEl.innerHTML = `
    <div class="main-layout">
      <div class="left-section">
        <p><strong>💰 Wallet:</strong> $${wallet}</p>
        ${generateFighterTableHTML()}
        <div class="ai-highlight">
          <p><strong>AI Prediction:</strong> ${
            currentFightData.aiPrediction
          }</p>
          ${
            window.aiMode !== "neutralAI"
              ? `<p><strong>Explanation:</strong> ${
                  currentFightData.justification || "N/A"
                }</p>`
              : ""
          }
        </div>
      </div>
      <div class="right-section initial-bet-position">
        <div class="wager-slider-container">
          <label for="initial-wager-range">Initial Bet (0-4): <span id="initial-wager-value">${initialWager}</span></label>
          <input type="range" min="0" max="4" step="1" value="${initialWager}" id="initial-wager-range" />
        </div>
        <button id="btn-confirm-initial">Confirm Initial Bet</button>
      </div>
    </div>
  `;

    const confirmButton = contentEl.querySelector("#btn-confirm-initial");
    confirmButton.disabled = false;
    confirmButton.addEventListener("click", onConfirmInitial);

    const wagerSlider = contentEl.querySelector("#initial-wager-range");
    wagerSlider.disabled = false;
    wagerSlider.value = initialWager;
    wagerSlider.addEventListener("input", (e) => {
      if (!soloInitialConfirmed) {
        initialWager = parseInt(e.target.value, 10);
        document.getElementById("initial-wager-value").textContent =
          initialWager;
      }
    });

    initialScreen.style.display = "block";
    initialScreen.style.visibility = "visible";

    setTimeout(() => {
      if (initialScreen.style.display !== "block") {
        console.warn("Solo screen not visible, forcing display");
        initialScreen.style.display = "block";
        initialScreen.style.visibility = "visible";
      }
    }, 100);
  }

  function showGroupDelibScreen(rejoinWagers = null) {
    hideAllScreens();
    if (!groupDelibScreen || !currentFightData) {
      console.error("Cannot show group screen - missing screen or data");
      return;
    }

    console.log(
      `Showing group delib screen for trial ${currentTrial}, phase: ${currentPhase}, subPhase: ${currentSubPhase}`
    );

    groupDelibScreen.querySelector("#group-trial-number").textContent =
      currentTrial;
    const phaseTitle = groupDelibScreen.querySelector("#group-phase-title");
    const wagerSection = groupDelibScreen.querySelector("#wager-section");
    const chatSection = groupDelibScreen.querySelector("#chat-section");
    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    const confirmButton = groupDelibScreen.querySelector(
      "#btn-confirm-group-wager"
    );
    const confirmedWagersDisplay = groupDelibScreen.querySelector(
      "#confirmed-wagers-display"
    );
    const wagersContainer = groupDelibScreen.querySelector("#wagers-container");

    const fightInfoEl = groupDelibScreen.querySelector("#group-fight-info");
    const wallet = utilities.getWallet();
    fightInfoEl.innerHTML = `
      <p><strong>💰 Wallet:</strong> $${wallet}</p>
      ${generateFighterTableHTML()}
      <div class="ai-highlight">
        <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
        ${
          window.aiMode !== "neutralAI"
            ? `<p><strong>Explanation:</strong> ${
                currentFightData.justification || "N/A"
              }</p>`
            : ""
        }
      </div>
    `;

    if (currentSubPhase === "wager") {
      phaseTitle.textContent = "Bet Phase";
      wagerSection.style.display = "block";
      chatSection.style.display = "none";
      confirmedWagersDisplay.style.display = "none";

      wagerSlider.disabled = isGroupWagerConfirmed;
      wagerSlider.value = initialWager;
      document.getElementById("group-wager-value").textContent = initialWager;
      confirmButton.disabled = isGroupWagerConfirmed;
      confirmButton.textContent = isGroupWagerConfirmed
        ? "Bet Confirmed"
        : "Confirm Bet";
      enableChatInputUI(false);

      if (isGroupWagerConfirmed) {
        wagersContainer.innerHTML = "";
        const confirmationMsg = document.createElement("div");
        confirmationMsg.className = "confirmation-message persistent-waiting";
        confirmationMsg.innerHTML = `Your bet of ${initialWager} has been confirmed.`;
        confirmationMsg.style.color = "#00ff00";
        confirmationMsg.style.marginTop = "15px";
        wagersContainer.appendChild(confirmationMsg);
        confirmedWagersDisplay.style.display = "flex";
      } else {
        wagersContainer.innerHTML =
          '<p style="color: #aaa; width: 100%; text-align: center;">Select your bet above.</p>';
      }

      if (rejoinWagers && Object.keys(rejoinWagers).length > 0) {
        const myClientID = sessionStorage.getItem("PROLIFIC_PID");
        if (rejoinWagers[myClientID] !== undefined) {
          isGroupWagerConfirmed = true;
          initialWager = rejoinWagers[myClientID];
          wagerSlider.value = initialWager;
          document.getElementById("group-wager-value").textContent =
            initialWager;
          wagerSlider.disabled = true;
          confirmButton.disabled = true;
          confirmButton.textContent = "Bet Confirmed";
          wagersContainer.innerHTML = "";
          const confirmationMsg = document.createElement("div");
          confirmationMsg.className = "confirmation-message persistent-waiting";
          confirmationMsg.innerHTML = `Your bet of ${initialWager} has been confirmed.`;
          confirmationMsg.style.color = "#00ff00";
          confirmationMsg.style.marginTop = "15px";
          wagersContainer.appendChild(confirmationMsg);
          confirmedWagersDisplay.style.display = "flex";
        }
      }
    } else if (currentSubPhase === "chat") {
      phaseTitle.textContent = "Chat Phase";
      wagerSection.style.display = "none";
      chatSection.style.display = "block";
      confirmedWagersDisplay.style.display = "flex";

      groupDelibScreen.querySelector("#chat-messages").innerHTML = "";
      groupDelibScreen.querySelector("#chat-input-text").value = "";
      enableChatInputUI(true);

      if (rejoinWagers && Object.keys(rejoinWagers).length > 0) {
        displayAllConfirmedWagers(rejoinWagers);
      }
    } else {
      phaseTitle.textContent = "Processing...";
      wagerSection.style.display = "none";
      chatSection.style.display = "none";
      confirmedWagersDisplay.style.display = "none";
    }

    groupDelibScreen.style.display = "block";
    groupDelibScreen.style.visibility = "visible";

    setTimeout(() => {
      if (groupDelibScreen.style.display !== "block") {
        console.warn("Group screen not visible, forcing display");
        groupDelibScreen.style.display = "block";
        groupDelibScreen.style.visibility = "visible";
      }
    }, 100);
  }

  function showFinalDecisionScreen() {
    hideAllScreens();
    if (!finalDecisionScreen || !currentFightData) {
      console.error("Final decision screen or fight data not ready.");
      return;
    }

    console.log("Showing final decision screen for trial", currentTrial);

    finalDecisionScreen.querySelector("#final-trial-number").textContent =
      currentTrial;

    finalWager = initialWager;

    const contentEl = finalDecisionScreen.querySelector(
      "#final-decision-content"
    );
    const wallet = utilities.getWallet();
    contentEl.innerHTML = `
    <div class="main-layout">
      <div class="left-section">
        <p><strong>💰 Wallet:</strong> $${wallet}</p>
        ${generateFighterTableHTML()}
        <div class="ai-highlight">
          <p><strong>AI Prediction:</strong> ${
            currentFightData.aiPrediction
          }</p>
          ${
            window.aiMode !== "neutralAI"
              ? `<p><strong>Explanation:</strong> ${
                  currentFightData.justification || "N/A"
                }</p>`
              : ""
          }
        </div>
      </div>
      <div class="right-section final-bet-position">
        <div class="wager-slider-container">
          <label for="final-wager-range">Final Bet (0-4): <span id="final-wager-value">${finalWager}</span></label>
          <input type="range" min="0" max="4" step="1" value="${finalWager}" id="final-wager-range" />
        </div>
        <button id="btn-confirm-decision">Confirm Final Bet</button>
        <p class="confirmation-message" style="margin-top: 15px; font-weight: bold; display: none;"></p>
      </div>
    </div>
  `;

    const confirmButton = contentEl.querySelector("#btn-confirm-decision");
    confirmButton.disabled = false;
    confirmButton.addEventListener("click", onConfirmFinalDecision);

    const finalWagerSlider = contentEl.querySelector("#final-wager-range");
    finalWagerSlider.disabled = false;
    finalWagerSlider.value = finalWager;
    finalWagerSlider.addEventListener("input", (e) => {
      if (!finalDecisionConfirmed) {
        finalWager = parseInt(e.target.value, 10);
        document.getElementById("final-wager-value").textContent = finalWager;
      }
    });

    const msgEl = contentEl.querySelector(".confirmation-message");
    if (msgEl) msgEl.style.display = "none";

    finalDecisionScreen.style.display = "block";
    finalDecisionScreen.style.visibility = "visible";

    setTimeout(() => {
      if (finalDecisionScreen.style.display !== "block") {
        console.warn("Final decision screen not visible, forcing display");
        finalDecisionScreen.style.display = "block";
        finalDecisionScreen.style.visibility = "visible";
      }
    }, 100);
  }

  function showResultScreen() {
    hideAllScreens();
    if (!resultScreen || !currentFightData || serverAiCorrect === null) {
      console.error("Result screen, fight data, or AI correctness not ready.");
      const contentEl = resultScreen?.querySelector("#result-content");
      if (contentEl) contentEl.innerHTML = "<p>Loading results...</p>";
      if (resultScreen) {
        resultScreen.style.display = "block";
        resultScreen.style.visibility = "visible";
      }
      return;
    }

    console.log("Showing result screen for trial", currentTrial);

    resultScreen.querySelector("#result-trial-number").textContent =
      currentTrial;

    let walletBefore = utilities.getWallet();
    let outcomeText = "";
    let stakeAmount = finalWager;

    if (serverAiCorrect) {
      let winnings = stakeAmount * 2;
      utilities.setWallet(walletBefore - stakeAmount + winnings);
      outcomeText = `AI was correct! You bet ${stakeAmount} and won ${winnings}.`;
    } else {
      utilities.setWallet(walletBefore - stakeAmount);
      outcomeText = `AI was wrong. You bet ${stakeAmount} and lost ${stakeAmount}.`;
    }

    let walletAfter = utilities.getWallet();
    const resultContent = resultScreen.querySelector("#result-content");

    let winnerText = "Unknown";
    if (
      currentFightData.winner !== undefined &&
      currentFightData.winner !== null
    ) {
      winnerText = `Fighter ${currentFightData.winner == 0 ? "B" : "A"} wins`;
    }

    resultContent.innerHTML = `
      <p><strong>Fight Outcome:</strong> ${winnerText}</p>
      <p><strong>AI Prediction was:</strong> ${
        serverAiCorrect
          ? '<span style="color: lightgreen;">Correct</span>'
          : '<span style="color: salmon;">Incorrect</span>'
      }</p>
      <p>${outcomeText}</p>
      <hr style="margin: 10px 0; border-color: #555;">
      <p>💰 Wallet before: $${walletBefore}</p>
      <p><strong>💰 Wallet after: $${walletAfter}</strong></p>
    `;

    resultScreen.style.display = "block";
    resultScreen.style.visibility = "visible";

    setTimeout(() => {
      if (resultScreen.style.display !== "block") {
        console.warn("Result screen not visible, forcing display");
        resultScreen.style.display = "block";
        resultScreen.style.visibility = "visible";
      }
    }, 100);

    if (!trialDataSaved) {
      saveTrialData(walletBefore, walletAfter);
    } else {
      console.log(`Trial ${currentTrial} data already saved.`);
    }
  }

  function saveTrialData(walletBefore, walletAfter) {
    if (trialDataSaved) {
      return;
    }
    if (!currentFightData) {
      return;
    }

    const clientID = sessionStorage.getItem("PROLIFIC_PID");
    const trialDataPayload = {
      trialNumber: currentTrial,
      mode: isSolo ? "solo" : "group",
      fighterData: {
        ...currentFightData,
      },
      initialWager: initialWager,
      finalWager: finalWager,
      chatMessages: isSolo ? [] : groupChatMessages,
      aiCorrect: serverAiCorrect,
      walletBefore: walletBefore,
      walletAfter: walletAfter,
      timestamp: new Date().toISOString(),
      clientID: clientID,
      sessionID: sessionID,
      aiMode: window.aiMode || null,
    };

    trialResults.push(trialDataPayload);

    ws.send(
      JSON.stringify({
        type: "sendData",
        payload: { event: "trialData", data: trialDataPayload },
      })
    );
  }

  function hideAllScreens() {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      if (screen) {
        screen.style.display = "none";
        screen.style.visibility = "hidden";
      }
    });

    setTimeout(() => {
      screens.forEach((screen) => {
        if (screen && screen.id !== "onboarding-screen") {
          screen.style.visibility = "visible";
        }
      });
    }, 50);
  }

  function generateFighterTableHTML() {
    if (!currentFightData) return "<p>Error: Fighter data not loaded.</p>";
    const fa = currentFightData.fighterA || {};
    const fb = currentFightData.fighterB || {};

    const fighterAWins = currentFightData.predicted_winner_numeric === 1;
    const fighterBWins = currentFightData.predicted_winner_numeric === 0;

    const featureToRowMap = {
      Wins: 0,
      Losses: 1,
      Age: 2,
      Height: 3,
      "Strikes Landed per Minute": 4,
      "Significant Strikes Accuracy": 5,
      "Strike Defense": 6,
      "Takedown Accuracy": 7,
      "Takedown Defense": 8,
      "Strikes Avoided per Minute": 9,
    };

    const rationaleFeature = currentFightData.aiRationale || "";

    const rowToHighlight = featureToRowMap[rationaleFeature];

    return `
      <div class="fighter-table-container">
        <table class="fighter-table">
          <thead>
            <tr>
              <th>Stat</th>
              <th class="${fighterAWins ? "winner-column" : ""}">Fighter A</th>
              <th class="${fighterBWins ? "winner-column" : ""}">Fighter B</th>
            </tr>
          </thead>
          <tbody>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 0
                ? "rationale-row"
                : ""
            }">
              <td>Wins</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.wins ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.wins ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 1
                ? "rationale-row"
                : ""
            }">
              <td>Losses</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.losses ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.losses ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 2
                ? "rationale-row"
                : ""
            }">
              <td>Age (yrs) </td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.age ? fa.age : "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.age ? fb.age : "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 3
                ? "rationale-row"
                : ""
            }">
              <td>Height</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.height || "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.height || "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 4
                ? "rationale-row"
                : ""
            }">
              <td>Strikes Landed/Min</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.strikelaM ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.strikelaM ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 5
                ? "rationale-row"
                : ""
            }">
              <td>Strike Accuracy (%) </td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.sigSacc ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.sigSacc ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 6
                ? "rationale-row"
                : ""
            }">
              <td>Strike Defense (%) </td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.strDef ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.strDef ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 7
                ? "rationale-row"
                : ""
            }">
              <td>Takedown Accuracy (%) </td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.tdAcc ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.tdAcc ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 8
                ? "rationale-row"
                : ""
            }">
              <td>Takedown Defense (%) </td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.tdDef ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.tdDef ?? "N/A"
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 9
                ? "rationale-row"
                : ""
            }">
              <td>Strikes Avoided/Min</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.SApM ?? "N/A"
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.SApM ?? "N/A"
    }</td>
            </tr>
          </tbody>
        </table>
      </div>
      `;
  }

  function loadTrialData() {
    const trialDataRow = window.currentTrialData?.[currentTrial];

    if (!trialDataRow) {
      console.error(
        `No trial data found in window.currentTrialData for trial ${currentTrial}`
      );
      currentFightData = null;
      return;
    }

    try {
      const formatPercent = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) ? (num * 100).toFixed(0) : "N/A";
      };
      const formatAge = (value) => {
        const num = parseInt(value, 10);
        return !isNaN(num) ? Math.floor(num) : null;
      };
      const formatPerMin = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : "N/A";
      };

      currentFightData = {
        fighterA: {
          wins: parseInt(trialDataRow.r_wins_total) || 0,
          losses: parseInt(trialDataRow.r_losses_total) || 0,
          age: parseInt(trialDataRow.r_age) || 0,
          height: trialDataRow.r_height || "N/A",
          strikelaM: formatPerMin(trialDataRow.r_SLpM_total),
          sigSacc: formatPercent(trialDataRow.r_sig_str_acc_total),
          strDef: formatPercent(trialDataRow.r_str_def_total),
          tdDef: formatPercent(trialDataRow.r_td_def_total),
          SApM: formatPerMin(trialDataRow.r_SApM_total),
          tdAcc: formatPercent(trialDataRow.r_td_acc_total),
        },
        fighterB: {
          wins: parseInt(trialDataRow.b_wins_total) || 0,
          losses: parseInt(trialDataRow.b_losses_total) || 0,
          age: parseInt(trialDataRow.b_age) || 0,
          height: trialDataRow.b_height || "N/A",
          strikelaM: formatPerMin(trialDataRow.b_SLpM_total),
          sigSacc: formatPercent(trialDataRow.b_sig_str_acc_total),
          strDef: formatPercent(trialDataRow.b_str_def_total),
          tdDef: formatPercent(trialDataRow.b_td_def_total),
          SApM: formatPerMin(trialDataRow.b_SApM_total),
          tdAcc: formatPercent(trialDataRow.b_td_acc_total),
        },
        predicted_winner_numeric:
          trialDataRow.predicted_winner === "0" ||
          trialDataRow.predicted_winner === 0
            ? 0
            : 1,
        aiPrediction: `Fighter ${
          trialDataRow.predicted_winner === "0" ||
          trialDataRow.predicted_winner === 0
            ? "B"
            : "A"
        } to win`,
        aiRationale: trialDataRow.rationale_feature || "N/A",
        winner:
          trialDataRow.winner !== undefined
            ? parseInt(trialDataRow.winner)
            : null,
        justification: utilities.formatFighterNames(
          trialDataRow.justification || ""
        ),
      };
    } catch (error) {
      console.error(
        "Error processing trial data row:",
        error,
        "Row:",
        trialDataRow
      );
      currentFightData = null;
    }
  }

  return {
    init,
    getTrialResults: () => trialResults,
  };
})();