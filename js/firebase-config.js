// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDO3z7lXZ251_oTYrt9-B7APdDzEq1eEbw",
  authDomain: "tap-earn-bot.firebaseapp.com",
  databaseURL: "https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tap-earn-bot",
  storageBucket: "tap-earn-bot.firebasestorage.app",
  messagingSenderId: "618614166679",
  appId: "1:618614166679:web:544fb3bff6b333f2d505d2",
  measurementId: "G-LRED4K136N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
