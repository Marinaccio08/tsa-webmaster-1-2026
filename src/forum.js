import { auth, db } from "../config.js";
import { ref, push, onValue, remove, set, get, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

const threadsRef = ref(db, "forum/threads");

// ── State ──
let currentUser = null;
let allThreads = [];
let activeFilter = "all";

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const form = document.getElementById("new-thread-form");
    const signInPrompt = document.getElementById("forum-signin-prompt");
    if (form) form.style.display = user ? "flex" : "none";
    if (signInPrompt) signInPrompt.style.display = user ? "none" : "block";
});

// ── Compress image to base64 ──
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let w = img.width, h = img.height;
                if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ── Create a thread ──
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("new-thread-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) return alert("You must be signed in to post.");

        const titleInput = document.getElementById("thread-title");
        const bodyInput = document.getElementById("thread-body");
        const categoryInput = document.getElementById("thread-category");
        const imageInput = document.getElementById("thread-image");
        const submitBtn = form.querySelector(".post-submit-btn");

        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        const category = categoryInput.value;
        if (!title || !body) return alert("Please fill in both the title and body.");

        submitBtn.disabled = true;
        submitBtn.textContent = "Posting...";

        try {
            let imageUrl = "";

            // Compress and encode image if one was selected
            if (imageInput.files && imageInput.files[0]) {
                const file = imageInput.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert("Image must be under 5MB.");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Post Thread";
                    return;
                }
                imageUrl = await compressImage(file);
            }


            await push(threadsRef, {
                title,
                body,
                author: currentUser.displayName || currentUser.email,
                authorUid: currentUser.uid,
                category,
                createdAt: Date.now(),
                likes: 0,
                dislikes: 0,
                replyCount: 0,
                imageUrl,
            });

            titleInput.value = "";
            bodyInput.value = "";
            imageInput.value = "";
        } catch (err) {
            console.error("Post error:", err);
            alert("Failed to post: " + err.message);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = "Post Thread";
    });

    // ── Category filter buttons ──
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.category;
            renderFilteredThreads();
        });
    });
});

// ── Render threads (real-time) ──
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("forum-threads");
    if (!container) return;

    onValue(threadsRef, (snapshot) => {
        allThreads = [];
        snapshot.forEach((child) => {
            allThreads.push({ id: child.key, ...child.val() });
        });
        allThreads.sort((a, b) => b.createdAt - a.createdAt);
        renderFilteredThreads();
    }, (error) => {
        console.error("Firebase RTDB error:", error);
        container.innerHTML = '<p class="forum-empty">Could not load threads. Check your Firebase connection.</p>';
    });
});

