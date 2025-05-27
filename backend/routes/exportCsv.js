// // backend/routes/exportCsv.js

// const express = require('express');
// const router  = express.Router();
// const { firestore } = require('../firebaseConfig');

// /**
//  * Two separate maps:
//  *  — surveyFeatureKeyMap for pre/post surveys (your original working map)
//  *  — fightFeatureKeyMap for trial‑level fighterA/fighterB stats (matches Firestore nesting under fighterData)
//  */
// const surveyFeatureKeyMap = {
//   CareerWins:           'wins',
//   CareerLosses:         'losses',
//   Age:                  'age',
//   Height:               'height',
//   StrikesLandedPerMin:  'slpm',
//   StrikeAccuracy:       'accuracy',
//   StrikeDefense:        'defense',
//   TakedownDefense:      'tdDefense',
//   StrikesAvoidedPerMin: 'sapm',
//   TakedownAccuracy:     'tdAccuracy'
// };
// const surveyKeys = Object.keys(surveyFeatureKeyMap);
// const preFields  = surveyKeys.map(k => `pretask_${k}`);
// const postFields = surveyKeys.map(k => `posttask_${k}`);

// const fightFeatureKeyMap = {
//   CareerWins:           'wins',
//   CareerLosses:         'losses',
//   Age:                  'age',
//   Height:               'height',
//   StrikesLandedPerMin:  'strikelaM',
//   StrikeAccuracy:       'sigSacc',
//   StrikeDefense:        'strDef',
//   TakedownAccuracy:     'tdAcc',
//   TakedownDefense:      'tdDef',
//   StrikesAvoidedPerMin: 'SApM'
// };
// const fightKeys = Object.keys(fightFeatureKeyMap);

// /**
//  * GET /exportCsv?mode=solo|group[&includeFightData=true]
//  * Streams CSV of all sessions for the given mode, in original-trial order.
//  */
// router.get('/', async (req, res) => {
//   const { mode, includeFightData } = req.query;
//   const include = includeFightData === 'true';

//   if (!mode || !['solo','group'].includes(mode)) {
//     return res
//       .status(400)
//       .send('Error: please request /exportCsv?mode=solo or ?mode=group');
//   }

//   // 1) Fetch sessions of this mode
//   const sessionsSnap = await firestore
//     .collection('sessions')
//     .where('mode','==',mode)
//     .get();
//   const sessions = sessionsSnap.docs.map(d => ({ id: d.id, data: d.data() }));

//   if (sessions.length === 0) {
//     return res.status(404).send(`No sessions found for mode=${mode}`);
//   }

//   // 2) Determine trial count and build CSV header row
//   const trialCount = sessions[0].data.trialCount || 50;
//   const headers = ['sessionID','clientID','aiMode', ...preFields];

//   for (let i = 1; i <= trialCount; i++) {
//     // baseline wager columns
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

//     // enriched fight data columns
//     if (include) {
//       fightKeys.forEach(key => {
//         headers.push(
//           `trial${i}_FighterA_${key}`,
//           `trial${i}_FighterB_${key}`
//         );
//       });
//       headers.push(
//         `trial${i}_predicted_winner_numeric`,
//         `trial${i}_winner`
//       );
//     }
//   }

//   headers.push(...postFields);

//   // 3) Send CSV headers
//   res.setHeader('Content-Type','text/csv');
//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename="${mode}_sessions_export${include ? '_withFightData' : ''}.csv"`
//   );
//   res.write(headers.join(',') + '\n');

//   // 4) Stream each session & participant
//   for (const { id: sid, data: sData } of sessions) {
//     const participants = sData.participants || [];

//     // original->presentation mapping (unchanged)
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
//         clientID:  pid,
//         aiMode:    sData.aiMode || ''
//       };

//       // -- Pre-task survey --
//       const preSnap = await firestore
//         .collection('sessions').doc(sid)
//         .collection('participantData')
//         .doc(`${pid}_preTask`)
//         .get();
//       const pre = preSnap.exists ? preSnap.data() : {};
//       surveyKeys.forEach(key => {
//         const fld = surveyFeatureKeyMap[key];
//         row[`pretask_${key}`] = pre[`pretask_${key}`] ?? pre[fld] ?? '';
//       });

//       // -- Trials --
//       if (mode === 'solo') {
//         // fetch this participant's solo trials
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

//           // baseline
//           row[`trial${orig+1}_initialWager`] = t.initialWager ?? '';
//           row[`trial${orig+1}_finalWager`]   = t.finalWager   ?? '';
//           row[`wallet_after_trial${orig+1}`] = t.walletAfter  ?? '';

