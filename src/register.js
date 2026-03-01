import { auth } from "../config.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

document.getElementById("submitData").onclick = async function () {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const password = document.getElementById("userPass").value;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    // Create the user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Store first + last name in the user profile's displayName
    await updateProfile(userCredential.user, {
      displayName: firstName + " " + lastName,
    });

    alert("Account created successfully! Welcome, " + firstName + "!");
    window.location.href = "/";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("An account with this email already exists.");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter a valid email address.");
    } else if (error.code === "auth/weak-password") {
      alert("Password is too weak. Please use at least 6 characters.");
    } else {
      alert("Registration failed: " + error.message);
    }
    console.error("Registration error:", error);
  }
};