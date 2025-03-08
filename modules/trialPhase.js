// // modules/trialPhase.js

// // Global arrays to store trial results and (if applicable) group chat messages.
// let trialResults = [];
// let groupChatMessages = [];

// const trialPhase = (function() {
//   let appContainer;
//   let initialScreen;           // Screen for solo mode initial stage
//   let groupDelibScreen;        // Group Deliberation Screen (chat + wager stages)
//   let finalDecisionScreen;     // Final Prediction & Stake Confirmation Screen (individual)
//   let resultScreen;            // Result Outcome Screen

//   let currentTrial = 1;
//   const totalTrials = 5;       // Adjust for testing; change to 50 for production
//   let isSolo = false;          // Mode flag: true for solo, false for group; set externally via preTask

//   // Data placeholders for the current trial
//   let currentFightData = null; // Contains fighter features, AI prediction, rationale
//   let initialWager = 2;        // Value from the initial screen (or group branch)
//   let finalWager = 2;          // Value from the final decision screen (prefilled with initial wager)
//   let aiCorrect = false;       // Placeholder for whether AI prediction is correct

//   // Timers for group mode stages
//   let chatTimerId, wagerTimerId, proceedTimerId;

//   /**
//    * Initializes the trialPhase module by building all screens.
//    */
//   function init() {
//     appContainer = document.getElementById("app-container");
//     buildInitialScreen();
//     buildGroupDelibScreen();
//     buildFinalDecisionScreen();
//     buildResultScreen();
//   }

//   /*** SOLO MODE FUNCTIONS ***/

//   /**
//    * Builds the initial trial screen for solo mode.
//    */
//   function buildInitialScreen() {
//     initialScreen = document.createElement("div");
//     initialScreen.classList.add("screen");
//     initialScreen.innerHTML = `
//       <h2>Trial ${currentTrial} of ${totalTrials} - Initial Stage</h2>
//       <div id="initial-content"></div>
//       <button id="btn-confirm-initial">Confirm Initial Wager</button>
//     `;
//     appContainer.appendChild(initialScreen);

//     initialScreen.querySelector("#btn-confirm-initial")
//       .addEventListener("click", onConfirmInitial);
//   }

//   /**
//    * Handler for confirming initial wager in solo mode.
//    */
//   function onConfirmInitial() {
//     // Copy initial wager to final wager in solo mode.
//     finalWager = initialWager;
//     hideAllScreens();
//     showFinalDecisionScreen();
//   }

//   /*** GROUP MODE FUNCTIONS ***/

//   /**
//    * Builds the group deliberation screen including chat and wager sections.
//    */
//   function buildGroupDelibScreen() {
//     groupDelibScreen = document.createElement("div");
//     groupDelibScreen.classList.add("screen");
//     groupDelibScreen.innerHTML = `
//       <h2>Group Deliberation - Trial <span id="group-trial-number"></span></h2>
//       <div id="group-content">
//         <!-- Fighter info display -->
//         <div id="group-fight-info"></div>
//         <!-- Opinion Section -->
//         <div id="chat-section">
//           <h3>Your Opinion</h3>
//           <div class="chat-container" id="chat-messages"></div>
//           <div class="chat-input" style="display: block;">
//             <input type="text" id="chat-input-text" placeholder="Type your opinion..." />
//             <button id="chat-send-btn">Send</button>
//           </div>
//         </div>
//         <hr>
//         <!-- Wager Section -->
//         <div id="wager-section">
//           <h3>Your Wager</h3>
//           <div id="wager-container" style="display:none; margin-top: 20px;">
//             <label for="group-wager-range">Wager Scale (0-4):</label>
//             <input type="range" id="group-wager-range" min="0" max="4" step="1" value="2">
//             <button id="btn-confirm-group-wager">Confirm Wager</button>
//           </div>
//           <div id="wager-suggestion" style="margin-top:20px;"></div>
//         </div>
//       </div>
//     `;
//     appContainer.appendChild(groupDelibScreen);