//           // enriched fight data
//           if (include) {
//             fightKeys.forEach(key => {
//               const fKey = fightFeatureKeyMap[key];
//               row[`trial${orig+1}_FighterA_${key}`] = t.fighterData?.fighterA?.[fKey] ?? '';
//               row[`trial${orig+1}_FighterB_${key}`] = t.fighterData?.fighterB?.[fKey] ?? '';
//             });
//             row[`trial${orig+1}_predicted_winner_numeric`] =
//               t.fighterData?.predicted_winner_numeric ?? '';
//             row[`trial${orig+1}_winner`] =
//               t.fighterData?.winner ?? '';
//           }
//         }

//       } else {
//         // group mode: fetch all trials once
//         const snap = await firestore
//           .collection('sessions').doc(sid)
//           .collection('trials')
//           .get();
//         const subsByTrial    = {};
//         const trialDocsByNum = {};
//         snap.forEach(d => {
//           const data = d.data();
//           subsByTrial[data.trialNumber]    = data.submissions || {};
//           trialDocsByNum[data.trialNumber] = data;
//         });

//         for (let orig = 0; orig < trialCount; orig++) {
//           const slot = originalToPresentation[orig];
//           const subs = subsByTrial[slot] || {};
//           const me   = subs[pid]   || {};
//           const init = me.initialWager ?? '';
//           const fin  = me.finalWager   ?? '';
//           const allF = Object.values(subs).map(s => s.finalWager ?? 0);
//           const avg  = allF.length
//             ? (allF.reduce((a,b) => a + b, 0) / allF.length).toFixed(2)
//             : '';
//           const changed = avg
//             ? Math.abs(fin - avg) < Math.abs(init - avg)
//             : '';

//           // baseline
//           row[`trial${orig+1}_initialWager`]     = init;
//           row[`trial${orig+1}_finalWager`]       = fin;
//           row[`trial${orig+1}_groupAvgWager`]    = avg;
//           row[`trial${orig+1}_changedDirection`] = changed;
//           row[`wallet_after_trial${orig+1}`]     = me.walletAfter ?? '';

//           // enriched fight data
//           if (include) {
//             const tdoc = trialDocsByNum[slot] || {};
//             fightKeys.forEach(key => {
//               const fKey = fightFeatureKeyMap[key];
//               row[`trial${orig+1}_FighterA_${key}`] = tdoc.fighterData?.fighterA?.[fKey] ?? '';
//               row[`trial${orig+1}_FighterB_${key}`] = tdoc.fighterData?.fighterB?.[fKey] ?? '';
//             });
//             row[`trial${orig+1}_predicted_winner_numeric`] =
//               tdoc.fighterData?.predicted_winner_numeric ?? '';
//             row[`trial${orig+1}_winner`] =
//               tdoc.fighterData?.winner ?? '';
//           }
//         }
//       }

//       // -- Post-task survey --
//       const postSnap = await firestore
//         .collection('sessions').doc(sid)
//         .collection('participantData')
//         .doc(`${pid}_postTask`)
//         .get();
//       const post = postSnap.exists ? postSnap.data() : {};
//       surveyKeys.forEach(key => {
//         const fld = surveyFeatureKeyMap[key];
//         row[`posttask_${key}`] = post[`posttask_${key}`] ?? post[fld] ?? '';
//       });

//       // 5) Write CSV row
//       const line = headers.map(h => {
//         const cell = String(row[h] ?? '').replace(/"/g, '""');
//         return `"${cell}"`;
//       }).join(',');
//       res.write(line + '\n');
//     }
//   }

//   // 6) Finish streaming
//   res.end();
// });

// module.exports = router;


const express = require('express');
const router  = express.Router();
const { firestore } = require('../firebaseConfig');

// 1) Maps for survey vs. fight features
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
 * GET /exportCsv?mode=solo|group&includeFightData=true
 * Streams CSV with fight data for all sessions of the given mode, in presentation order.
 */
