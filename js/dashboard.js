document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll(".progress-fill")
    progressBars.forEach((bar) => {
      const width = bar.style.width
      bar.style.width = "0%"
      setTimeout(() => {
        bar.style.width = width
      }, 500)
    })
  

    const cards = document.querySelectorAll(".access-card, .stat-card, .recent-activity")
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
  
    setInterval(updateStats, 30000) 
  })
  
  function updateStats() {
 
    const healthBar = document.querySelector(".progress-fill.health")
    const armorBar = document.querySelector(".progress-fill.armor")
    const staminaBar = document.querySelector(".progress-fill.stamina")
  
    if (healthBar) {
      const currentHealth = Number.parseInt(healthBar.style.width)
      const newHealth = Math.max(50, Math.min(100, currentHealth + Math.random() * 10 - 5))
      healthBar.style.width = newHealth + "%"
      document.querySelector(".stat-card .stat-value").textContent = Math.round(newHealth) + "%"
    }
  }
  
  function handleAction(action, item = "") {
    createNotification(action, item)
  
    switch (action.toLowerCase()) {
      case "use":
        playActionSound("use")
        break
      case "drop":
        playActionSound("drop")
        break
      default:
        playActionSound("default")
    }
  }

  function createNotification(action, item = "") {
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
  
    const message = item ? `${action}: ${item}` : action
    notification.textContent = `✓ ${message}`
  
    document.body.appendChild(notification)
  
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
  
  function playActionSound(type) {
    if (typeof window.AudioContext !== "undefined" || typeof window.webkitAudioContext !== "undefined") {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
  
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
  
      switch (type) {
        case "use":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          break
        case "drop":
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
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
  