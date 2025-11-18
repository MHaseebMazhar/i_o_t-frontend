// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
const firebaseConfig = {
 
  apiKey: "AIzaSyAqamBD3D1Vi18xhQeDgjEaWacTM2mling",
 
  authDomain: "rideshare-a39db.firebaseapp.com",
 
  projectId: "rideshare-a39db",
 
  storageBucket: "rideshare-a39db.firebasestorage.app",
 
  messagingSenderId: "323213123013",
 
  appId: "1:323213123013:web:977499ea98e0b798323fac",
 
  measurementId: "G-4EGE4V670K"
 
};
 
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFirebaseToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "",
    });
    return token;
  } catch (err) {
    console.error("FCM error:", err);
  }
};