router.get('/', async (req, res) => {
  const { mode } = req.query;
  if (!mode || !['solo','group'].includes(mode)) {
    return res
      .status(400)
      .send('Error: please request /exportCsv?mode=solo or ?mode=group');
  }

  // 2) Fetch sessions
  const sessionsSnap = await firestore
    .collection('sessions')
    .where('mode','==',mode)
    .get();
  const sessions = sessionsSnap.docs.map(d => ({ id: d.id, data: d.data() }));
  if (sessions.length === 0) {
    return res.status(404).send(`No sessions found for mode=${mode}`);
  }

  // 3) Build headers
  const trialCount = sessions[0].data.trialCount || 50;
  const headers = ['sessionID','clientID','aiMode', ...preFields];

  for (let i = 1; i <= trialCount; i++) {
    // always export in presentation order
    headers.push(`trial${i}_index`);

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

    // fight data columns
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

  headers.push(...postFields);

  // 4) Send CSV header
  res.setHeader('Content-Type','text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${mode}_sessions_export.csv"`
  );
  res.write(headers.join(',') + '\n');

  // 5) Stream each session & participant
  for (const { id: sid, data: sData } of sessions) {
    const participants = sData.participants || [];

    // presentation→original mapping
    const order = Array.isArray(sData.trialOrder) && sData.trialOrder.length === trialCount
      ? sData.trialOrder.slice()                    // [origIdx0, origIdx1, ...]
      : Array.from({ length: trialCount }, (_, i) => i);

    for (const pid of participants) {
      const row = { sessionID: sid, clientID: pid, aiMode: sData.aiMode || '' };

      // -- Pre‑task survey --
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

      // -- Trials (presentation order) --
      if (mode === 'solo') {
        // fetch this participant’s solo trials
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

        for (let pres = 0; pres < trialCount; pres++) {
          const trialNum = pres + 1;
          const origIdx   = order[pres];
          const t         = tmap[trialNum] || {};

          // index
          row[`trial${trialNum}_index`] = origIdx;

          // wagers & wallet
          row[`trial${trialNum}_initialWager`] = t.initialWager ?? '';
          row[`trial${trialNum}_finalWager`]   = t.finalWager   ?? '';
          row[`wallet_after_trial${trialNum}`] = t.walletAfter  ?? '';

          // fight data
          fightKeys.forEach(key => {
            const fKey = fightFeatureKeyMap[key];
            row[`trial${trialNum}_FighterA_${key}`] =
              t.fighterData?.fighterA?.[fKey] ?? '';
            row[`trial${trialNum}_FighterB_${key}`] =
              t.fighterData?.fighterB?.[fKey] ?? '';
          });
          row[`trial${trialNum}_predicted_winner_numeric`] =
            t.fighterData?.predicted_winner_numeric ?? '';
          row[`trial${trialNum}_winner`] =
            t.fighterData?.winner ?? '';
        }

      } else {
        // group mode: fetch all trial docs once
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

        for (let pres = 0; pres < trialCount; pres++) {
          const trialNum = pres + 1;
          const origIdx   = order[pres];
          const subs      = subsByTrial[trialNum] || {};
          const me        = subs[pid] || {};
          const init      = me.initialWager ?? '';
          const fin       = me.finalWager ?? '';
          const allF      = Object.values(subs).map(s => s.finalWager ?? 0);
          const avg       = allF.length
            ? (allF.reduce((a,b)=>a+b,0) / allF.length).toFixed(2)
            : '';
          const changed   = avg
            ? Math.abs(fin - avg) < Math.abs(init - avg)
            : '';

          // index
          row[`trial${trialNum}_index`] = origIdx;

          // wagers & wallet
          row[`trial${trialNum}_initialWager`]     = init;
          row[`trial${trialNum}_finalWager`]       = fin;
          row[`trial${trialNum}_groupAvgWager`]    = avg;
          row[`trial${trialNum}_changedDirection`] = changed;
          row[`wallet_after_trial${trialNum}`]     = me.walletAfter ?? '';

          // fight data
          const tdoc = trialDocsByNum[trialNum] || {};
          fightKeys.forEach(key => {
            const fKey = fightFeatureKeyMap[key];
            row[`trial${trialNum}_FighterA_${key}`] =
              tdoc.fighterData?.fighterA?.[fKey] ?? '';
            row[`trial${trialNum}_FighterB_${key}`] =
              tdoc.fighterData?.fighterB?.[fKey] ?? '';
          });
          row[`trial${trialNum}_predicted_winner_numeric`] =
            tdoc.fighterData?.predicted_winner_numeric ?? '';
          row[`trial${trialNum}_winner`] =
            tdoc.fighterData?.winner ?? '';
        }
      }

      // -- Post‑task survey --
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

      // 6) Write CSV row
      const line = headers.map(h => {
        const cell = String(row[h] ?? '').replace(/"/g,'""');
        return `"${cell}"`;
      }).join(',');
      res.write(line + '\n');
    }
  }

  // 7) Finish streaming
  res.end();
});

module.exports = router;