//     groupDelibScreen.querySelector("#chat-send-btn")
//       .addEventListener("click", onGroupChatSend);
//     groupDelibScreen.querySelector("#btn-confirm-group-wager")
//       .addEventListener("click", onConfirmGroupWager);
//   }

//   /**
//    * Displays the group deliberation screen for group mode.
//    */
//   function showGroupDelibScreen() {
//     hideAllScreens();
//     groupDelibScreen.querySelector("#group-trial-number").textContent = currentTrial;
//     loadTrialData();

//     // Populate fighter info and AI prediction
//     const fightInfoEl = groupDelibScreen.querySelector("#group-fight-info");
//     const wallet = utilities.getWallet();
//     fightInfoEl.innerHTML = `
//       <p><strong>Wallet:</strong> $${wallet}</p>
//       ${generateFighterTableHTML()}
//       <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
//       <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
//     `;

//     // Reset chat container and input
//     groupDelibScreen.querySelector("#chat-messages").innerHTML = "";
//     const chatInputDiv = groupDelibScreen.querySelector(".chat-input");
//     chatInputDiv.style.display = "block";
//     const chatInput = groupDelibScreen.querySelector("#chat-input-text");
//     chatInput.disabled = false;
//     chatInput.value = "";
//     groupDelibScreen.querySelector("#chat-send-btn").disabled = false;

//     // Hide wager container and clear suggestion area
//     groupDelibScreen.querySelector("#wager-container").style.display = "none";
//     groupDelibScreen.querySelector("#wager-suggestion").innerHTML = "";

//     // Reset wager values
//     initialWager = 2;
//     finalWager = 2;
//     groupDelibScreen.querySelector("#group-wager-range").value = initialWager;
//     groupChatMessages = [];  // Clear stored chat messages

//     // Start a 15-second timer for chat input; once elapsed, disable chat and show wager input.
//     chatTimerId = setTimeout(() => {
//       chatInput.disabled = true;
//       groupDelibScreen.querySelector("#chat-send-btn").disabled = true;
//       groupDelibScreen.querySelector("#wager-container").style.display = "block";
//       startWagerTimer();
//     }, 15000);

//     groupDelibScreen.style.display = "block";
//   }

//   /**
//    * Handles sending of chat messages in group mode.
//    */
//   function onGroupChatSend() {
//     const chatInput = groupDelibScreen.querySelector("#chat-input-text");
//     const message = chatInput.value.trim();
//     if (message) {
//       // Append message locally and store with timestamp
//       chat.appendMessage("You", message);
//       groupChatMessages.push({
//         user: "You",
//         message: message,
//         timestamp: new Date().toISOString()
//       });
//       chatInput.value = "";
//       // If wager input is not yet displayed, force its display immediately.
//       if (groupDelibScreen.querySelector("#wager-container").style.display === "none") {
//         clearTimeout(chatTimerId);
//         chatInput.disabled = true;
//         groupDelibScreen.querySelector("#chat-send-btn").disabled = true;
//         groupDelibScreen.querySelector("#wager-container").style.display = "block";
//         startWagerTimer();
//       }
//     }
//   }

//   /**
//    * Starts the 10-second wager timer.
//    */
//   function startWagerTimer() {
//     wagerTimerId = setTimeout(() => {
//       onConfirmGroupWager();
//     }, 10000);
//   }

//   /**
//    * Confirms the group wager and transitions to final decision screen.
//    */
//   function onConfirmGroupWager() {
//     if (wagerTimerId) {
//       clearTimeout(wagerTimerId);
//       wagerTimerId = null;
//     }
//     const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
//     initialWager = parseInt(wagerSlider.value, 10);
//     finalWager = initialWager;

//     // Remove input areas so that only the submitted data remains.
//     groupDelibScreen.querySelector(".chat-input").style.display = "none";
//     groupDelibScreen.querySelector("#wager-container").style.display = "none";

//     // Display the wager suggestion.
//     const wagerSuggestionEl = groupDelibScreen.querySelector("#wager-suggestion");
//     wagerSuggestionEl.innerHTML = `<p><strong>Your Wager:</strong> ${finalWager}</p>`;

