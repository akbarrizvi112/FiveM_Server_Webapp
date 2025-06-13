document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("inventory-search");
  const categoryFilters = document.querySelectorAll(".filter-btn");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      filterItems(searchTerm, getActiveCategory());
    });
  }

  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      categoryFilters.forEach((f) => f.classList.remove("active"));
      this.classList.add("active");

      const category = this.getAttribute("data-category");
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      filterItems(searchTerm, category);
    });
  });

  updateInventory();
  checkPlayerAdminStatus()
  setInterval(updateInventory, 60000);
  setInterval(checkPlayerAdminStatus, 60000);
});

function getActiveCategory() {
  const activeFilter = document.querySelector(".filter-btn.active");
  return activeFilter ? activeFilter.getAttribute("data-category") : "all";
}

function filterItems(searchTerm, category) {
  const inventoryItems = document.querySelectorAll(".inventory-item");

  inventoryItems.forEach((item) => {
    const itemName = item.querySelector("h3").textContent.toLowerCase();
    const itemCategory = item.getAttribute("data-category");

    const matchesSearch = itemName.includes(searchTerm);
    const matchesCategory = category === "all" || itemCategory === category;

    if (matchesSearch && matchesCategory) {
      item.style.display = "block";
      item.style.animation = "fadeIn 0.3s ease";
    } else {
      item.style.display = "none";
    }
  });
}

function handleAction(action, item) {
  createNotification(action, item);

  if (action === "Use" || action === "Drop") {
    updateItemQuantity(item, -1);

    fetch("http://localhost:8000/api/inventory/use-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: item
      })
    })
    .then(res => res.json())
    .then(data => {
      updateInventory();
      console.log("Item removed:", data);
    })
    .catch(err => console.error("Remove failed:", err));
  }

  playActionSound(action.toLowerCase());
}


function updateItemQuantity(itemName, change) {
  const inventoryItems = document.querySelectorAll(".inventory-item");
  inventoryItems.forEach((item) => {
    const nameElement = item.querySelector("h3");
    if (nameElement && nameElement.textContent === itemName) {
      const qtyElement = item.querySelector(".item-qty");
      if (qtyElement) {
        const currentQty = Number.parseInt(qtyElement.textContent.match(/\d+/)[0]);
        const newQty = Math.max(0, currentQty + change);
        qtyElement.textContent = `Qty: ${newQty}`;

        qtyElement.style.color = change > 0 ? "#10b981" : "#ef4444";
        setTimeout(() => {
          qtyElement.style.color = "#9ca3af";
        }, 1000);

        if (newQty === 0) {
          setTimeout(() => {
            item.style.opacity = "0.5";
            item.style.pointerEvents = "none";
          }, 1000);
        }
      }
    }
  });
}

function createNotification(action, item) {
  const notification = document.createElement("div");
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
  `;
  notification.textContent = `✓ ${action}: ${item}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function playActionSound(type) {
  if (typeof window.AudioContext !== "undefined" || typeof window.webkitAudioContext !== "undefined") {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "use":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        break;
      case "drop":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        break;
      default:
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}

function updateInventory() {
  const inventoryGrid = document.getElementById("inventory-grid");
  fetch("http://127.0.0.1:8000/api/inventory")
    .then((res) => res.json())
    .then((data) => {
      inventoryGrid.innerHTML = "";

      if (data.items && data.items.length > 0) {
          let totalWeight = 0;
          let totalPrice = 0;
          let totalItems = 0;
        data.items.forEach((item) => {
          const category = item.category.toLowerCase();
          const icon = getItemIcon(category);

          const itemDiv = document.createElement("div");
          itemDiv.className = "inventory-item";
          itemDiv.setAttribute("data-category", category);

          itemDiv.innerHTML = `
            <div class="item-image">
              <i class="fas ${icon}" style="color: #ef4444;"></i>
            </div>
            <div class="item-details">
              <h3>${item.name}</h3>
              <p class="item-qty">Qty: ${item.quantity}</p>
              <p class="item-description">${item.description}</p>
              <div class="item-stats">
                <span class="item-weight">Weight: ${item.weight} kg</span>
                <span class="item-value">Value: $${item.price}</span>
              </div>
              <div class="item-actions">
                <button class="btn btn-use" onclick="handleAction('Use', '${item.name}')">Use</button>
                <button class="btn btn-drop" onclick="handleAction('Drop', '${item.name}')">Drop</button>
              </div>
            </div>
          `;

            totalWeight += item.weight * item.quantity;
            totalPrice += item.price * item.quantity;
            totalItems += item.quantity;

          // Apply hover effect
          itemDiv.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-2px)";
            this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)";
          });
          itemDiv.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "none";
          });

          inventoryGrid.appendChild(itemDiv);
        });

        // Update the totals in your HTML
        const statValues = document.querySelectorAll(".inventory-stats .stat-value");
        statValues[0].textContent = totalItems;                            // Total Items
        statValues[1].textContent = `${totalWeight.toFixed(2)} / 100 kg`;  // Weight, formatted to 2 decimals
        statValues[2].textContent = `$${totalPrice.toLocaleString()}`;     // Value formatted with commas

        // Apply current filters after data is inserted
        const searchTerm = document.getElementById("inventory-search")?.value.toLowerCase() || "";
        const category = getActiveCategory();
        filterItems(searchTerm, category);
      } else {
        inventoryGrid.innerHTML = `<p style="text-align:center; color:#888;">No items found.</p>`;
      }
    });
}

function getItemIcon(category) {
  switch (category) {
    case "weapons":
      return "fa-gun";
    case "medical":
      return "fa-kit-medical";
    case "tools":
      return "fa-wrench";
    case "misc":
      return "fa-box-open";
    default:
      return "fa-box";
  }
}

function checkPlayerAdminStatus() {
  fetch("http://localhost:8000/api/check-admin")
  .then(res => res.json())
  .then(data => {
    if (data.admin) {
      document.getElementById("adminLink").style.display = "block";
    }
  });
}