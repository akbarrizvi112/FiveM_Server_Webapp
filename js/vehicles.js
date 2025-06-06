// Vehicles specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const vehicleFilters = document.querySelectorAll(".filter-btn")
    const vehicleCards = document.querySelectorAll(".vehicle-card")
  
    // Vehicle filter functionality
    vehicleFilters.forEach((filter) => {
      filter.addEventListener("click", function () {
        // Remove active class from all filters
        vehicleFilters.forEach((f) => f.classList.remove("active"))
        // Add active class to clicked filter
        this.classList.add("active")
  
        const filterValue = this.getAttribute("data-filter")
        filterVehicles(filterValue)
      })
    })
  
    // Add hover effects
    vehicleCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  
    // Add purchase card hover effects
    const purchaseCards = document.querySelectorAll(".purchase-card")
    purchaseCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  })
  
  function filterVehicles(filter) {
    const vehicleCards = document.querySelectorAll(".vehicle-card")
  
    vehicleCards.forEach((card) => {
      const status = card.getAttribute("data-status")
  
      if (filter === "all" || status === filter) {
        card.style.display = "block"
        card.style.animation = "fadeIn 0.3s ease"
      } else {
        card.style.display = "none"
      }
    })
  }
  
  function handleAction(action, vehicle) {
    createNotification(action, vehicle)
  
    switch (action.toLowerCase()) {
      case "spawn":
        updateVehicleStatus(vehicle, "in-use")
        playActionSound("spawn")
        break
      case "track":
        showTrackingInfo(vehicle)
        playActionSound("track")
        break
      case "sell":
        showSellConfirmation(vehicle)
        playActionSound("sell")
        break
      case "repair":
        updateVehicleCondition(vehicle, 100)
        playActionSound("repair")
        break
      case "purchase":
        showPurchaseConfirmation(vehicle)
        playActionSound("purchase")
        break
      default:
        playActionSound("default")
    }
  }
  
  function updateVehicleStatus(vehicleName, newStatus) {
    const vehicleCards = document.querySelectorAll(".vehicle-card")
    vehicleCards.forEach((card) => {
      const nameElement = card.querySelector("h3")
      if (nameElement && nameElement.textContent === vehicleName) {
        const statusBadge = card.querySelector(".status-badge")
        const spawnButton = card.querySelector(".btn-spawn")
  
        if (statusBadge && spawnButton) {
          statusBadge.textContent = newStatus === "in-use" ? "In Use" : "Available"
          statusBadge.className = `status-badge ${newStatus}`
  
          if (newStatus === "in-use") {
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
  
  function updateVehicleCondition(vehicleName, newCondition) {
    const vehicleCards = document.querySelectorAll(".vehicle-card")
    vehicleCards.forEach((card) => {
      const nameElement = card.querySelector("h3")
      if (nameElement && nameElement.textContent === vehicleName) {
        const conditionElement = card.querySelector(".condition-poor, .condition-good, .condition-excellent")
        if (conditionElement) {
          conditionElement.textContent = newCondition + "%"
          conditionElement.className =
            newCondition >= 90 ? "condition-excellent" : newCondition >= 70 ? "condition-good" : "condition-poor"
        }
      }
    })
  }
  
  function showTrackingInfo(vehicle) {
    const modal = createModal(
      "Vehicle Tracking",
      `
          <div class="tracking-info">
              <h4>${vehicle}</h4>
              <p><strong>Current Location:</strong> Downtown Street</p>
              <p><strong>Speed:</strong> 45 mph</p>
              <p><strong>Fuel Level:</strong> 78%</p>
              <p><strong>Last Update:</strong> 2 minutes ago</p>
              <div style="margin-top: 1rem;">
                  <button class="btn btn-track" onclick="closeModal()">Close</button>
              </div>
          </div>
      `,
    )
    showModal(modal)
  }
  
  function showSellConfirmation(vehicle) {
    const modal = createModal(
      "Sell Vehicle",
      `
          <div class="sell-confirmation">
              <h4>Sell ${vehicle}?</h4>
              <p>You will receive <strong style="color: #10b981;">$45,000</strong> for this vehicle.</p>
              <p style="color: #ef4444; font-size: 0.875rem;">This action cannot be undone.</p>
              <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                  <button class="btn btn-cancel" onclick="closeModal()">Cancel</button>
                  <button class="btn btn-sell" onclick="confirmSell('${vehicle}')">Confirm Sale</button>
              </div>
          </div>
      `,
    )
    showModal(modal)
  }
  
  function showPurchaseConfirmation(vehicle) {
    const prices = {
      "Sports Car": 85000,
      "Pickup Truck": 45000,
      Helicopter: 250000,
    }
  
    const price = prices[vehicle] || 50000
  
    const modal = createModal(
      "Purchase Vehicle",
      `
          <div class="purchase-confirmation">
              <h4>Purchase ${vehicle}?</h4>
              <p>Cost: <strong style="color: #ef4444;">$${price.toLocaleString()}</strong></p>
              <p>Current Balance: <strong style="color: #10b981;">$173,140</strong></p>
              <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                  <button class="btn btn-cancel" onclick="closeModal()">Cancel</button>
                  <button class="btn btn-purchase" onclick="confirmPurchase('${vehicle}', ${price})">Purchase</button>
              </div>
          </div>
      `,
    )
    showModal(modal)
  }
  
  function confirmSell(vehicle) {
    createNotification("Vehicle Sold", vehicle)
    closeModal()
    // Remove vehicle card or update status
    setTimeout(() => {
      const vehicleCards = document.querySelectorAll(".vehicle-card")
      vehicleCards.forEach((card) => {
        const nameElement = card.querySelector("h3")
        if (nameElement && nameElement.textContent === vehicle) {
          card.style.opacity = "0.5"
          card.style.pointerEvents = "none"
        }
      })
    }, 1000)
  }
  
  function confirmPurchase(vehicle, price) {
    createNotification("Vehicle Purchased", vehicle)
    closeModal()
  }
  
  function createModal(title, content) {
    return `
          <div class="modal show" id="vehicle-modal">
              <div class="modal-content">
                  <div class="modal-header">
                      <h3>${title}</h3>
                      <button class="modal-close" onclick="closeModal()">&times;</button>
                  </div>
                  <div class="modal-body">
                      ${content}
                  </div>
              </div>
          </div>
      `
  }
  
  function showModal(modalHTML) {
    const existingModal = document.getElementById("vehicle-modal")
    if (existingModal) {
      existingModal.remove()
    }
  
    document.body.insertAdjacentHTML("beforeend", modalHTML)
  }
  
  function closeModal() {
    const modal = document.getElementById("vehicle-modal")
    if (modal) {
      modal.remove()
    }
  }
  
  function createNotification(action, item) {
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
  
    notification.textContent = `✓ ${action}: ${item}`
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
        case "spawn":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          break
        case "track":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          break
        case "sell":
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
          break
        case "repair":
          oscillator.frequency.setValueAtTime(700, audioContext.currentTime)
          break
        case "purchase":
          oscillator.frequency.setValueAtTime(900, audioContext.currentTime)
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
  