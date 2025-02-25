// backend/firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./ufc-prediction-task-firebase-adminsdk-fbsvc-06c876478e.json'); // Update the path as necessary

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ufc-prediction-task.firebaseio.com" // Replace with your actual Firebase project URL
});

module.exports = admin;
