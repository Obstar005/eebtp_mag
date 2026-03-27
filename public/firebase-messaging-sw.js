// Import the Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDLd3jqblbD1UI9h8lZqxXD3CWlmNjed2E",
  authDomain: "eebtp-mag.firebaseapp.com",
  projectId: "eebtp-mag",
  storageBucket: "eebtp-mag.firebasestorage.app",
  messagingSenderId: "913125998718",
  appId: "1:913125998718:web:92482264d1e2ca619c982f",
  measurementId: "G-YTCQPLKNHM",
};

// Initialize Firebase App in service worker
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Reçu un message en arrière-plan ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo_eebtp.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