function renderFilteredThreads() {
    const container = document.getElementById("forum-threads");
    if (!container) return;
    container.innerHTML = "";

    const filtered = activeFilter === "all"
        ? allThreads
        : allThreads.filter((t) => t.category === activeFilter);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="forum-empty">${activeFilter === "all"
            ? "No threads yet — be the first to start a discussion!"
            : "No threads in this category."
            }</p>`;
        return;
    }

    filtered.forEach((thread) => renderThread(container, thread));
}

function renderThread(container, thread) {
    const card = document.createElement("div");
    card.className = "forum-card";
    card.id = "thread-" + thread.id;

    const uid = currentUser ? currentUser.uid : null;
    const isAuthor = uid && thread.authorUid === uid;

    // Compute vote counts and user's vote from voters object
    const voters = thread.voters || {};
    const likeCount = Object.values(voters).filter((v) => v === "like").length;
    const dislikeCount = Object.values(voters).filter((v) => v === "dislike").length;
    const userVote = uid && voters[uid] ? voters[uid] : null;

    const date = new Date(thread.createdAt);
    const timeStr = date.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
    });

    const categoryLabel = thread.category
        ? `<span class="forum-category">${escapeHtml(thread.category)}</span>`
        : "";

    const imageHtml = thread.imageUrl
        ? `<div class="forum-image-wrap"><img src="${escapeHtml(thread.imageUrl)}" alt="Post image" class="forum-image" loading="lazy"></div>`
        : "";

    card.innerHTML = `
    <div class="forum-card-header">
      <div class="forum-card-header-left">
        ${categoryLabel}
        <span class="forum-author">${escapeHtml(thread.author)}</span>
      </div>
      <span class="forum-time">${timeStr}</span>
    </div>
    <h3 class="forum-title">${escapeHtml(thread.title)}</h3>
    <p class="forum-body">${escapeHtml(thread.body)}</p>
    ${imageHtml}
    <div class="forum-actions">
      <button class="vote-btn like-btn ${userVote === "like" ? "active" : ""}" data-id="${thread.id}" data-type="like">
        👍 <span>${likeCount}</span>
      </button>
      <button class="vote-btn dislike-btn ${userVote === "dislike" ? "active" : ""}" data-id="${thread.id}" data-type="dislike">
        👎 <span>${dislikeCount}</span>
      </button>
      <button class="reply-toggle-btn" data-id="${thread.id}">
        💬 ${thread.replyCount || 0} Replies
      </button>
      ${isAuthor ? `<button class="delete-btn" data-id="${thread.id}">🗑️ Delete</button>` : ""}
    </div>
    <div class="replies-section" id="replies-${thread.id}" style="display:none;">
      <div class="replies-list" id="replies-list-${thread.id}"></div>
      ${currentUser ? `
        <form class="reply-form" data-thread-id="${thread.id}">
          <textarea placeholder="Write a reply..." required maxlength="1000" rows="2"></textarea>
          <button type="submit" class="reply-submit-btn">Reply</button>
        </form>
      ` : ""}
    </div>
  `;

    container.appendChild(card);

    // Attach event listeners
    card.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.addEventListener("click", () => handleThreadVote(btn.dataset.id, btn.dataset.type));
    });

    const deleteBtn = card.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => handleDeleteThread(deleteBtn.dataset.id));
    }

    const replyToggle = card.querySelector(".reply-toggle-btn");
    replyToggle.addEventListener("click", () => toggleReplies(thread.id));

    const replyForm = card.querySelector(".reply-form");
    if (replyForm) {
        replyForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const textarea = replyForm.querySelector("textarea");
            handleReply(thread.id, textarea);
        });
    }
}

// ── Toggle replies section ──
function toggleReplies(threadId) {
    const section = document.getElementById("replies-" + threadId);
    if (!section) return;
    const isVisible = section.style.display !== "none";
    section.style.display = isVisible ? "none" : "block";
    if (!isVisible) loadReplies(threadId);
}

// ── Load replies ──
function loadReplies(threadId) {
    const repliesRef = ref(db, "forum/replies/" + threadId);
    const listEl = document.getElementById("replies-list-" + threadId);
    if (!listEl) return;

    onValue(repliesRef, (snapshot) => {
        listEl.innerHTML = "";
        const replies = [];
        snapshot.forEach((child) => {
            replies.push({ id: child.key, ...child.val() });
        });
        replies.sort((a, b) => a.createdAt - b.createdAt);

        if (replies.length === 0) {
            listEl.innerHTML = '<p class="no-replies">No replies yet.</p>';
            return;
        }

        replies.forEach((reply) => {
            const el = document.createElement("div");
            el.className = "reply-card";

            const date = new Date(reply.createdAt);
            const timeStr = date.toLocaleDateString("en-US", {
                month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit",
            });

            const uid = currentUser ? currentUser.uid : null;
            const isReplyAuthor = uid && reply.authorUid === uid;

            // Per-account voting for replies too
            const voters = reply.voters || {};
            const rLikes = Object.values(voters).filter((v) => v === "like").length;
            const rDislikes = Object.values(voters).filter((v) => v === "dislike").length;
            const rUserVote = uid && voters[uid] ? voters[uid] : null;

            el.innerHTML = `
        <div class="reply-header">
          <span class="reply-author">${escapeHtml(reply.author)}</span>
          <span class="reply-time">${timeStr}</span>
        </div>
        <p class="reply-body">${escapeHtml(reply.body)}</p>
        <div class="reply-actions">
          <button class="vote-btn vote-btn-sm like-btn ${rUserVote === "like" ? "active" : ""}" data-thread="${threadId}" data-reply="${reply.id}" data-type="like">
            👍 <span>${rLikes}</span>
          </button>
          <button class="vote-btn vote-btn-sm dislike-btn ${rUserVote === "dislike" ? "active" : ""}" data-thread="${threadId}" data-reply="${reply.id}" data-type="dislike">
            👎 <span>${rDislikes}</span>
          </button>
          ${isReplyAuthor ? `<button class="delete-reply-btn" data-thread="${threadId}" data-reply="${reply.id}">🗑️</button>` : ""}
        </div>
      `;

            listEl.appendChild(el);

            el.querySelectorAll(".vote-btn").forEach((btn) => {
                btn.addEventListener("click", () =>
                    handleReplyVote(btn.dataset.thread, btn.dataset.reply, btn.dataset.type)
                );
            });

            const delBtn = el.querySelector(".delete-reply-btn");
            if (delBtn) {
                delBtn.addEventListener("click", () =>
                    handleDeleteReply(delBtn.dataset.thread, delBtn.dataset.reply)
                );
            }
        });
    });
}

// ── Post a reply ──
async function handleReply(threadId, textarea) {
    if (!currentUser) return alert("Sign in to reply.");
    const body = textarea.value.trim();
    if (!body) return;

    const repliesRef = ref(db, "forum/replies/" + threadId);
    await push(repliesRef, {
        body,
        author: currentUser.displayName || currentUser.email,
        authorUid: currentUser.uid,
        createdAt: Date.now(),
        likes: 0,
        dislikes: 0,
    });

    // Increment reply count
    const threadRef = ref(db, "forum/threads/" + threadId);
    const snap = await get(threadRef);
    if (snap.exists()) {
        const current = snap.val().replyCount || 0;
        await update(threadRef, { replyCount: current + 1 });
    }

    textarea.value = "";
}

// ── Thread vote (per-account toggle) ──
async function handleThreadVote(threadId, type) {
    if (!currentUser) return alert("Sign in to vote.");
    const uid = currentUser.uid;
    const voterRef = ref(db, `forum/threads/${threadId}/voters/${uid}`);

    const snap = await get(voterRef);
    const currentVote = snap.exists() ? snap.val() : null;

    if (currentVote === type) {
        // Toggle off — user clicked the same vote again
        await remove(voterRef);
    } else {
        // Set new vote (replaces old if switching)
        await set(voterRef, type);
    }
}

// ── Reply vote (per-account toggle) ──
async function handleReplyVote(threadId, replyId, type) {
    if (!currentUser) return alert("Sign in to vote.");
    const uid = currentUser.uid;
    const voterRef = ref(db, `forum/replies/${threadId}/${replyId}/voters/${uid}`);

    const snap = await get(voterRef);
    const currentVote = snap.exists() ? snap.val() : null;

    if (currentVote === type) {
        await remove(voterRef);
    } else {
        await set(voterRef, type);
    }
}

// ── Delete thread ──
async function handleDeleteThread(threadId) {
    if (!confirm("Delete this thread and all its replies?")) return;
    await remove(ref(db, "forum/threads/" + threadId));
    await remove(ref(db, "forum/replies/" + threadId));
}

// ── Delete reply ──
async function handleDeleteReply(threadId, replyId) {
    if (!confirm("Delete this reply?")) return;
    await remove(ref(db, `forum/replies/${threadId}/${replyId}`));

    const threadRef = ref(db, "forum/threads/" + threadId);
    const snap = await get(threadRef);
    if (snap.exists()) {
        const current = snap.val().replyCount || 0;
        await update(threadRef, { replyCount: Math.max(0, current - 1) });
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}