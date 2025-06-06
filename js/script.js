// Tab switching functionality
document.addEventListener("DOMContentLoaded", () => {
    const navTabs = document.querySelectorAll(".nav-tab")
    const tabContents = document.querySelectorAll(".tab-content")
    const accessCards = document.querySelectorAll(".access-card")
  
    // Handle navigation tab clicks
    navTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        const targetTab = this.getAttribute("data-tab")
        switchTab(targetTab)
      })
    })
  
    // Handle quick access card clicks
    accessCards.forEach((card) => {
      card.addEventListener("click", function () {
        const targetTab = this.getAttribute("data-navigate")
        if (targetTab) {
          switchTab(targetTab)
        }
      })
    })
  
    function switchTab(targetTab) {
      // Remove active class from all tabs and contents
      navTabs.forEach((tab) => tab.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))
  
      // Add active class to clicked tab and corresponding content
      const activeTab = document.querySelector(`[data-tab="${targetTab}"]`)
      const activeContent = document.getElementById(targetTab)
  
      if (activeTab && activeContent) {
        activeTab.classList.add("active")
        activeContent.classList.add("active")
      }
  
      // Add smooth transition effect
      activeContent.style.opacity = "0"
      setTimeout(() => {
        activeContent.style.opacity = "1"
      }, 50)
    }
  
    // Search functionality
    const inventorySearch = document.getElementById("inventory-search")
    const playerSearch = document.getElementById("player-search")
  
    if (inventorySearch) {
      inventorySearch.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
        const inventoryItems = document.querySelectorAll(".inventory-item")
  
        inventoryItems.forEach((item) => {
          const itemName = item.querySelector("h3").textContent.toLowerCase()
          if (itemName.includes(searchTerm)) {
            item.style.display = "block"
            item.style.animation = "fadeIn 0.3s ease"
          } else {
            item.style.display = "none"
          }
        })
      })
    }
  
    if (playerSearch) {
      playerSearch.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
        const playerRows = document.querySelectorAll(".player-table tbody tr")
  
        playerRows.forEach((row) => {
          const playerName = row.cells[0].textContent.toLowerCase()
          const steamId = row.cells[1].textContent.toLowerCase()
  
          if (playerName.includes(searchTerm) || steamId.includes(searchTerm)) {
            row.style.display = "table-row"
            row.style.animation = "fadeIn 0.3s ease"
          } else {
            row.style.display = "none"
          }
        })
      })
    }
  
    // Add hover effects to cards
    const cards = document.querySelectorAll(
      ".access-card, .inventory-item, .vehicle-card, .balance-card, .admin-stat-card",
    )
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  
    // Add click animations to buttons
    const buttons = document.querySelectorAll(".btn")
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        if (!this.disabled) {
          this.style.transform = "scale(0.95)"
          setTimeout(() => {
            this.style.transform = "scale(1)"
          }, 100)
        }
      })
    })
  
    // Progress bar animations
    const progressBars = document.querySelectorAll(".progress-fill")
    progressBars.forEach((bar) => {
      const width = bar.style.width
      bar.style.width = "0%"
      setTimeout(() => {
        bar.style.width = width
      }, 500)
    })
  
    // Add typing effect to search placeholders
    function addTypingEffect(element, text) {
      let i = 0
      element.placeholder = ""
      const timer = setInterval(() => {
        if (i < text.length) {
          element.placeholder += text.charAt(i)
          i++
        } else {
          clearInterval(timer)
        }
      }, 100)
    }
  
    // Initialize typing effects
    setTimeout(() => {
      if (inventorySearch) {
        addTypingEffect(inventorySearch, "Search items...")
      }
      if (playerSearch) {
        addTypingEffect(playerSearch, "Search players...")
      }
    }, 1000)
  })
  
  // Action handler function
  function handleAction(action, item = "") {
    // Create notification element
    const notification = document.createElement("div")
    notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          font-weight: 600;
          animation: slideIn 0.3s ease;
          max-width: 300px;
      `
  
    // Add CSS animation
    const style = document.createElement("style")
    style.textContent = `
          @keyframes slideIn {
              from {
                  transform: translateX(100%);
                  opacity: 0;
              }
              to {
                  transform: translateX(0);
                  opacity: 1;
              }
          }
          @keyframes slideOut {
              from {
                  transform: translateX(0);
                  opacity: 1;
              }
              to {
                  transform: translateX(100%);
                  opacity: 0;
              }
          }
          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
      `
    document.head.appendChild(style)
  
    // Set notification message
    const message = item ? `${action}: ${item}` : action
    notification.textContent = `✓ ${message}`
  
    // Add to page
    document.body.appendChild(notification)
  
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  
    // Add specific action effects
    switch (action.toLowerCase()) {
      case "use":
        playActionSound("use")
        updateItemQuantity(item, -1)
        break
      case "drop":
        playActionSound("drop")
        updateItemQuantity(item, -1)
        break
      case "spawn":
        playActionSound("spawn")
        updateVehicleStatus(item, "In Use")
        break
      case "withdraw":
      case "deposit":
      case "send money":
        playActionSound("money")
        animateBalance()
        break
      default:
        playActionSound("default")
    }
  }
  
  // Sound effects simulation
  function playActionSound(type) {
    // Create audio context for sound effects
    if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
  
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
  
      // Different frequencies for different actions
      switch (type) {
        case "use":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          break
        case "drop":
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
          break
        case "spawn":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          break
        case "money":
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
          break
        default:
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
      }
  
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
  
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }
  
  // Update item quantity (simulation)
  function updateItemQuantity(itemName, change) {
    const inventoryItems = document.querySelectorAll(".inventory-item")
    inventoryItems.forEach((item) => {
      const nameElement = item.querySelector("h3")
      if (nameElement && nameElement.textContent === itemName) {
        const qtyElement = item.querySelector("p")
        if (qtyElement) {
          const currentQty = Number.parseInt(qtyElement.textContent.match(/\d+/)[0])
          const newQty = Math.max(0, currentQty + change)
          qtyElement.textContent = `Qty: ${newQty}`
  
          // Add visual feedback
          qtyElement.style.color = change > 0 ? "#10b981" : "#ef4444"
          setTimeout(() => {
            qtyElement.style.color = "#9ca3af"
          }, 1000)
        }
      }
    })
  }
  
  // Update vehicle status (simulation)
  function updateVehicleStatus(vehicleName, newStatus) {
    const vehicleCards = document.querySelectorAll(".vehicle-card")
    vehicleCards.forEach((card) => {
      const nameElement = card.querySelector("h3")
      if (nameElement && nameElement.textContent === vehicleName) {
        const statusBadge = card.querySelector(".status-badge")
        const spawnButton = card.querySelector(".btn-spawn")
  
        if (statusBadge && spawnButton) {
          statusBadge.textContent = newStatus
          statusBadge.className = `status-badge ${newStatus.toLowerCase().replace(" ", "-")}`
  
          if (newStatus === "In Use") {
            spawnButton.disabled = true
            spawnButton.classList.add("disabled")
          } else {
            spawnButton.disabled = false
            spawnButton.classList.remove("disabled")
          }
        }
      }
    })
  }
  
  // Animate balance changes
  function animateBalance() {
    const balanceAmounts = document.querySelectorAll(".balance-amount")
    balanceAmounts.forEach((amount) => {
      amount.style.transform = "scale(1.1)"
      amount.style.color = "#10b981"
      setTimeout(() => {
        amount.style.transform = "scale(1)"
        setTimeout(() => {
          amount.style.color = ""
        }, 200)
      }, 200)
    })
  }
  
  // Add particle effects for special actions
  function createParticleEffect(element, color = "#10b981") {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("div")
      particle.style.cssText = `
              position: absolute;
              width: 4px;
              height: 4px;
              background: ${color};
              border-radius: 50%;
              pointer-events: none;
              z-index: 1000;
          `
  
      const rect = element.getBoundingClientRect()
      particle.style.left = rect.left + rect.width / 2 + "px"
      particle.style.top = rect.top + rect.height / 2 + "px"
  
      document.body.appendChild(particle)
  
      const angle = (Math.PI * 2 * i) / 10
      const velocity = 50 + Math.random() * 50
  
      let x = 0,
        y = 0
      const animate = () => {
        x += Math.cos(angle) * velocity * 0.02
        y += Math.sin(angle) * velocity * 0.02 + 0.5
  
        particle.style.transform = `translate(${x}px, ${y}px)`
        particle.style.opacity = Math.max(0, 1 - Math.abs(y) / 100)
  
        if (particle.style.opacity > 0) {
          requestAnimationFrame(animate)
        } else {
          document.body.removeChild(particle)
        }
      }
  
      requestAnimationFrame(animate)
    }
  }
  
  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Alt + number keys for quick tab switching
    if (e.altKey) {
      const tabMap = {
        1: "dashboard",
        2: "inventory",
        3: "vehicles",
        4: "financials",
        5: "admin",
      }
  
      if (tabMap[e.key]) {
        e.preventDefault()
        const targetTab = document.querySelector(`[data-tab="${tabMap[e.key]}"]`)
        if (targetTab) {
          targetTab.click()
        }
      }
    }
  
    // Escape key to clear search
    if (e.key === "Escape") {
      const searchInputs = document.querySelectorAll('input[type="text"]')
      searchInputs.forEach((input) => {
        input.value = ""
        input.dispatchEvent(new Event("input"))
      })
    }
  })
  
  // Add loading animation on page load
  window.addEventListener("load", () => {
    document.body.style.opacity = "0"
    setTimeout(() => {
      document.body.style.transition = "opacity 0.5s ease"
      document.body.style.opacity = "1"
    }, 100)
  })
  
  // Console welcome message
  console.log("PLAYER HUD Dashboard Loaded Successfully! ")