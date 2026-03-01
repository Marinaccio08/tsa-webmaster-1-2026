// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_APIKEY,
  authDomain: "tsa-webmaster-1.firebaseapp.com",
  databaseURL: "https://tsa-webmaster-1-default-rtdb.firebaseio.com",
  projectId: "tsa-webmaster-1",
  storageBucket: "tsa-webmaster-1.firebasestorage.app",
  messagingSenderId: "344004193042",
  appId: import.meta.env.FIREBASE_APPID
};

// Initialize Firebase
export const dbApp = initializeApp(firebaseConfig);

