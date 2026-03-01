import { auth } from "../config.js";
import { signInWithEmailAndPassword } from "firebase/auth";

document.getElementById("signInBtn").onclick = async function () {
  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPass").value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Signed in successfully!");
    window.location.href = "/";
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      alert("Invalid email or password.");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter a valid email address.");
    } else if (error.code === "auth/too-many-requests") {
      alert("Too many failed attempts. Please try again later.");
    } else {
      alert("Sign in failed: " + error.message);
    }
    console.error("Sign in error:", error);
  }
};
