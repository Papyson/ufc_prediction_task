const practice = (() => {
  let ws = null;
  let appContainer = null;
  let practiceScreen = null;
  let currentMode = null;
  let practiceInProgress = false;
  let keepAliveInterval = null;

  let PRACTICE_TRIALS = 10;
  let currentPracticeTrial = 1;
  let practiceWallet = 100;
  let initialWager = 2;
  let finalWager = 2;
  let currentPhase = null;
  let currentSubPhase = null;
  let phaseStartTime = null;
  let phaseDuration = null;
  let countdownIntervalId = null;
  let autoTransitionTimerId = null;

  const practiceTrialData = [
    {
      fighterA: {
        wins: 7,
        losses: 5,
        age: 35,
        height: "195.58",
        strikelaM: "4.79",
        sigSacc: "50",
        strDef: "55",
        tdDef: "64",
        SApM: "3.31",
        tdAcc: "33",
      },
      fighterB: {
        wins: 5,
        losses: 3,
        age: 32,
        height: "195.58",
        strikelaM: "7.09",
        sigSacc: "55",
        strDef: "34",
        tdDef: "57",
        SApM: "4.06",
        tdAcc: "66",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Strikes Avoided per Minute",
      winner: 1,
      justification:
        "Fighter B is more likely to win thanks to its higher Strikes Avoided per Minute compared to its opponent.",
    },
    {
      fighterA: {
        wins: 25,
        losses: 16,
        age: 48,
        height: "190.5",
        strikelaM: "1.55",
        sigSacc: "52",
        strDef: "46",
        tdDef: "35",
        SApM: "2.7",
        tdAcc: "16",
      },
      fighterB: {
        wins: 11,
        losses: 9,
        age: 47,
        height: "187.96",
        strikelaM: "2.55",
        sigSacc: "39",
        strDef: "63",
        tdDef: "64",
        SApM: "2.42",
        tdAcc: "25",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Age",
      winner: 1,
      justification:
        "Fighter B is favored because it has a lower Age compared to its opponent.",
    },
    {
      fighterA: {
        wins: 20,
        losses: 10,
        age: 36,
        height: "185.42",
        strikelaM: "3.38",
        sigSacc: "43",
        strDef: "55",
        tdDef: "81",
        SApM: "3.15",
        tdAcc: "26",
      },
      fighterB: {
        wins: 11,
        losses: 5,
        age: 34,
        height: "187.96",
        strikelaM: "1.95",
        sigSacc: "42",
        strDef: "52",
        tdDef: "53",
        SApM: "2.14",
        tdAcc: "39",
      },
      predicted_winner_numeric: 1,
      aiPrediction: "Fighter A to win",
      aiRationale: "Significant Strikes Accuracy",
      winner: 1,
      justification:
        "A higher Significant Strikes Accuracy gives Fighter A a competitive advantage in the fight.",
    },
    {
      fighterA: {
        wins: 20,
        losses: 6,
        age: 36,
        height: "177.8",
        strikelaM: "2.53",
        sigSacc: "45",
        strDef: "65",
        tdDef: "66",
        SApM: "2.14",
        tdAcc: "29",
      },
      fighterB: {
        wins: 12,
        losses: 6,
        age: 31,
        height: "185.42",
        strikelaM: "2.12",
        sigSacc: "48",
        strDef: "49",
        tdDef: "55",
        SApM: "2.25",
        tdAcc: "100",
      },
      predicted_winner_numeric: 1,
      aiPrediction: "Fighter A to win",
      aiRationale: "Wins",
      winner: 1,
      justification:
        "Fighter A is favored because it has a higher Wins, indicating superior performance.",
    },
    {
      fighterA: {
        wins: 25,
        losses: 4,
        age: 35,
        height: "180.34",
        strikelaM: "7.35",
        sigSacc: "60",
        strDef: "53",
        tdDef: "75",
        SApM: "7.5",
        tdAcc: "25",
      },
      fighterB: {
        wins: 13,
        losses: 5,
        age: 37,
        height: "190.50",
        strikelaM: "4.13",
        sigSacc: "39",
        strDef: "60",
        tdDef: "57",
        SApM: "3.31",
        tdAcc: "33",
      },
      predicted_winner_numeric: 1,
      aiPrediction: "Fighter A to win",
      aiRationale: "Strikes Avoided per Minute",
      winner: 1,
      justification:
        "Fighter A is favored because it has a higher Strikes Avoided per Minute, indicating superior performance.",
    },
    {
      fighterA: {
        wins: 23,
        losses: 7,
        age: 36,
        height: "180.34",
        strikelaM: "5.12",
        sigSacc: "39",
        strDef: "54",
        tdDef: "91",
        SApM: "7.1",
        tdAcc: "29",
      },
      fighterB: {
        wins: 19,
        losses: 4,
        age: 39,
        height: "167.64",
        strikelaM: "4.04",
        sigSacc: "36",
        strDef: "61",
        tdDef: "46",
        SApM: "4.61",
        tdAcc: "37",
      },
      predicted_winner_numeric: 1,
      aiPrediction: "Fighter A to win",
      aiRationale: "Takedown Defense",
      winner: 0,
      justification:
        "A higher Takedown Defense gives Fighter A a competitive advantage in the fight.",
    },
    {
      fighterA: {
        wins: 38,
        losses: 21,
        age: 42,
        height: "170.18",
        strikelaM: "2.64",
        sigSacc: "33",
        strDef: "61",
        tdDef: "67",
        SApM: "3.01",
        tdAcc: "36",
      },
      fighterB: {
        wins: 36,
        losses: 11,
        age: 45,
        height: "170.18",
        strikelaM: "2.04",
        sigSacc: "44",
        strDef: "50",
        tdDef: "63",
        SApM: "2.01",
        tdAcc: "48",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Takedown Accuracy",
      winner: 1,
      justification:
        "Fighter B is more likely to win thanks to its higher Takedown Accuracy compared to its opponent.",
    },
    {
      fighterA: {
        wins: 34,
        losses: 23,
        age: 45,
        height: "190.5",
        strikelaM: "3.78",
        sigSacc: "45",
        strDef: "57",
        tdDef: "76",
        SApM: "3.2",
        tdAcc: "36",
      },
      fighterB: {
        wins: 16,
        losses: 5,
        age: 32,
        height: "190.5",
        strikelaM: "4.6",
        sigSacc: "49",
        strDef: "48",
        tdDef: "56",
        SApM: "3.83",
        tdAcc: "40",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Significant Strikes Accuracy",
      winner: 0,
      justification:
        "A higher Significant Strikes Accuracy gives Fighter B a competitive advantage in the fight.",
    },
    {
      fighterA: {
        wins: 23,
        losses: 9,
        age: 31,
        height: "172.72",
        strikelaM: "4.31",
        sigSacc: "49",
        strDef: "50",
        tdDef: "70",
        SApM: "5.48",
        tdAcc: "39",
      },
      fighterB: {
        wins: 17,
        losses: 4,
        age: 31,
        height: "180.34",
        strikelaM: "5.33",
        sigSacc: "44",
        strDef: "58",
        tdDef: "64",
        SApM: "3.4",
        tdAcc: "33",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Strike Defense",
      winner: 0,
      justification:
        "Fighter is favored because it has a higher Strike Defense, indicating superior performance.",
    },
    {
      fighterA: {
        wins: 13,
        losses: 4,
        age: 36,
        height: "190.5",
        strikelaM: "2.08",
        sigSacc: "52",
        strDef: "34",
        tdDef: "33",
        SApM: "2.47",
        tdAcc: "33",
      },
      fighterB: {
        wins: 14,
        losses: 5,
        age: 37,
        height: "193.04",
        strikelaM: "2.07",
        sigSacc: "49",
        strDef: "46",
        tdDef: "33",
        SApM: "1.6",
        tdAcc: "50",
      },
      predicted_winner_numeric: 0,
      aiPrediction: "Fighter B to win",
      aiRationale: "Height",
      winner: 0,
      justification:
        "Fighter B is more likely to win thanks to its higher Height compared to its opponent",
    },
  ];

  let practiceParticipants = [];
  let practiceWagers = {};
  let practiceChatMessages = [];
  let practicePhaseFlags = {
    soloInitialConfirmed: false,
    groupWagerConfirmed: false,
    finalDecisionConfirmed: false,
    resultConfirmed: false,
  };

  const PHASE_DURATION = 15000;
  const CHAT_DURATION = 30000;

  function init(wsConnection) {
    ws = wsConnection;
    appContainer = document.getElementById("app-container");
    createPracticeScreen();
  }

  function setPracticeTrials(count) {
    PRACTICE_TRIALS = count;
  }

  function createPracticeScreen() {
    practiceScreen = document.createElement("div");
    practiceScreen.classList.add("screen");
    practiceScreen.id = "practice-screen";
    practiceScreen.style.display = "none";

    practiceScreen.innerHTML = `
     <div id="practice-countdown-display" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; border: 2px solid #ffcc00; display: none;">
        <div style="color: #ffcc00; font-weight: bold; font-size: 1.1em;">Practice Timer</div>
        <div style="color: #aaa; font-size: 0.8em; text-align: center; margin-bottom: 2px;" id="practice-trial-info">Trial 1 of 10</div>
        <div id="practice-countdown-timer" style="color: #fff; font-size: 1.3em; text-align: center;">--:--</div>
    </div>
      <h2 id="practice-title">Practice Round</h2>
      <div id="practice-content">
        <p>Starting practice session...</p>
      </div>
    `;

    appContainer.appendChild(practiceScreen);
  }

  function startPractice(mode) {
    currentMode = mode;
    currentPracticeTrial = 1;
    practiceWallet = 100;
    practiceInProgress = true;

    hideAllScreens();
    practiceScreen.style.display = "block";
    document.getElementById("practice-countdown-display").style.display =
      "block";

    document.getElementById("practice-title").textContent = `Practice Round - ${
      mode === "solo" ? "Solo" : "Group"
    } Mode`;

    startKeepAlive();

    if (mode === "group") {
      initializeGroupPractice();
    }

    setTimeout(() => {
      startPracticeTrial();
    }, 1000);
  }

  function initializeGroupPractice() {
    const botNames = [
      "Alex",
      "Jordan",
      "Casey",
      "Riley",
      "Morgan",
      "Taylor",
      "Avery",
      "Quinn",
    ];
    const selectedNames = botNames.sort(() => 0.5 - Math.random()).slice(0, 2);

    practiceParticipants = [
      { id: "bot1", name: selectedNames[0] },
      { id: "bot2", name: selectedNames[1] },
    ];
  }

  function startPracticeTrial() {
    if (currentPracticeTrial >= PRACTICE_TRIALS) {
      completePractice();
      return;
    }

    resetPracticePhaseFlags();

    const trialIndex = (currentPracticeTrial - 1) % practiceTrialData.length;
    const currentTrialData = practiceTrialData[trialIndex];

    if (currentMode === "solo") {
      startSoloPracticePhase("initial", currentTrialData);
    } else {
      startGroupPracticePhase("groupDelib", "wager", currentTrialData);
    }
  }

  function startSoloPracticePhase(phase, trialData) {
    currentPhase = phase;
    phaseStartTime = Date.now();
    phaseDuration = PHASE_DURATION;

    clearAllTimers();

    if (phase === "initial") {
      showSoloPracticeInitial(trialData);
    } else if (phase === "finalDecision") {
      showSoloPracticeFinal(trialData);
    } else if (phase === "result") {
      showSoloPracticeResult(trialData);
    }

    setupPracticeCountdown();
  }

  function startGroupPracticePhase(phase, subPhase, trialData) {
    currentPhase = phase;
    currentSubPhase = subPhase;
    phaseStartTime = Date.now();
    phaseDuration =
      phase === "groupDelib" && subPhase === "chat"
        ? CHAT_DURATION
        : PHASE_DURATION;

    clearAllTimers();

    if (phase === "groupDelib") {
      showGroupPracticeDelib(trialData);
    } else if (phase === "finalDecision") {
      showGroupPracticeFinal(trialData);
    } else if (phase === "result") {
      showGroupPracticeResult(trialData);
    }

    setupPracticeCountdown();
  }

  function showSoloPracticeInitial(trialData) {
    initialWager = 2;
    practicePhaseFlags.soloInitialConfirmed = false;

    const content = document.getElementById("practice-content");
    content.innerHTML = `
      <h3>Practice Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS} - Initial Bet</h3>
      <div class="main-layout">
        <div class="left-section">
          <p><strong>💰 Wallet:</strong> $${practiceWallet}</p>
          ${generatePracticeFighterTableHTML(trialData)}
          <div class="ai-highlight">
            <p><strong>AI Prediction:</strong> ${trialData.aiPrediction}</p>
            ${
              window.aiMode !== "neutralAI"
                ? `<p><strong>Explanation:</strong> ${trialData.justification}</p>`
                : ""
            }
          </div>
        </div>
        <div class="right-section initial-bet-position">
          <div class="wager-slider-container">
            <label for="practice-initial-wager">Initial Bet (0-4): <span id="practice-initial-value">${initialWager}</span></label>
            <input type="range" min="0" max="4" step="1" value="${initialWager}" id="practice-initial-wager" />
          </div>
          <button id="practice-confirm-initial">Confirm Initial Bet</button>
        </div>
      </div>
      <div id="practice-countdown"></div>
    `;

    const trialInfo = document.getElementById("practice-trial-info");
    if (trialInfo) {
      trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
    }

    const wagerSlider = content.querySelector("#practice-initial-wager");
    const confirmButton = content.querySelector("#practice-confirm-initial");

    wagerSlider.addEventListener("input", (e) => {
      if (!practicePhaseFlags.soloInitialConfirmed) {
        initialWager = parseInt(e.target.value, 10);
        document.getElementById("practice-initial-value").textContent =
          initialWager;
      }
    });

    confirmButton.addEventListener("click", () => {
      if (!practicePhaseFlags.soloInitialConfirmed) {
        practicePhaseFlags.soloInitialConfirmed = true;
        wagerSlider.disabled = true;
        confirmButton.disabled = true;
        confirmButton.textContent = "Bet Confirmed";

        const confirmMsg = document.createElement("p");
        confirmMsg.innerHTML = `<strong>Bet confirmed: ${initialWager}.</strong>`;
        confirmMsg.style.marginTop = "15px";
        confirmMsg.style.color = "#00ff00";
        content.appendChild(confirmMsg);
      }
    });
  }

  function showSoloPracticeFinal(trialData) {
    finalWager = initialWager;
    practicePhaseFlags.finalDecisionConfirmed = false;

    const content = document.getElementById("practice-content");
    content.innerHTML = `
      <h3>Practice Trial ${currentPracticeTrial} - Final Bet</h3>
      <div class="main-layout">
        <div class="left-section">
          <p><strong>💰 Wallet:</strong> $${practiceWallet}</p>
          ${generatePracticeFighterTableHTML(trialData)}
          <div class="ai-highlight">
            <p><strong>AI Prediction:</strong> ${trialData.aiPrediction}</p>
            ${
              window.aiMode !== "neutralAI"
                ? `<p><strong>Explanation:</strong> ${trialData.justification}</p>`
                : ""
            }
          </div>
        </div>
        <div class="right-section final-bet-position">
          <div class="wager-slider-container">
            <label for="practice-final-wager">Final Bet (0-4): <span id="practice-final-value">${finalWager}</span></label>
            <input type="range" min="0" max="4" step="1" value="${finalWager}" id="practice-final-wager" />
          </div>
          <button id="practice-confirm-final">Confirm Final Bet</button>
        </div>
      </div>
      <div id="practice-countdown"></div>
    `;

    const trialInfo = document.getElementById("practice-trial-info");
    if (trialInfo) {
      trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
    }

    const wagerSlider = content.querySelector("#practice-final-wager");
    const confirmButton = content.querySelector("#practice-confirm-final");

    wagerSlider.addEventListener("input", (e) => {
      if (!practicePhaseFlags.finalDecisionConfirmed) {
        finalWager = parseInt(e.target.value, 10);
        document.getElementById("practice-final-value").textContent =
          finalWager;
      }
    });

    confirmButton.addEventListener("click", () => {
      if (!practicePhaseFlags.finalDecisionConfirmed) {
        practicePhaseFlags.finalDecisionConfirmed = true;
        wagerSlider.disabled = true;
        confirmButton.disabled = true;
        confirmButton.textContent = "Final Bet Confirmed";

        const confirmMsg = document.createElement("p");
        confirmMsg.innerHTML =
          "<strong>Bet confirmed. Waiting for results...</strong>";
        confirmMsg.style.marginTop = "15px";
        confirmMsg.style.color = "#00ff00";
        content.appendChild(confirmMsg);
      }
    });
  }

  function showSoloPracticeResult(trialData) {
    const walletBefore = practiceWallet;
    const stakeAmount = finalWager;
    const aiCorrect = trialData.winner === trialData.predicted_winner_numeric;

    let outcomeText = "";
    if (aiCorrect) {
      const winnings = stakeAmount * 2;
      practiceWallet = walletBefore - stakeAmount + winnings;
      outcomeText = `AI was correct! You bet ${stakeAmount} and won ${winnings}.`;
    } else {
      practiceWallet = walletBefore - stakeAmount;
      outcomeText = `AI was wrong. You bet ${stakeAmount} and lost ${stakeAmount}.`;
    }

    const winnerText = `Fighter ${trialData.winner === 0 ? "B" : "A"} wins`;

    const content = document.getElementById("practice-content");
    content.innerHTML = `
      <h3>Practice Trial ${currentPracticeTrial} Outcome</h3>
      <p><strong>Fight Outcome:</strong> ${winnerText}</p>
      <p><strong>AI Prediction was:</strong> ${
        aiCorrect
          ? '<span style="color: lightgreen;">Correct</span>'
          : '<span style="color: salmon;">Incorrect</span>'
      }</p>
      <p>${outcomeText}</p>
      <hr style="margin: 10px 0; border-color: #555;">
      <p>💰 Wallet before: $${walletBefore}</p>
      <p><strong>💰 Wallet after: $${practiceWallet}</strong></p>
      <div id="practice-countdown"></div>
    `;

    const trialInfo = document.getElementById("practice-trial-info");
    if (trialInfo) {
      trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
    }

    practicePhaseFlags.resultConfirmed = false;
  }

  function showGroupPracticeDelib(trialData) {
    const content = document.getElementById("practice-content");

    if (currentSubPhase === "wager") {
      initialWager = 2;
      practicePhaseFlags.groupWagerConfirmed = false;
      practiceWagers = {};

      content.innerHTML = `
        <h3>Practice Group Trial ${currentPracticeTrial} - Bet Phase</h3>
        <div class="main-layout">
          <div class="left-section">
            <p><strong>💰 Wallet:</strong> $${practiceWallet}</p>
            ${generatePracticeFighterTableHTML(trialData)}
            <div class="ai-highlight">
              <p><strong>AI Prediction:</strong> ${trialData.aiPrediction}</p>
              ${
                window.aiMode !== "neutralAI"
                  ? `<p><strong>Explanation:</strong> ${trialData.justification}</p>`
                  : ""
              }
            </div>
          </div>
          <div class="right-section">
            <div id="practice-wager-section">
              <h3>Your Bet</h3>
              <div class="wager-slider-container">
                <label for="practice-group-wager">Bet Scale (0-4): <span id="practice-group-value">${initialWager}</span></label>
                <input type="range" id="practice-group-wager" min="0" max="4" step="1" value="${initialWager}">
              </div>
              <div class="confirm-bet-area">
                <button id="practice-confirm-group-wager">Confirm Bet</button>
              </div>
            </div>
            <div id="practice-confirmed-wagers" class="confirmed-wagers-display" style="display: none;">
              <h3 class="wagers-title">Initial Bets</h3>
              <div id="practice-wagers-container" class="wagers-container">
                <p style="color: #aaa; width: 100%; text-align: center;">Waiting for all bets...</p>
              </div>
            </div>
          </div>
        </div>
        <div id="practice-countdown"></div>
      `;

      const trialInfo = document.getElementById("practice-trial-info");
      if (trialInfo) {
        trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
      }

      const wagerSlider = content.querySelector("#practice-group-wager");
      const confirmButton = content.querySelector(
        "#practice-confirm-group-wager"
      );

      wagerSlider.addEventListener("input", (e) => {
        if (!practicePhaseFlags.groupWagerConfirmed) {
          initialWager = parseInt(e.target.value, 10);
          document.getElementById("practice-group-value").textContent =
            initialWager;
        }
      });

      confirmButton.addEventListener("click", () => {
        if (!practicePhaseFlags.groupWagerConfirmed) {
          practicePhaseFlags.groupWagerConfirmed = true;
          wagerSlider.disabled = true;
          confirmButton.disabled = true;
          confirmButton.textContent = "Bet Confirmed";

          practiceWagers["you"] = initialWager;
          practiceParticipants.forEach((bot) => {
            practiceWagers[bot.id] = Math.floor(Math.random() * 5);
          });

          displayPracticeWagers();
        }
      });
    } else if (currentSubPhase === "chat") {
      content.innerHTML = `
        <h3>Practice Group Trial ${currentPracticeTrial} - Chat Phase</h3>
        <div class="main-layout">
          <div class="left-section">
            <p><strong>💰 Wallet:</strong> $${practiceWallet}</p>
            ${generatePracticeFighterTableHTML(trialData)}
            <div class="ai-highlight">
              <p><strong>AI Prediction:</strong> ${trialData.aiPrediction}</p>
              ${
                window.aiMode !== "neutralAI"
                  ? `<p><strong>Explanation:</strong> ${trialData.justification}</p>`
                  : ""
              }
            </div>
          </div>
          <div class="right-section">
            <div id="practice-confirmed-wagers" class="confirmed-wagers-display">
              <h3 class="wagers-title">Initial Bets</h3>
              <div id="practice-wagers-container" class="wagers-container"></div>
            </div>
            <div id="practice-chat-section">
              <h3>Group Chat</h3>
              <div class="chat-container" id="practice-chat-messages"></div>
              <div class="chat-input">
                <input type="text" id="practice-chat-input" placeholder="Type your opinion..." />
                <button id="practice-chat-send">Send</button>
              </div>
            </div>
          </div>
        </div>
        <div id="practice-countdown"></div>
      `;

      displayPracticeWagers();
      setupPracticeChat();

      setTimeout(() => generateBotMessage(trialData), 2000);
      setTimeout(() => generateBotMessage(trialData), 8000);
    }
  }

  function displayPracticeWagers() {
    const container = document.getElementById("practice-wagers-container");
    if (!container) return;

    container.innerHTML = "";

    const userColumn = document.createElement("div");
    userColumn.classList.add("wager-column", "my-wager");
    userColumn.innerHTML = `
      <div class="wager-participant-id">You 🤹‍♂️</div>
      <div class="wager-value">${practiceWagers["you"]}</div>
    `;
    container.appendChild(userColumn);

    practiceParticipants.forEach((bot) => {
      const botColumn = document.createElement("div");
      botColumn.classList.add("wager-column");
      botColumn.innerHTML = `
        <div class="wager-participant-id">${bot.name} 🤹‍♂️</div>
        <div class="wager-value">${practiceWagers[bot.id]}</div>
      `;
      container.appendChild(botColumn);
    });

    const wagersDisplay = document.getElementById("practice-confirmed-wagers");
    if (wagersDisplay) wagersDisplay.style.display = "flex";
  }

  function setupPracticeChat() {
    const chatInput = document.getElementById("practice-chat-input");
    const chatSend = document.getElementById("practice-chat-send");

    if (!chatInput || !chatSend) return;

    chatSend.addEventListener("click", () => {
      const message = chatInput.value.trim();
      if (message) {
        addPracticeChatMessage("You", message, true);
        chatInput.value = "";
      }
    });

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        chatSend.click();
      }
    });
  }

  function addPracticeChatMessage(sender, message, isUser = false) {
    const chatContainer = document.getElementById("practice-chat-messages");
    if (!chatContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message");

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("user-name");
    if (isUser) nameSpan.classList.add("my-message");
    nameSpan.textContent = sender + " 🤹‍♂️:";

    const messageSpan = document.createElement("span");
    messageSpan.classList.add("message-text");
    messageSpan.textContent = message;

    msgDiv.appendChild(nameSpan);
    msgDiv.appendChild(messageSpan);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function generateBotMessage(trialData) {
    const messages = [
      "I think the AI picked the right fighter this time",
      "Fighter A looks stronger on paper",
      "Not sure about this one, the stats are close",
      "Fighter B has good defensive stats",
      "Experience matters in these fights",
      "Height advantage could be key here",
      "Strike accuracy is really important",
      "I'm going with the AI prediction",
    ];

    const randomBot =
      practiceParticipants[
        Math.floor(Math.random() * practiceParticipants.length)
      ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    addPracticeChatMessage(randomBot.name, randomMessage);
  }

  function showGroupPracticeFinal(trialData) {
    finalWager = initialWager;
    practicePhaseFlags.finalDecisionConfirmed = false;

    const content = document.getElementById("practice-content");
    content.innerHTML = `
      <h3>Practice Group Trial ${currentPracticeTrial} - Final Bet</h3>
      <div class="main-layout">
        <div class="left-section">
          <p><strong>💰 Wallet:</strong> $${practiceWallet}</p>
          ${generatePracticeFighterTableHTML(trialData)}
          <div class="ai-highlight">
            <p><strong>AI Prediction:</strong> ${trialData.aiPrediction}</p>
            ${
              window.aiMode !== "neutralAI"
                ? `<p><strong>Explanation:</strong> ${trialData.justification}</p>`
                : ""
            }
          </div>
        </div>
        <div class="right-section final-bet-position">
          <div class="wager-slider-container">
            <label for="practice-final-group-wager">Final Bet (0-4): <span id="practice-final-group-value">${finalWager}</span></label>
            <input type="range" min="0" max="4" step="1" value="${finalWager}" id="practice-final-group-wager" />
          </div>
          <button id="practice-confirm-final-group">Confirm Final Bet</button>
        </div>
      </div>
      <div id="practice-countdown"></div>
    `;

    const trialInfo = document.getElementById("practice-trial-info");
    if (trialInfo) {
      trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
    }

    const wagerSlider = content.querySelector("#practice-final-group-wager");
    const confirmButton = content.querySelector(
      "#practice-confirm-final-group"
    );

    wagerSlider.addEventListener("input", (e) => {
      if (!practicePhaseFlags.finalDecisionConfirmed) {
        finalWager = parseInt(e.target.value, 10);
        document.getElementById("practice-final-group-value").textContent =
          finalWager;
      }
    });

    confirmButton.addEventListener("click", () => {
      if (!practicePhaseFlags.finalDecisionConfirmed) {
        practicePhaseFlags.finalDecisionConfirmed = true;
        wagerSlider.disabled = true;
        confirmButton.disabled = true;
        confirmButton.textContent = "Final Bet Confirmed";

        const confirmMsg = document.createElement("p");
        confirmMsg.innerHTML =
          "<strong>Bet confirmed. Waiting for results...</strong>";
        confirmMsg.style.marginTop = "15px";
        confirmMsg.style.color = "#00ff00";
        content.appendChild(confirmMsg);
      }
    });
  }

  function showGroupPracticeResult(trialData) {
    const walletBefore = practiceWallet;
    const stakeAmount = finalWager;
    const aiCorrect = trialData.winner === trialData.predicted_winner_numeric;

    let outcomeText = "";
    if (aiCorrect) {
      const winnings = stakeAmount * 2;
      practiceWallet = walletBefore - stakeAmount + winnings;
      outcomeText = `AI was correct! You bet ${stakeAmount} and won ${winnings}.`;
    } else {
      practiceWallet = walletBefore - stakeAmount;
      outcomeText = `AI was wrong. You bet ${stakeAmount} and lost ${stakeAmount}.`;
    }

    const winnerText = `Fighter ${trialData.winner === 0 ? "B" : "A"} wins`;

    const content = document.getElementById("practice-content");
    content.innerHTML = `
      <h3>Practice Group Trial ${currentPracticeTrial} Outcome</h3>
      <p><strong>Fight Outcome:</strong> ${winnerText}</p>
      <p><strong>AI Prediction was:</strong> ${
        aiCorrect
          ? '<span style="color: lightgreen;">Correct</span>'
          : '<span style="color: salmon;">Incorrect</span>'
      }</p>
      <p>${outcomeText}</p>
      <hr style="margin: 10px 0; border-color: #555;">
      <p>💰 Wallet before: $${walletBefore}</p>
      <p><strong>💰 Wallet after: $${practiceWallet}</strong></p>
      <div id="practice-countdown"></div>
    `;

    const trialInfo = document.getElementById("practice-trial-info");
    if (trialInfo) {
      trialInfo.textContent = `Trial ${currentPracticeTrial} of ${PRACTICE_TRIALS}`;
    }

    practicePhaseFlags.resultConfirmed = false;
  }

  function generatePracticeFighterTableHTML(trialData) {
    if (!trialData) return "<p>Error: Fighter data not loaded.</p>";

    const fa = trialData.fighterA;
    const fb = trialData.fighterB;
    const fighterAWins = trialData.predicted_winner_numeric === 1;
    const fighterBWins = trialData.predicted_winner_numeric === 0;

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

    const rowToHighlight = featureToRowMap[trialData.aiRationale] ?? -1;

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
      fa.wins
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.wins
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 1
                ? "rationale-row"
                : ""
            }">
              <td>Losses</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.losses
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.losses
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 2
                ? "rationale-row"
                : ""
            }">
              <td>Age (yrs)</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.age
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.age
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 3
                ? "rationale-row"
                : ""
            }">
              <td>Height</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.height
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.height
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 4
                ? "rationale-row"
                : ""
            }">
              <td>Strikes Landed/Min</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.strikelaM
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.strikelaM
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 5
                ? "rationale-row"
                : ""
            }">
              <td>Strike Accuracy (%)</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.sigSacc
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.sigSacc
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 6
                ? "rationale-row"
                : ""
            }">
              <td>Strike Defense (%)</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.strDef
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.strDef
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 7
                ? "rationale-row"
                : ""
            }">
              <td>Takedown Accuracy (%)</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.tdAcc
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.tdAcc
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 8
                ? "rationale-row"
                : ""
            }">
              <td>Takedown Defense (%)</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.tdDef
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.tdDef
    }</td>
            </tr>
            <tr class="${
              window.aiMode !== "neutralAI" && rowToHighlight === 9
                ? "rationale-row"
                : ""
            }">
              <td>Strikes Avoided/Min</td>
              <td class="${fighterAWins ? "winner-column-cell" : ""}">${
      fa.SApM
    }</td>
              <td class="${fighterBWins ? "winner-column-cell" : ""}">${
      fb.SApM
    }</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function setupPracticeCountdown() {
    const countdownDisplay = document.getElementById(
      "practice-countdown-display"
    );
    if (countdownDisplay) {
      countdownDisplay.style.display = "block";
    }
    if (countdownIntervalId) clearInterval(countdownIntervalId);

    updatePracticeCountdownDisplay();

    countdownIntervalId = setInterval(() => {
      updatePracticeCountdownDisplay();
    }, 1000);

    if (autoTransitionTimerId) clearTimeout(autoTransitionTimerId);
    autoTransitionTimerId = setTimeout(() => {
      handlePracticeAutoTransition();
    }, phaseDuration);
  }

  function updatePracticeCountdownDisplay() {
    const now = Date.now();
    const elapsed = now - phaseStartTime;
    const remaining = Math.max(0, phaseDuration - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    const countdownEl = document.getElementById("practice-countdown");
    let textPrefix = "";

    const floatingTimer = document.getElementById("practice-countdown-timer");
    if (floatingTimer) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      floatingTimer.textContent = `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }

    if (currentMode === "solo") {
      switch (currentPhase) {
        case "initial":
          textPrefix = "Time remaining:";
          break;
        case "finalDecision":
          textPrefix = "Time remaining:";
          break;
        case "result":
          textPrefix = "Next trial in:";
          break;
      }
    } else {
      switch (currentPhase) {
        case "groupDelib":
          if (currentSubPhase === "wager") {
            textPrefix = "Bet time remaining:";
          } else if (currentSubPhase === "chat") {
            textPrefix = "Chat time remaining:";
          }
          break;
        case "finalDecision":
          textPrefix = "Time remaining:";
          break;
        case "result":
          textPrefix = "Next trial in:";
          break;
      }
    }

    if (countdownEl) {
      countdownEl.textContent = `${textPrefix} ${seconds} seconds`;
    }

    if (remaining <= 0 && countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      if (countdownEl) countdownEl.textContent = "Time's up!";
    }
  }

  function handlePracticeAutoTransition() {
    if (currentMode === "solo") {
      switch (currentPhase) {
        case "initial":
          if (!practicePhaseFlags.soloInitialConfirmed) {
            practicePhaseFlags.soloInitialConfirmed = true;
          }
          setTimeout(
            () =>
              startSoloPracticePhase("finalDecision", getCurrentTrialData()),
            1000
          );
          break;
        case "finalDecision":
          if (!practicePhaseFlags.finalDecisionConfirmed) {
            practicePhaseFlags.finalDecisionConfirmed = true;
          }
          setTimeout(
            () => startSoloPracticePhase("result", getCurrentTrialData()),
            1000
          );
          break;
        case "result":
          currentPracticeTrial++;
          setTimeout(() => startPracticeTrial(), 1000);
          break;
      }
    } else {
      switch (currentPhase) {
        case "groupDelib":
          if (currentSubPhase === "wager") {
            if (!practicePhaseFlags.groupWagerConfirmed) {
              practicePhaseFlags.groupWagerConfirmed = true;
              practiceWagers["you"] = initialWager;
              practiceParticipants.forEach((bot) => {
                practiceWagers[bot.id] = Math.floor(Math.random() * 5);
              });
              displayPracticeWagers();
            }
            setTimeout(
              () =>
                startGroupPracticePhase(
                  "groupDelib",
                  "chat",
                  getCurrentTrialData()
                ),
              1000
            );
          } else if (currentSubPhase === "chat") {
            setTimeout(
              () =>
                startGroupPracticePhase(
                  "finalDecision",
                  null,
                  getCurrentTrialData()
                ),
              1000
            );
          }
          break;
        case "finalDecision":
          if (!practicePhaseFlags.finalDecisionConfirmed) {
            practicePhaseFlags.finalDecisionConfirmed = true;
          }
          setTimeout(
            () =>
              startGroupPracticePhase("result", null, getCurrentTrialData()),
            1000
          );
          break;
        case "result":
          currentPracticeTrial++;
          setTimeout(() => startPracticeTrial(), 1000);
          break;
      }
    }
  }

  function getCurrentTrialData() {
    const trialIndex = (currentPracticeTrial - 1) % practiceTrialData.length;
    return practiceTrialData[trialIndex];
  }

  function resetPracticePhaseFlags() {
    practicePhaseFlags = {
      soloInitialConfirmed: false,
      groupWagerConfirmed: false,
      finalDecisionConfirmed: false,
      resultConfirmed: false,
    };
  }

  function clearAllTimers() {
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    if (autoTransitionTimerId) clearTimeout(autoTransitionTimerId);
    countdownIntervalId = null;
    autoTransitionTimerId = null;
  }

  function startKeepAlive() {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }

    keepAliveInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN && practiceInProgress) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
        console.log("Sent WebSocket keepalive ping during practice");
      }
    }, 15000);
  }

  function stopKeepAlive() {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }

  function completePractice() {
    clearAllTimers();
    stopKeepAlive();
    practiceInProgress = false;

    showTransitionToTrialsScreen();
  }

  function hideAllScreens() {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.style.display = "none";
    });
  }
  function showTransitionToTrialsScreen() {
    const content = document.getElementById("practice-content");
    content.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <h3 style="color: #00ff00; margin-bottom: 20px;">✓ Practice Session Completed!</h3>
      <p style="font-size: 1.1em; margin-bottom: 20px;">
        Great! You've completed ${PRACTICE_TRIALS} practice trials in ${
      currentMode === "solo" ? "Solo" : "Group"
    } mode.
      </p>
      <p style="font-size: 1.1em; margin-bottom: 30px;">
        Final Practice Wallet: <strong>$${practiceWallet}</strong>
      </p>
      <div style="background: rgba(255, 204, 0, 0.1); border: 2px solid #ffcc00; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #ffcc00; margin-bottom: 15px;">🚀 Transitioning to Real Trials</h4>
        <p style="color: #fff; margin-bottom: 10px;">
          The practice session is now complete. You'll begin the actual experiment where:
        </p>
        <ul style="color: #fff; text-align: left; margin: 15px 0; padding-left: 20px;">
          <li>Your decisions will be recorded and count toward your final bonus</li>
          <li>You'll start with a fresh $100 wallet</li>
          <li>All trials will use real UFC fight data</li>
        </ul>
      </div>
      <div id="practice-to-trials-countdown" style="font-size: 1.3em; color: #ffcc00; font-weight: bold;">
        Starting real trials in <span id="practice-to-trials-timer">10</span> seconds...
      </div>
      <div style="margin-top: 20px; color: #aaa;">
        <p>Please wait while we get ready...</p>
      </div>
    </div>
  `;

    document.getElementById("practice-countdown-display").style.display =
      "none";

    let remaining = 10;
    const countdownEl = document.getElementById("practice-to-trials-timer");

    const countdownInterval = setInterval(() => {
      remaining--;
      if (countdownEl) {
        countdownEl.textContent = remaining;
      }

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        hideAllScreens();
        if (
          typeof onboarding !== "undefined" &&
          typeof onboarding.completePractice === "function"
        ) {
          onboarding.completePractice();
        }
      }
    }, 1000);
  }

  return {
    init,
    startPractice,
    setPracticeTrials,
    isPracticeInProgress: () => practiceInProgress,
    completePractice,
  };
})();