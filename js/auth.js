document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus()

    initializeForms()

    initializePasswordStrength()
  })

  const DEMO_ACCOUNTS = {
    player: {
      username: "player_demo",
      password: "player123",
      role: "player",
      profile: {
        name: "S.M Akbar Rizvi",
        steamId: "76561198123456789",
        level: 47,
        xp: 8750,
      },
    },
    admin: {
      username: "admin_demo",
      password: "admin123",
      role: "admin",
      profile: {
        name: "ADMIN_MASTER",
        steamId: "76561198987654321",
        level: 99,
        xp: 50000,
      },
    },
  }
  
  // Zayed bhaiiii Registered users storage (in real app, this would be a database)
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || []
  
  function initializeForms() {
    const loginForm = document.getElementById("login-form")
    const signupForm = document.getElementById("signup-form")
  
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin)
    }
  
    if (signupForm) {
      signupForm.addEventListener("submit", handleSignup)
    }
  }
  
  function initializePasswordStrength() {
    const passwordInput = document.getElementById("signup-password")
    if (passwordInput) {
      passwordInput.addEventListener("input", checkPasswordStrength)
    }
  }
  
  function handleLogin(e) {
    e.preventDefault()
  
    const formData = new FormData(e.target)
    const username = formData.get("username")
    const password = formData.get("password")
    const rememberMe = formData.get("remember-me") === "on"
  

    showLoading("Authenticating...")
  
    // Zayed bhai Simulate API call delay
    setTimeout(() => {
      const user = authenticateUser(username, password)
  
      if (user) {
        loginSuccess(user, rememberMe)
      } else {
        loginError("Invalid username or password")
      }
  
      hideLoading()
    }, 1500)
  }
  
  function handleSignup(e) {
    e.preventDefault()
  
    const formData = new FormData(e.target)
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      username: formData.get("username"),
      email: formData.get("email"),
      steamId: formData.get("steamId"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      accountType: formData.get("accountType"),
      terms: formData.get("terms") === "on",
      newsletter: formData.get("newsletter") === "on",
    }
  
    
    const validation = validateSignupForm(userData)
    if (!validation.isValid) {
      showError(validation.message)
      return
    }
  
  
    showLoading("Creating account...")
  
    //Zayed bhai Simulate API call delay
    setTimeout(() => {
      const result = createUser(userData)
  
      if (result.success) {
        signupSuccess(result.user)
      } else {
        signupError(result.message)
      }
  
      hideLoading()
    }, 2000)
  }
  
  function authenticateUser(username, password) {
   
    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
      if (account.username === username && account.password === password) {
        return account
      }
    }
  
  
    const user = registeredUsers.find((u) => (u.username === username || u.email === username) && u.password === password)
  
    return user || null
  }
  
  function createUser(userData) {
    
    const existingUser = registeredUsers.find((u) => u.username === userData.username || u.email === userData.email)
  
    if (existingUser) {
      return {
        success: false,
        message: "Username or email already exists",
      }
    }
  
   
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.accountType,
      profile: {
        name: userData.username.toUpperCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        steamId: userData.steamId || `765611981${Math.random().toString().substr(2, 8)}`,
        level: 1,
        xp: 0,
      },
      createdAt: new Date().toISOString(),
      newsletter: userData.newsletter,
    }
  
    
    registeredUsers.push(newUser)
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
  
    return {
      success: true,
      user: newUser,
    }
  }
  
  function validateSignupForm(userData) {
    if (!userData.firstName || userData.firstName.length < 2) {
      return { isValid: false, message: "First name must be at least 2 characters" }
    }
  
    if (!userData.lastName || userData.lastName.length < 2) {
      return { isValid: false, message: "Last name must be at least 2 characters" }
    }
  
    if (!userData.username || userData.username.length < 3 || userData.username.length > 20) {
      return { isValid: false, message: "Username must be 3-20 characters long" }
    }
  
    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      return { isValid: false, message: "Username can only contain letters, numbers, and underscores" }
    }
  
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
  
    if (!userData.password || userData.password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters long" }
    }
  
    if (userData.password !== userData.confirmPassword) {
      return { isValid: false, message: "Passwords do not match" }
    }
  
    if (!userData.terms) {
      return { isValid: false, message: "You must agree to the Terms of Service" }
    }
  
    return { isValid: true }
  }
  
  function checkPasswordStrength(e) {
    const password = e.target.value
    const strengthFill = document.getElementById("strength-fill")
    const strengthText = document.getElementById("strength-text")
  
    if (!strengthFill || !strengthText) return
  
    let strength = 0
    let strengthLabel = "Very Weak"
    let strengthColor = "#ef4444"
  
    if (password.length >= 6) strength += 1
    if (password.length >= 10) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
  
    switch (strength) {
      case 0:
      case 1:
        strengthLabel = "Very Weak"
        strengthColor = "#ef4444"
        break
      case 2:
        strengthLabel = "Weak"
        strengthColor = "#f59e0b"
        break
      case 3:
        strengthLabel = "Fair"
        strengthColor = "#eab308"
        break
      case 4:
        strengthLabel = "Good"
        strengthColor = "#22c55e"
        break
      case 5:
      case 6:
        strengthLabel = "Strong"
        strengthColor = "#10b981"
        break
    }
  
    const percentage = (strength / 6) * 100
    strengthFill.style.width = `${percentage}%`
    strengthFill.style.background = strengthColor
    strengthText.textContent = `Password strength: ${strengthLabel}`
    strengthText.style.color = strengthColor
  }
  
  function quickLogin(type) {
    const account = DEMO_ACCOUNTS[type]
    if (!account) return

    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
  
    if (usernameInput && passwordInput) {
      usernameInput.value = account.username
      passwordInput.value = account.password
  
      
      showLoading("Logging in...")
  
    
      setTimeout(() => {
        loginSuccess(account, false)
        hideLoading()
      }, 1000)
    }
  }
  
  function loginSuccess(user, rememberMe) {
  
    const sessionData = {
      user: user,
      loginTime: new Date().toISOString(),
      rememberMe: rememberMe,
    }
  
    if (rememberMe) {
      localStorage.setItem("userSession", JSON.stringify(sessionData))
    } else {
      sessionStorage.setItem("userSession", JSON.stringify(sessionData))
    }
  

    showNotification("Login successful! Redirecting...", "success")
  
    setTimeout(() => {
      if (user.role === "admin") {
        window.location.href = "admin.html"
      } else {
        window.location.href = "index.html"
      }
    }, 1500)
  }
  
  function signupSuccess(user) {
    showNotification("Account created successfully! Redirecting to login...", "success")
  
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
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
  
    switch (type) {
      case "success":
        notification.style.background = "linear-gradient(135deg, #10b981, #059669)"
        break
      case "error":
        notification.style.background = "linear-gradient(135deg, #ef4444, #dc2626)"
        break
      default:
        notification.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)"
    }
  
    notification.textContent = message
    document.body.appendChild(notification)
  
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }
  
  function showLoading(message = "Loading...") {
    const overlay = document.getElementById("loading-overlay")
    const loadingText = overlay.querySelector("p")
  
    if (loadingText) {
      loadingText.textContent = message
    }
  
    overlay.classList.add("show")
  }
  
  function hideLoading() {
    const overlay = document.getElementById("loading-overlay")
    overlay.classList.remove("show")
  }
  
  function togglePassword(inputId) {
    const input = document.getElementById(inputId)
    const eyeIcon = document.getElementById(inputId + "-eye")
  
    if (input.type === "password") {
      input.type = "text"
      eyeIcon.className = "fas fa-eye-slash"
    } else {
      input.type = "password"
      eyeIcon.className = "fas fa-eye"
    }
  }
  
  function checkAuthStatus() {
  
    if (window.location.pathname.includes("login.html") || window.location.pathname.includes("signup.html")) {
      return
    }
  
    const sessionData =
      JSON.parse(localStorage.getItem("userSession")) || JSON.parse(sessionStorage.getItem("userSession"))
  
    if (!sessionData) {
     
      window.location.href = "login.html"
      return
    }
  
    const { user } = sessionData
  
 
    if (window.location.pathname.includes("admin.html") && user.role !== "admin") {
      showNotification("Access denied. Admin privileges required.", "error")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
      return
    }
  
    updateUserInterface(user)
  }
  
  function updateUserInterface(user) {
    const playerNameElements = document.querySelectorAll(".player-name")
    playerNameElements.forEach((element) => {
      element.textContent = user.profile.name
    })

    const steamIdElements = document.querySelectorAll(".steam-id")
    steamIdElements.forEach((element) => {
      element.textContent = `Steam ID: ${user.profile.steamId}`
    })

    const levelElements = document.querySelectorAll(".level-badge")
    levelElements.forEach((element) => {
      element.textContent = `Level ${user.profile.level}`
    })
  
    const xpElements = document.querySelectorAll(".xp-text")
    xpElements.forEach((element) => {
      const maxXp = user.profile.level * 1000
      element.textContent = `XP: ${user.profile.xp} / ${maxXp}`
    })
  }
  
  function logout() {
    localStorage.removeItem("userSession")
    sessionStorage.removeItem("userSession")

    showNotification("Logged out successfully", "success")

    setTimeout(() => {
      window.location.href = "login.html"
    }, 1000)
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const sessionData =
      JSON.parse(localStorage.getItem("userSession")) || JSON.parse(sessionStorage.getItem("userSession"))
  })
  
  console.log(" Authentication System Loaded")
  