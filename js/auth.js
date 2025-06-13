document.addEventListener("DOMContentLoaded", () => {
  initializeForms()
  initializePasswordStrength()
  console.log("Authentication System Loaded")
})

function initializeForms() {
  const loginForm = document.getElementById("login-form")
  const signupForm = document.getElementById("signup-form")

  loginForm?.addEventListener("submit", handleLogin)
  signupForm?.addEventListener("submit", handleSignup)
}

function initializePasswordStrength() {
  document.getElementById("signup-password")?.addEventListener("input", checkPasswordStrength)
}

async function handleLogin(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const identifier = formData.get("username") // Still using the input named "username"
  const password = formData.get("password")
  const rememberMe = formData.get("remember-me") === "on"

  showLoading("Authenticating...")

  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    })

    const result = await response.json()
    hideLoading()

    if (response.ok) {
      loginSuccess(result.user, rememberMe)
    } else {
      loginError(result.message || "Invalid Credentials")
    }
  } catch (error) {
    hideLoading()
    loginError("Server error. Try again later.")
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const userData = {
    firstName: document.getElementById("first-name").value.trim(),
    lastName: document.getElementById("last-name").value.trim(),
    identifier: document.getElementById("signup-username").value.trim(),
    password: document.getElementById("signup-password").value,
    confirmPassword: document.getElementById("confirm-password").value,
    termsAccepted: document.getElementById("terms").checked
  };


  const validation = validateSignupForm(userData);
  if (!validation.isValid) return showError(validation.message);

  showLoading("Creating account...");

  try {
    const response = await fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    hideLoading();

    if (response.ok) {
      signupSuccess();
    } else {
      signupError(result.message || "Signup failed");
    }
  } catch (error) {
    hideLoading();
    signupError("Server error. Try again later.");
  }
}

function validateSignupForm(userData) {
  if (!userData.firstName || userData.firstName.length < 2)
    return { isValid: false, message: "First name must be at least 2 characters" };

  if (!userData.lastName || userData.lastName.length < 2)
    return { isValid: false, message: "Last name must be at least 2 characters" };

  const identifierRegex = /^\d{4}[A-Z]-[A-Z]{2,3}-\d{3}$/;
  if (!userData.identifier || !identifierRegex.test(userData.identifier))
    return { isValid: false, message: "Identifier must follow the format (2023X-BXX-XXX)" };

  if (!userData.password || userData.password.length < 6)
    return { isValid: false, message: "Password must be at least 6 characters long" };

  if (userData.password !== userData.confirmPassword)
    return { isValid: false, message: "Passwords do not match" };

  if (!userData.termsAccepted)
    return { isValid: false, message: "You must agree to the Terms of Service" };

  return { isValid: true };
}


function checkPasswordStrength(e) {
  const password = e.target.value
  const strengthFill = document.getElementById("strength-fill")
  const strengthText = document.getElementById("strength-text")
  if (!strengthFill || !strengthText) return

  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Strong"]
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981", "#10b981"]

  const label = labels[strength]
  const color = colors[strength]
  strengthFill.style.width = `${(strength / 6) * 100}%`
  strengthFill.style.background = color
  strengthText.textContent = `Password strength: ${label}`
  strengthText.style.color = color
}

function loginSuccess(user, rememberMe) {
  const sessionData = {
    user: user,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe,
  }

  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem("userSession", JSON.stringify(sessionData))

  showNotification("Login successful! Redirecting...", "success")

  setTimeout(() => {
    window.location.href = "dashboard.html"
  }, 1500)
}

function signupSuccess() {
  showNotification("Account created successfully! Redirecting to login...", "success")
  setTimeout(() => window.location.href = "login.html", 2000)
}

function loginError(message) {
  showError(message)
}

function signupError(message) {
  showError(message)
}

function showError(message) {
  showNotification(message, "error")
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 600;
    z-index: 1001;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  `

  const colors = {
    success: "linear-gradient(135deg, #10b981, #059669)",
    error: "linear-gradient(135deg, #ef4444, #dc2626)",
    info: "linear-gradient(135deg, #3b82f6, #2563eb)",
  }

  notification.style.background = colors[type]
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 4000)
}

function showLoading(message = "Loading...") {
  const overlay = document.getElementById("loading-overlay")
  overlay.querySelector("p").textContent = message
  overlay.classList.add("show")
}

function hideLoading() {
  document.getElementById("loading-overlay").classList.remove("show")
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const icon = document.getElementById(`${inputId}-eye`)
  const isPassword = input.type === "password"
  input.type = isPassword ? "text" : "password"
  icon.className = isPassword ? "fas fa-eye-slash" : "fas fa-eye"
}

function logout() {
  localStorage.removeItem("userSession")
  sessionStorage.removeItem("userSession")

  history.pushState(null, null, location.href)
  window.onpopstate = function () {
    history.go(1)
  }

  showNotification("Logged out successfully", "success")
  setTimeout(() => location.href = "login.html", 1000)
  
  fetch("http://localhost:8000/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  })
}