//     // Wait an additional 10 seconds before proceeding.
//     proceedTimerId = setTimeout(() => {
//       showFinalDecisionScreen();
//     }, 10000);
//   }

//   /*** FINAL DECISION & RESULT FUNCTIONS ***/

//   /**
//    * Builds the final decision screen for individual confirmation.
//    */
//   function buildFinalDecisionScreen() {
//     finalDecisionScreen = document.createElement("div");
//     finalDecisionScreen.classList.add("screen");
//     finalDecisionScreen.innerHTML = `
//       <h2>Final Prediction & Stake Confirmation (Trial <span id="trial-number"></span> of ${totalTrials})</h2>
//       <div id="final-decision-content"></div>
//       <button id="btn-confirm-decision">Stake</button>
//     `;
//     appContainer.appendChild(finalDecisionScreen);
//     finalDecisionScreen.querySelector("#btn-confirm-decision")
//       .addEventListener("click", onConfirmFinalDecision);
//   }

//   /**
//    * Displays the final decision screen, pre-filling wager information.
//    */
//   function showFinalDecisionScreen() {
//     hideAllScreens();
//     finalDecisionScreen.querySelector("#trial-number").textContent = currentTrial;

//     const contentEl = finalDecisionScreen.querySelector("#final-decision-content");
//     const wallet = utilities.getWallet();
//     contentEl.innerHTML = `
//       <p><strong>Wallet:</strong> $${wallet}</p>
//       ${generateFighterTableHTML()}
//       <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
//       <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
//       <div style="margin-top: 20px;">
//         <label>Stake (0-4):</label>
//         <input type="range" min="0" max="4" step="1" value="${finalWager}" id="final-wager-range" />
//       </div>
//     `;
//     const finalWagerSlider = contentEl.querySelector("#final-wager-range");
//     finalWagerSlider.addEventListener("input", (e) => {
//       finalWager = parseInt(e.target.value, 10);
//     });
//     finalDecisionScreen.style.display = "block";
//   }

//   /**
//    * Handler for confirming the final decision and moving to the result screen.
//    */
//   function onConfirmFinalDecision() {
//     finalDecisionScreen.style.display = "none";
//     showResultScreen();
//   }

//   /**
//    * Builds the result screen and displays trial outcome.
//    */
//   function buildResultScreen() {
//     resultScreen = document.createElement("div");
//     resultScreen.classList.add("screen");
//     resultScreen.innerHTML = `
//       <h2>Fight Outcome</h2>
//       <div id="result-content"></div>
//       <button id="btn-next-trial">Next Trial</button>
//     `;
//     appContainer.appendChild(resultScreen);
//     resultScreen.querySelector("#btn-next-trial")
//       .addEventListener("click", onNextTrial);
//   }

//   /**
//    * Displays the result screen: calculates outcome, updates wallet, saves trial data.
//    */
//   function showResultScreen() {
//     hideAllScreens();
//     let walletBefore = utilities.getWallet();
//     let outcomeText = "";
//     let stakeAmount = finalWager;

//     // Randomly decide outcome for demonstration.
//     aiCorrect = Math.random() < 0.5;
//     if (aiCorrect) {
//       let winnings = stakeAmount * 2;
//       utilities.setWallet(walletBefore + winnings);
//       outcomeText = `AI was correct! You win $${winnings}.`;
//     } else {
//       utilities.setWallet(walletBefore - stakeAmount);
//       outcomeText = `AI was wrong. You lose $${stakeAmount}.`;
//     }
//     let walletAfter = utilities.getWallet();
//     const resultContent = resultScreen.querySelector("#result-content");
//     resultContent.innerHTML = `
//       <p><strong>Fight Outcome:</strong> ${aiCorrect ? "Fighter A wins" : "Fighter B wins"}</p>
//       <p>${outcomeText}</p>
//       <p>Your new wallet balance is: $${walletAfter}</p>
//     `;
//     resultScreen.style.display = "block";
//     saveTrialData(walletBefore, walletAfter);
//   }

