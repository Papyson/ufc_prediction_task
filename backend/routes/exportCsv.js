// // Backend/routes/exportCsv.js
// const express = require('express');
// const router = express.Router();
// const { firestore } = require('../firebaseConfig');

// // Map our feature keys to the actual Firestore field names
// const featureKeyMap = {
//   CareerWins:           'wins',
//   CareerLosses:         'losses',
//   Age:                  'age',
//   Height:               'height',
//   StrikesLandedPerMin:  'slpm',
//   StrikeAccuracy:       'accuracy',
//   StrikeDefense:        'defense',
//   TakedownDefense:      'tdDefense',
//   StrikesAvoidedPerMin: 'sapm',
//   TakedownAccuracy:     'tdAccuracy',
// };
// const featureKeys = Object.keys(featureKeyMap);

// // Prefixed header names
// const preFields  = featureKeys.map(k => `pretask_${k}`);
// const postFields = featureKeys.map(k => `posttask_${k}`);

// /**
//  * GET /exportCsv?mode=solo|group
//  * Streams CSV of all sessions of that mode, in original-trial order.
//  */
// router.get('/', async (req, res) => {
//   const { mode } = req.query;
//   if (!mode || !['solo','group'].includes(mode)) {
//     return res
//       .status(400)
//       .send('Error: please request /exportCsv?mode=solo or ?mode=group');
//   }

//   // 1) Fetch sessions of this mode
//   const sessionsSnap = await firestore
//     .collection('sessions')
//     .where('mode', '==', mode)
//     .get();
//   const sessions = sessionsSnap.docs.map(doc => ({
//     id: doc.id,
//     data: doc.data()
//   }));

//   if (sessions.length === 0) {
//     return res
//       .status(404)
//       .send(`No sessions found for mode=${mode}`);
//   }

//   // 2) Determine trial count and build header
//   const trialCount = sessions[0].data.trialCount || 50;
//   const headers = ['sessionID','clientID','aiMode', ...preFields];
//   for (let i = 1; i <= trialCount; i++) {
//     if (mode === 'solo') {
//       headers.push(
//         `trial${i}_initialWager`,
//         `trial${i}_finalWager`,
//         `wallet_after_trial${i}`
//       );
//     } else {
//       headers.push(
//         `trial${i}_initialWager`,
//         `trial${i}_finalWager`,
//         `trial${i}_groupAvgWager`,
//         `trial${i}_changedDirection`,
//         `wallet_after_trial${i}`
//       );
//     }
//   }
//   headers.push(...postFields);

