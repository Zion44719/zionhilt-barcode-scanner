/* ========================================================
   ZIONHILT STORE — auth.js
   Handles: login, register, forgot password, screen routing
   Storage key: "zh_users"  (array of user objects)
   ======================================================== */

/* -------------------------------------------------------
   DEFAULT SEED ACCOUNTS  (loaded on first run)
------------------------------------------------------- */
const SEED_ACCOUNTS = [
  {
    username: "admin",
    fullname: "Store Admin",
    email:    "admin@zionhilt.com",
    password: "admin123",
    role:     "supervisor",
    createdAt: new Date().toISOString(),
  },
  {
    username: "cashier",
    fullname: "Default Cashier",
    email:    "cashier@zionhilt.com",
    password: "zionhilt2024",
    role:     "cashier",
    createdAt: new Date().toISOString(),
  },
  {
    username: "tunde",
    fullname: "Tunde Adeyemi",
    email:    "tunde@zionhilt.com",
    password: "tunde2024",
    role:     "cashier",
    createdAt: new Date().toISOString(),
  },
];

/* -------------------------------------------------------
   HELPERS — user storage
------------------------------------------------------- */
function getUsers() {
  const raw = localStorage.getItem("zh_users");
  if (raw) return JSON.parse(raw);
  // First run: seed defaults
  localStorage.setItem("zh_users", JSON.stringify(SEED_ACCOUNTS));
  return SEED_ACCOUNTS;
}

function saveUsers(users) {
  localStorage.setItem("zh_users", JSON.stringify(users));
}

function findUser(username) {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

function findUserByEmail(email) {
  return getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

/* -------------------------------------------------------
   SCREEN ROUTING
------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll(".auth-screen").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  clearAuthMessages();
}

function clearAuthMessages() {
  document.querySelectorAll(".auth-error, .auth-success").forEach((el) => {
    el.textContent = "";
  });
}

/* -------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE
------------------------------------------------------- */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

/* -------------------------------------------------------
   PASSWORD STRENGTH METER
------------------------------------------------------- */
(function attachStrengthMeter() {
  window.addEventListener("DOMContentLoaded", () => {
    const pwInput = document.getElementById("reg-password");
    if (!pwInput) return;
    pwInput.addEventListener("input", () => {
      checkPasswordStrength(pwInput.value);
    });
  });
})();

function checkPasswordStrength(pw) {
  const fill  = document.getElementById("pw-strength-fill");
  const label = document.getElementById("pw-strength-label");
  if (!fill || !label) return;

  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { pct: "0%",   color: "transparent", text: "" },
    { pct: "25%",  color: "#e07a6e",     text: "Weak" },
    { pct: "50%",  color: "#e0a96e",     text: "Fair" },
    { pct: "75%",  color: "#d4e06e",     text: "Good" },
    { pct: "100%", color: "#6ee07a",     text: "Strong" },
  ];

  const level = levels[Math.min(score, 4)];
  fill.style.width      = level.pct;
  fill.style.background = level.color;
  label.textContent     = level.text;
  label.style.color     = level.color;
}

/* -------------------------------------------------------
   LOGIN
------------------------------------------------------- */
function handleLogin() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl    = document.getElementById("login-error");
  const remember = document.getElementById("remember-me").checked;

  errEl.textContent = "";

  if (!username || !password) {
    errEl.textContent = "Please enter both username and password.";
    return;
  }

  const user = findUser(username);

  if (!user || user.password !== password) {
    errEl.textContent = "Invalid username or password.";
    document.getElementById("login-password").value = "";
    return;
  }

  // Success
  if (remember) {
    localStorage.setItem("zh_remember", username);
  } else {
    localStorage.removeItem("zh_remember");
  }

  sessionStorage.setItem("zh_session", JSON.stringify({ username: user.username, fullname: user.fullname, role: user.role }));
  launchDashboard(user);
}

// Restore remembered username on page load
window.addEventListener("DOMContentLoaded", () => {
  const remembered = localStorage.getItem("zh_remember");
  if (remembered) {
    const el = document.getElementById("login-username");
    if (el) { el.value = remembered; document.getElementById("remember-me").checked = true; }
  }

  // Auto-restore active session
  const session = sessionStorage.getItem("zh_session");
  if (session) {
    const user = JSON.parse(session);
    launchDashboard(user);
  }
});

// Enter key on password field
document.addEventListener("DOMContentLoaded", () => {
  const pwEl = document.getElementById("login-password");
  if (pwEl) pwEl.addEventListener("keydown", (e) => { if (e.key === "Enter") handleLogin(); });
});