//   /**
//    * Saves trial data, including Prolific parameters and timestamps.
//    */
//   function saveTrialData(walletBefore, walletAfter) {
//     const trialData = {
//       trialNumber: currentTrial,
//       mode: isSolo ? "solo" : "group",
//       fighterData: currentFightData,
//       initialWager: initialWager,
//       finalWager: finalWager,
//       chatMessages: isSolo ? [] : groupChatMessages,
//       aiPrediction: currentFightData.aiPrediction,
//       aiRationale: currentFightData.aiRationale,
//       aiCorrect: aiCorrect,
//       walletBefore: walletBefore,
//       walletAfter: walletAfter,
//       // sessionID: sessionManager.getSessionID(),
//       PROLIFIC_PID: sessionStorage.getItem("PROLIFIC_PID") || null,
//       STUDY_ID: sessionStorage.getItem("STUDY_ID") || null,
//       timestamp: new Date().toISOString()
//     };
//     trialResults.push(trialData);
//     console.log("Trial data saved:", trialData);
//     // Send data to your server (or your Prolific integration endpoint)
//     // sessionManager.sendData(trialData);
//   }

//   /**
//    * Proceeds to the next trial or transitions to post-task phase if all trials are complete.
//    */
//   function onNextTrial() {
//     currentTrial++;
//     if (currentTrial <= totalTrials) {
//       // Reset wager defaults and clear timers.
//       initialWager = 2;
//       finalWager = 2;
//       clearTimeout(chatTimerId);
//       clearTimeout(wagerTimerId);
//       clearTimeout(proceedTimerId);
//       if (isSolo) {
//         showTrialScreenSolo();
//       } else {
//         showGroupDelibScreen();
//       }
//     } else {
//       postTask.showPostTaskScreen();
//     }
//   }

//   /**
//    * Builds the solo trial screen by reusing the initialScreen for solo participants.
//    */
//   function showTrialScreenSolo() {
//     hideAllScreens();
//     initialScreen.querySelector("h2").innerHTML = `Trial ${currentTrial} of ${totalTrials} - Initial Stage`;
//     loadTrialData();
//     const contentEl = initialScreen.querySelector("#initial-content");
//     const wallet = utilities.getWallet();
//     contentEl.innerHTML = `
//       <p><strong>Wallet:</strong> $${wallet}</p>
//       ${generateFighterTableHTML()}
//       <p><strong>AI Prediction:</strong> ${currentFightData.aiPrediction}</p>
//       <p><strong>Rationale:</strong> ${currentFightData.aiRationale}</p>
//       <div style="margin-top: 20px;">
//         <label>Initial Wager (0-4):</label>
//         <input type="range" min="0" max="4" step="1" value="${initialWager}" id="initial-wager-range" />
//       </div>
//     `;
//     const wagerSlider = contentEl.querySelector("#initial-wager-range");
//     wagerSlider.addEventListener("input", (e) => {
//       initialWager = parseInt(e.target.value, 10);
//     });
//     initialScreen.style.display = "block";
//   }

//   /**
//    * Utility function to hide all screens.
//    */
//   function hideAllScreens() {
//     document.querySelectorAll(".screen").forEach(screen => {
//       screen.style.display = "none";
//     });
//   }

//   /**
//    * Generates an HTML table of fighter statistics.
//    */
//   function generateFighterTableHTML() {
//     return `
//       <table class="fighter-table">
//         <tr>
//           <th></th>
//           <th>Fighter A</th>
//           <th>Fighter B</th>
//         </tr>
//         <tr>
//           <td>Career Wins</td>
//           <td>${currentFightData.fighterA.wins}</td>
//           <td>${currentFightData.fighterB.wins}</td>
//         </tr>
//         <tr>
//           <td>Career Losses</td>
//           <td>${currentFightData.fighterA.losses}</td>
//           <td>${currentFightData.fighterB.losses}</td>
//         </tr>
//         <tr>
//           <td>Age</td>
//           <td>${currentFightData.fighterA.age} years</td>
//           <td>${currentFightData.fighterB.age} years</td>
//         </tr>
//         <tr>
//           <td>Height</td>
//           <td>${currentFightData.fighterA.height}</td>
//           <td>${currentFightData.fighterB.height}</td>
//         </tr>
//         <tr>
//           <td>Strikes Landed/Min</td>
//           <td>${currentFightData.fighterA.strikelaM}</td>
//           <td>${currentFightData.fighterB.strikelaM}</td>
//         </tr>
//         <tr>
//           <td>Strike Accuracy</td>
//           <td>${currentFightData.fighterA.sigSacc}</td>
//           <td>${currentFightData.fighterB.sigSacc}</td>
//         </tr>
//         <!-- Add more rows as needed -->
//       </table>
//     `;
//   }