//   // 3) Stream CSV header
//   res.setHeader('Content-Type','text/csv');
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename="${mode}_sessions_export.csv"`
//   );
//   res.write(headers.join(',') + '\n');

//   // 4) For each session & participant, build a row
//   for (const { id: sid, data: sData } of sessions) {
//     const participants = sData.participants || [];

//     // Build mapping: original trial index -> presentation slot (1–50)
//     const order = Array.isArray(sData.trialOrder) && sData.trialOrder.length === trialCount
//       ? sData.trialOrder
//       : Array.from({ length: trialCount }, (_, i) => i);
//     const originalToPresentation = new Array(trialCount);
//     order.forEach((origIdx, presIdx) => {
//       originalToPresentation[origIdx] = presIdx + 1;
//     });

//     for (const pid of participants) {
//       const row = {
//         sessionID: sid,
//         clientID: pid,
//         aiMode:    sData.aiMode || ''
//       };

//       // -- Pre-task survey --
//       const preSnap = await firestore
//         .collection('sessions').doc(sid)
//         .collection('participantData')
//         .doc(`${pid}_preTask`)
//         .get();
//       const pre = preSnap.exists ? preSnap.data() : {};
//       featureKeys.forEach(key => {
//         const dbFld = featureKeyMap[key];
//         row[`pretask_${key}`] = pre[`pretask_${key}`] ?? pre[dbFld] ?? '';
//       });

//       // -- Trials --
//       if (mode === 'solo') {
//         // fetch solo documents by clientID
//         const snap = await firestore
//           .collection('sessions').doc(sid)
//           .collection('trials')
//           .where('clientID','==',pid)
//           .get();
//         const tmap = {};
//         snap.forEach(d => {
//           const doc = d.data();
//           tmap[doc.trialNumber] = doc;
//         });

//         for (let orig = 0; orig < trialCount; orig++) {
//           const slot = originalToPresentation[orig];
//           const t    = tmap[slot] || {};
//           row[`trial${orig+1}_initialWager`] = t.initialWager ?? '';
//           row[`trial${orig+1}_finalWager`]   = t.finalWager   ?? '';
//           row[`wallet_after_trial${orig+1}`] = t.walletAfter  ?? '';
//         }

//       } else {
//         // group: fetch all trials and their submissions
//         const snap = await firestore
//           .collection('sessions').doc(sid)
//           .collection('trials')
//           .get();
//         const subsByTrial = {};
//         snap.forEach(d => {
//           const doc = d.data();
//           subsByTrial[doc.trialNumber] = doc.submissions || {};
//         });

//         for (let orig = 0; orig < trialCount; orig++) {
//           const slot = originalToPresentation[orig];
//           const subs = subsByTrial[slot] || {};
//           const me   = subs[pid]   || {};
//           const init = me.initialWager ?? '';
//           const fin  = me.finalWager   ?? '';
//           const allFins = Object.values(subs).map(s => s.finalWager ?? 0);
//           const avg  = allFins.length
//             ? (allFins.reduce((a,b)=>a+b,0) / allFins.length).toFixed(2)
//             : '';
//           const changed = avg !== ''
//             ? (Math.abs(fin - avg) < Math.abs(init - avg))
//             : '';

//           row[`trial${orig+1}_initialWager`]     = init;
//           row[`trial${orig+1}_finalWager`]       = fin;
//           row[`trial${orig+1}_groupAvgWager`]    = avg;
//           row[`trial${orig+1}_changedDirection`] = changed;
//           row[`wallet_after_trial${orig+1}`]     = me.walletAfter ?? '';
//         }
//       }

//       // -- Post-task survey --
//       const postSnap = await firestore
//         .collection('sessions').doc(sid)
//         .collection('participantData')
//         .doc(`${pid}_postTask`)
//         .get();
//       const post = postSnap.exists ? postSnap.data() : {};
//       featureKeys.forEach(key => {
//         const dbFld = featureKeyMap[key];
//         row[`posttask_${key}`] = post[`posttask_${key}`] ?? post[dbFld] ?? '';
//       });

//       // 5) Write CSV row
//       const line = headers.map(h => {
//         const cell = String(row[h] ?? '').replace(/"/g,'""');
//         return `"${cell}"`;
//       }).join(',');
//       res.write(line + '\n');
//     }
//   }

//   res.end();
// });

// module.exports = router;


// backend/routes/exportCsv.js

const express = require('express');
const router  = express.Router();
const { firestore } = require('../firebaseConfig');

/**
 * Two separate maps:
 *  — surveyFeatureKeyMap for pre/post surveys (your original working map)
 *  — fightFeatureKeyMap for trial‑level fighterA/fighterB stats (matches Firestore nesting under fighterData)
 */
const surveyFeatureKeyMap = {
  CareerWins:           'wins',
  CareerLosses:         'losses',
  Age:                  'age',
  Height:               'height',
  StrikesLandedPerMin:  'slpm',
  StrikeAccuracy:       'accuracy',
  StrikeDefense:        'defense',
  TakedownDefense:      'tdDefense',
  StrikesAvoidedPerMin: 'sapm',
  TakedownAccuracy:     'tdAccuracy'
};
const surveyKeys = Object.keys(surveyFeatureKeyMap);
const preFields  = surveyKeys.map(k => `pretask_${k}`);
const postFields = surveyKeys.map(k => `posttask_${k}`);

const fightFeatureKeyMap = {
  CareerWins:           'wins',
  CareerLosses:         'losses',
  Age:                  'age',
  Height:               'height',
  StrikesLandedPerMin:  'strikelaM',
  StrikeAccuracy:       'sigSacc',
  StrikeDefense:        'strDef',
  TakedownAccuracy:     'tdAcc',
  TakedownDefense:      'tdDef',
  StrikesAvoidedPerMin: 'SApM'
};
const fightKeys = Object.keys(fightFeatureKeyMap);

/**
 * GET /exportCsv?mode=solo|group[&includeFightData=true]
 * Streams CSV of all sessions for the given mode, in original-trial order.
 */
router.get('/', async (req, res) => {
  const { mode, includeFightData } = req.query;
  const include = includeFightData === 'true';

  if (!mode || !['solo','group'].includes(mode)) {
    return res
      .status(400)
      .send('Error: please request /exportCsv?mode=solo or ?mode=group');
  }

  // 1) Fetch sessions of this mode
  const sessionsSnap = await firestore
    .collection('sessions')
    .where('mode','==',mode)
    .get();
  const sessions = sessionsSnap.docs.map(d => ({ id: d.id, data: d.data() }));

  if (sessions.length === 0) {
    return res.status(404).send(`No sessions found for mode=${mode}`);
  }

  // 2) Determine trial count and build CSV header row
  const trialCount = sessions[0].data.trialCount || 50;
  const headers = ['sessionID','clientID','aiMode', ...preFields];

  for (let i = 1; i <= trialCount; i++) {
    // baseline wager columns
    if (mode === 'solo') {
      headers.push(
        `trial${i}_initialWager`,
        `trial${i}_finalWager`,
        `wallet_after_trial${i}`
      );
    } else {
      headers.push(
        `trial${i}_initialWager`,
        `trial${i}_finalWager`,
        `trial${i}_groupAvgWager`,
        `trial${i}_changedDirection`,
        `wallet_after_trial${i}`
      );
    }

    // enriched fight data columns
    if (include) {
      fightKeys.forEach(key => {
        headers.push(
          `trial${i}_FighterA_${key}`,
          `trial${i}_FighterB_${key}`
        );
      });
      headers.push(
        `trial${i}_predicted_winner_numeric`,
        `trial${i}_winner`
      );
    }
  }

  headers.push(...postFields);

  // 3) Send CSV headers
  res.setHeader('Content-Type','text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${mode}_sessions_export${include ? '_withFightData' : ''}.csv"`
  );
  res.write(headers.join(',') + '\n');

  // 4) Stream each session & participant
  for (const { id: sid, data: sData } of sessions) {
    const participants = sData.participants || [];

    // original->presentation mapping (unchanged)
    const order = Array.isArray(sData.trialOrder) && sData.trialOrder.length === trialCount
      ? sData.trialOrder
      : Array.from({ length: trialCount }, (_, i) => i);
    const originalToPresentation = new Array(trialCount);
    order.forEach((origIdx, presIdx) => {
      originalToPresentation[origIdx] = presIdx + 1;
    });

    for (const pid of participants) {
      const row = {
        sessionID: sid,
        clientID:  pid,
        aiMode:    sData.aiMode || ''
      };

      // -- Pre-task survey --
      const preSnap = await firestore
        .collection('sessions').doc(sid)
        .collection('participantData')
        .doc(`${pid}_preTask`)
        .get();
      const pre = preSnap.exists ? preSnap.data() : {};
      surveyKeys.forEach(key => {
        const fld = surveyFeatureKeyMap[key];
        row[`pretask_${key}`] = pre[`pretask_${key}`] ?? pre[fld] ?? '';
      });

      // -- Trials --
      if (mode === 'solo') {
        // fetch this participant's solo trials
        const snap = await firestore
          .collection('sessions').doc(sid)
          .collection('trials')
          .where('clientID','==',pid)
          .get();
        const tmap = {};
        snap.forEach(d => {
          const doc = d.data();
          tmap[doc.trialNumber] = doc;
        });

        for (let orig = 0; orig < trialCount; orig++) {
          const slot = originalToPresentation[orig];
          const t    = tmap[slot] || {};

          // baseline
          row[`trial${orig+1}_initialWager`] = t.initialWager ?? '';
          row[`trial${orig+1}_finalWager`]   = t.finalWager   ?? '';
          row[`wallet_after_trial${orig+1}`] = t.walletAfter  ?? '';

          // enriched fight data
          if (include) {
            fightKeys.forEach(key => {
              const fKey = fightFeatureKeyMap[key];
              row[`trial${orig+1}_FighterA_${key}`] = t.fighterData?.fighterA?.[fKey] ?? '';
              row[`trial${orig+1}_FighterB_${key}`] = t.fighterData?.fighterB?.[fKey] ?? '';
            });
            row[`trial${orig+1}_predicted_winner_numeric`] =
              t.fighterData?.predicted_winner_numeric ?? '';
            row[`trial${orig+1}_winner`] =
              t.fighterData?.winner ?? '';
          }
        }

      } else {
        // group mode: fetch all trials once
        const snap = await firestore
          .collection('sessions').doc(sid)
          .collection('trials')
          .get();
        const subsByTrial    = {};
        const trialDocsByNum = {};
        snap.forEach(d => {
          const data = d.data();
          subsByTrial[data.trialNumber]    = data.submissions || {};
          trialDocsByNum[data.trialNumber] = data;
        });

        for (let orig = 0; orig < trialCount; orig++) {
          const slot = originalToPresentation[orig];
          const subs = subsByTrial[slot] || {};
          const me   = subs[pid]   || {};
          const init = me.initialWager ?? '';
          const fin  = me.finalWager   ?? '';
          const allF = Object.values(subs).map(s => s.finalWager ?? 0);
          const avg  = allF.length
            ? (allF.reduce((a,b) => a + b, 0) / allF.length).toFixed(2)
            : '';
          const changed = avg
            ? Math.abs(fin - avg) < Math.abs(init - avg)
            : '';

          // baseline
          row[`trial${orig+1}_initialWager`]     = init;
          row[`trial${orig+1}_finalWager`]       = fin;
          row[`trial${orig+1}_groupAvgWager`]    = avg;
          row[`trial${orig+1}_changedDirection`] = changed;
          row[`wallet_after_trial${orig+1}`]     = me.walletAfter ?? '';

          // enriched fight data
          if (include) {
            const tdoc = trialDocsByNum[slot] || {};
            fightKeys.forEach(key => {
              const fKey = fightFeatureKeyMap[key];
              row[`trial${orig+1}_FighterA_${key}`] = tdoc.fighterData?.fighterA?.[fKey] ?? '';
              row[`trial${orig+1}_FighterB_${key}`] = tdoc.fighterData?.fighterB?.[fKey] ?? '';
            });
            row[`trial${orig+1}_predicted_winner_numeric`] =
              tdoc.fighterData?.predicted_winner_numeric ?? '';
            row[`trial${orig+1}_winner`] =
              tdoc.fighterData?.winner ?? '';
          }
        }
      }

      // -- Post-task survey --
      const postSnap = await firestore
        .collection('sessions').doc(sid)
        .collection('participantData')
        .doc(`${pid}_postTask`)
        .get();
      const post = postSnap.exists ? postSnap.data() : {};
      surveyKeys.forEach(key => {
        const fld = surveyFeatureKeyMap[key];
        row[`posttask_${key}`] = post[`posttask_${key}`] ?? post[fld] ?? '';
      });

      // 5) Write CSV row
      const line = headers.map(h => {
        const cell = String(row[h] ?? '').replace(/"/g, '""');
        return `"${cell}"`;
      }).join(',');
      res.write(line + '\n');
    }
  }

  // 6) Finish streaming
  res.end();
});

module.exports = router;