/* -------------------------------------------------------
   REGISTER
------------------------------------------------------- */
function handleRegister() {
  const fullname = document.getElementById("reg-fullname").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm  = document.getElementById("reg-confirm").value;
  const role     = document.getElementById("reg-role").value;
  const errEl    = document.getElementById("register-error");
  const sucEl    = document.getElementById("register-success");

  errEl.textContent = "";
  sucEl.textContent = "";

  // Validation
  if (!fullname || !username || !email || !password || !confirm) {
    errEl.textContent = "All fields are required.";
    return;
  }
  if (username.length < 3) {
    errEl.textContent = "Username must be at least 3 characters.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = "Please enter a valid email address.";
    return;
  }
  if (password.length < 6) {
    errEl.textContent = "Password must be at least 6 characters.";
    return;
  }
  if (password !== confirm) {
    errEl.textContent = "Passwords do not match.";
    return;
  }
  if (findUser(username)) {
    errEl.textContent = "Username already taken. Choose another.";
    return;
  }
  if (findUserByEmail(email)) {
    errEl.textContent = "An account with that email already exists.";
    return;
  }

  // Save
  const users = getUsers();
  users.push({
    username,
    fullname,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  });
  saveUsers(users);

  sucEl.textContent = "Account created! You can now sign in.";

  // Auto-fill login and redirect after delay
  setTimeout(() => {
    document.getElementById("login-username").value = username;
    showScreen("login-screen");
  }, 1800);
}

/* -------------------------------------------------------
   FORGOT PASSWORD
------------------------------------------------------- */
let _resetToken    = null;  // generated token stored in memory
let _resetUsername = null;  // username linked to reset request

function handleForgotStep1() {
  const email  = document.getElementById("forgot-email").value.trim();
  const errEl  = document.getElementById("forgot-error1");
  const sucEl  = document.getElementById("forgot-success1");

  errEl.textContent = "";
  sucEl.textContent = "";

  if (!email) {
    errEl.textContent = "Please enter your email address.";
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    errEl.textContent = "No account found with that email.";
    return;
  }

  // Generate a 6-character alphanumeric token
  _resetToken    = Math.random().toString(36).substring(2, 8).toUpperCase();
  _resetUsername = user.username;

  // In a real app this would be emailed. Here we display it in the UI.
  document.getElementById("token-display").textContent = "Your token: " + _resetToken;
  sucEl.textContent = "Token generated! Copy it below and set your new password.";

  // Show step 2
  document.getElementById("forgot-step2").style.display = "block";
}

function handleForgotStep2() {
  const token    = document.getElementById("forgot-token").value.trim().toUpperCase();
  const newpw    = document.getElementById("forgot-newpw").value;
  const confirmpw= document.getElementById("forgot-confirmpw").value;
  const errEl    = document.getElementById("forgot-error2");
  const sucEl    = document.getElementById("forgot-success2");

  errEl.textContent = "";
  sucEl.textContent = "";

  if (!token || !newpw || !confirmpw) {
    errEl.textContent = "Please fill all fields.";
    return;
  }
  if (token !== _resetToken) {
    errEl.textContent = "Token does not match. Check and try again.";
    return;
  }
  if (newpw.length < 6) {
    errEl.textContent = "New password must be at least 6 characters.";
    return;
  }
  if (newpw !== confirmpw) {
    errEl.textContent = "Passwords do not match.";
    return;
  }

  // Update password
  const users = getUsers();
  const idx = users.findIndex((u) => u.username === _resetUsername);
  if (idx === -1) { errEl.textContent = "User not found."; return; }

  users[idx].password = newpw;
  saveUsers(users);

  // Clear token
  _resetToken    = null;
  _resetUsername = null;

  sucEl.textContent = "Password reset successfully! Redirecting to sign in…";

  setTimeout(() => {
    document.getElementById("forgot-step2").style.display = "none";
    document.getElementById("token-display").textContent  = "";
    document.getElementById("forgot-email").value  = "";
    document.getElementById("forgot-token").value  = "";
    document.getElementById("forgot-newpw").value  = "";
    document.getElementById("forgot-confirmpw").value = "";
    sucEl.textContent = "";
    errEl.textContent = "";
    showScreen("login-screen");
  }, 2000);
}

/* -------------------------------------------------------
   LAUNCH DASHBOARD / LOGOUT
------------------------------------------------------- */
function launchDashboard(user) {
  // Hide all auth screens
  document.querySelectorAll(".auth-screen").forEach((s) => s.classList.remove("active"));

  const dashboard = document.getElementById("dashboard");
  dashboard.style.display = "block";

  document.getElementById("cashier-display").textContent      = user.fullname || user.username;
  document.getElementById("cashier-role-display").textContent = user.role || "cashier";
  document.getElementById("receipt-cashier").textContent      = user.fullname || user.username;

  // Init app (defined in app.js)
  if (typeof initApp === "function") initApp();
}

function handleLogout() {
  sessionStorage.removeItem("zh_session");
  document.getElementById("dashboard").style.display = "none";
  showScreen("login-screen");
  // Clear receipt list so next cashier starts fresh
  localStorage.removeItem("list");
}
