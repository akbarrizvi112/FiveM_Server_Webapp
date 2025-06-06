// Inventory specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("inventory-search")
    const categoryFilters = document.querySelectorAll(".filter-btn")
    const inventoryItems = document.querySelectorAll(".inventory-item")
  
    // Search functionality
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
        filterItems(searchTerm, getActiveCategory())
      })
    }
  
    // Category filter functionality
    categoryFilters.forEach((filter) => {
      filter.addEventListener("click", function () {
        // Remove active class from all filters
        categoryFilters.forEach((f) => f.classList.remove("active"))
        // Add active class to clicked filter
        this.classList.add("active")
  
        const category = this.getAttribute("data-category")
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
        filterItems(searchTerm, category)
      })
    })
  
    // Add hover effects
    inventoryItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      item.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  })
  
  function getActiveCategory() {
    const activeFilter = document.querySelector(".filter-btn.active")
    return activeFilter ? activeFilter.getAttribute("data-category") : "all"
  }
  
  function filterItems(searchTerm, category) {
    const inventoryItems = document.querySelectorAll(".inventory-item")
  
    inventoryItems.forEach((item) => {
      const itemName = item.querySelector("h3").textContent.toLowerCase()
      const itemCategory = item.getAttribute("data-category")
  
      const matchesSearch = itemName.includes(searchTerm)
      const matchesCategory = category === "all" || itemCategory === category
  
      if (matchesSearch && matchesCategory) {
        item.style.display = "block"
        item.style.animation = "fadeIn 0.3s ease"
      } else {
        item.style.display = "none"
      }
    })
  }
  
  function handleAction(action, item) {
    createNotification(action, item)
  
    // Update item quantity
    if (action === "Use" || action === "Drop") {
      updateItemQuantity(item, -1)
    }
  
    playActionSound(action.toLowerCase())
  }
  
  function updateItemQuantity(itemName, change) {
    const inventoryItems = document.querySelectorAll(".inventory-item")
    inventoryItems.forEach((item) => {
      const nameElement = item.querySelector("h3")
      if (nameElement && nameElement.textContent === itemName) {
        const qtyElement = item.querySelector(".item-qty")
        if (qtyElement) {
          const currentQty = Number.parseInt(qtyElement.textContent.match(/\d+/)[0])
          const newQty = Math.max(0, currentQty + change)
          qtyElement.textContent = `Qty: ${newQty}`
  
          // Add visual feedback
          qtyElement.style.color = change > 0 ? "#10b981" : "#ef4444"
          setTimeout(() => {
            qtyElement.style.color = "#9ca3af"
          }, 1000)
  
          // Hide item if quantity reaches 0
          if (newQty === 0) {
            setTimeout(() => {
              item.style.opacity = "0.5"
              item.style.pointerEvents = "none"
            }, 1000)
          }
        }
      }
    })
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
  