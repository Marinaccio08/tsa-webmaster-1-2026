// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import dotenv from 'dotenv';
dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: "tsa-webmaster-1.firebaseapp.com",
  databaseURL: "https://tsa-webmaster-1-default-rtdb.firebaseio.com",
  projectId: "tsa-webmaster-1",
  storageBucket: "tsa-webmaster-1.firebasestorage.app",
  messagingSenderId: "344004193042",
  appId: process.env.FIREBASE_APPID
};

console.log(process.env.FIREBASE_APIKEY)

// Initialize Firebase
export const dbApp = initializeApp(firebaseConfig);

export default firebaseConfig;