//   /**
//    * Loads or generates trial-specific fighter data.
//    */
//   function loadTrialData() {
//     // Replace with dynamic data loading if available.
//     currentFightData = {
//       fighterA: { wins: 8, losses: 2, age: 24.6, height: "5'10\"", strikelaM: "4.5/min", sigSacc: "40%" },
//       fighterB: { wins: 11, losses: 5, age: 27.8, height: "5'11\"", strikelaM: "4.9/min", sigSacc: "50%" },
//       aiPrediction: "Fighter A will win by TKO",
//       aiRationale: "Better takedown defense and younger age."
//     };
//   }

//   // Expose public functions.
//   return {
//     init,
//     showTrialScreen: () => {
//       if (isSolo) {
//         showTrialScreenSolo();
//       } else {
//         showGroupDelibScreen();
//       }
//     },
//     setMode: (soloMode) => {
//       isSolo = soloMode;
//     },
//     getTrialResults: () => trialResults
//   };
// })();


// modules/trialPhase.js
let trialResults = [];
let groupChatMessages = [];

const trialPhase = (function() {
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
    finalWager = initialWager;
    hideAllScreens();
    showFinalDecisionScreen();
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
    chatTimerId = setTimeout(() => {
      chatInput.disabled = true;
      groupDelibScreen.querySelector("#chat-send-btn").disabled = true;
      groupDelibScreen.querySelector("#wager-container").style.display = "block";
      startWagerTimer();
    }, 15000);
    groupDelibScreen.style.display = "block";
  }

  function onGroupChatSend() {
    const chatInput = groupDelibScreen.querySelector("#chat-input-text");
    const message = chatInput.value.trim();
    if (message) {
      chat.appendMessage("You", message);
      groupChatMessages.push({
        user: "You",
        message: message,
        timestamp: new Date().toISOString()
      });
      chatInput.value = "";
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
    if (wagerTimerId) {
      clearTimeout(wagerTimerId);
      wagerTimerId = null;
    }
    const wagerSlider = groupDelibScreen.querySelector("#group-wager-range");
    initialWager = parseInt(wagerSlider.value, 10);
    finalWager = initialWager;
    groupDelibScreen.querySelector(".chat-input").style.display = "none";
    groupDelibScreen.querySelector("#wager-container").style.display = "none";
    const wagerSuggestionEl = groupDelibScreen.querySelector("#wager-suggestion");
    wagerSuggestionEl.innerHTML = `<p><strong>Your Wager:</strong> ${finalWager}</p>`;
    proceedTimerId = setTimeout(() => {
      showFinalDecisionScreen();
    }, 10000);
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
    `;
    const finalWagerSlider = contentEl.querySelector("#final-wager-range");
    finalWagerSlider.addEventListener("input", (e) => {
      finalWager = parseInt(e.target.value, 10);
    });
    finalDecisionScreen.style.display = "block";
  }

  function onConfirmFinalDecision() {
    finalDecisionScreen.style.display = "none";
    showResultScreen();
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
    currentTrial++;
    if (currentTrial <= totalTrials) {
      initialWager = 2;
      finalWager = 2;
      clearTimeout(chatTimerId);
      clearTimeout(wagerTimerId);
      clearTimeout(proceedTimerId);
      if (isSolo) {
        showTrialScreenSolo();
      } else {
        showGroupDelibScreen();
      }
    } else {
      // Instead of sending finishSession here, route to Post-Task survey.
      postTask.showPostTaskScreen();
    }
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
