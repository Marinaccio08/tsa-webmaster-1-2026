import { auth } from "../config.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
    const signInLink = document.getElementById("nav-signin");
    const signUpLink = document.getElementById("nav-signup");
    const userGreeting = document.getElementById("user-greeting");
    const signOutBtn = document.getElementById("signout-btn");

    if (!signInLink || !signUpLink || !userGreeting || !signOutBtn) return;

    if (user) {
        // User is signed in — show greeting, hide auth links
        const name = user.displayName || user.email;
        userGreeting.textContent = "Hi, " + name;
        userGreeting.style.display = "inline";
        signOutBtn.style.display = "inline";
        signInLink.style.display = "none";
        signUpLink.style.display = "none";
    } else {
        // User is signed out — show auth links, hide greeting
        userGreeting.style.display = "none";
        signOutBtn.style.display = "none";
        signInLink.style.display = "inline";
        signUpLink.style.display = "inline";
    }
});

// Sign out handler
document.addEventListener("DOMContentLoaded", () => {
    const signOutBtn = document.getElementById("signout-btn");
    if (signOutBtn) {
        signOutBtn.onclick = async () => {
            try {
                await signOut(auth);
                window.location.href = "/";
            } catch (error) {
                alert("Sign out failed: " + error.message);
                console.error("Sign out error:", error);
            }
        };
    }
});
