
document.addEventListener("DOMContentLoaded", () => {
  const playerSearch = document.getElementById("player-search")
  const statusFilter = document.getElementById("status-filter")
  const playerRows = document.querySelectorAll(".player-table tbody tr")

  if (playerSearch) {
    playerSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const statusValue = statusFilter.value
      filterPlayers(searchTerm, statusValue)
    })
  }

 
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      const searchTerm = playerSearch.value.toLowerCase()
      const statusValue = this.value
      filterPlayers(searchTerm, statusValue)
    })
  }


  const statCards = document.querySelectorAll(".admin-stat-card")
  statCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)"
      this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = "none"
    })
  })

  loadPlayersToTable()
  loadTotalItemCount()
  loadTotalVehicleCount()
  checkPlayerAdminStatus()

  setInterval(loadPlayersToTable, 60000) 
  setInterval(loadTotalItemCount, 60000) 
  setInterval(loadTotalVehicleCount, 60000) 
  setInterval(checkPlayerAdminStatus, 60000)
})

function filterPlayers(searchTerm, statusFilter) {
  const playerRows = document.querySelectorAll(".player-table tbody tr")

  playerRows.forEach((row) => {
    const playerName = row.cells[0].textContent.toLowerCase()
    const pIdentifier = row.cells[1].textContent.toLowerCase()
    const status = row.getAttribute("data-status")

    const matchesSearch = playerName.includes(searchTerm) || pIdentifier.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || status === statusFilter

    if (matchesSearch && matchesStatus) {
      row.style.display = "table-row"
      row.style.animation = "fadeIn 0.3s ease"
    } else {
      row.style.display = "none"
    }
  })
}

function showPlayerModal(action, playerName) {
  const modal = document.getElementById("player-modal")
  const modalTitle = document.getElementById("player-modal-title")
  const playerNameInput = document.getElementById("player-name")
  const reasonGroup = document.getElementById("reason-group")
  const durationGroup = document.getElementById("duration-group")
  const rewardGroup = document.getElementById("reward-group")
  const amountGroup = document.getElementById("amount-group")
  const confirmBtn = document.getElementById("player-confirm-btn")


  document.getElementById("player-form").reset()
  playerNameInput.value = playerName

 
  reasonGroup.style.display = "block"
  durationGroup.style.display = "none"
  rewardGroup.style.display = "none"
  amountGroup.style.display = "none"

  switch (action) {
    case "reward":
      modalTitle.textContent = "Reward Player"
      reasonGroup.style.display = "none"
      rewardGroup.style.display = "block"
      amountGroup.style.display = "block"
      confirmBtn.textContent = "Give Reward"
      confirmBtn.className = "btn btn-reward"
      break
    case "warn":
      modalTitle.textContent = "Warn Player"
      confirmBtn.textContent = "Send Warning"
      confirmBtn.className = "btn btn-warn"
      break
    case "kick":
      modalTitle.textContent = "Kick Player"
      confirmBtn.textContent = "Kick Player"
      confirmBtn.className = "btn btn-kick"
      break
    case "online":
      modalTitle.textContent = "Allow Player"
      confirmBtn.textContent = "Allow"
      confirmBtn.className = "btn btn-reward"
      break
    case "ban":
      modalTitle.textContent = "Ban Player"
      durationGroup.style.display = "block"
      confirmBtn.textContent = "Ban Player"
      confirmBtn.className = "btn btn-ban"
      break
  }

  modal.classList.add("show")

  const form = document.getElementById("player-form")
  form.onsubmit = (e) => {
    e.preventDefault()
    handlePlayerAction(action, playerName)
  }
}

function closePlayerModal() {
  const modal = document.getElementById("player-modal")
  modal.classList.remove("show")
}

function handlePlayerAction(action, playerName) {
  const reason = document.getElementById("reason").value
  const duration = document.getElementById("duration").value
  const rewardType = document.getElementById("reward-type").value
  const rewardAmount = document.getElementById("reward-amount").value

  if (action !== "reward" && !reason) {
    alert("Please provide a reason")
    return
  }

  if (action === "reward" && !rewardAmount) {
    alert("Please specify reward amount")
    return
  }

  processPlayerAction(action, playerName, {
    reason: reason,
    duration: duration,
    rewardType: rewardType,
    rewardAmount: rewardAmount,
  })

  closePlayerModal()

  createNotification(`Player ${action}ed successfully`, playerName)

  
  addLogEntry("INFO", `Admin action: ${action} applied to ${playerName}`)
}

function processPlayerAction(action, playerName, data) {
  const playerRows = document.querySelectorAll(".player-table tbody tr")
  playerRows.forEach((row) => {
    const nameCell = row.cells[0]
    if (nameCell.textContent === playerName) {
      const statusCell = row.cells[3]
      let newStatus = ""

      switch (action) {
        case "kick":
          newStatus = "offline"
          statusCell.innerHTML = '<span class="status-badge offline">Offline</span>'
          break
        case "online":
          newStatus = "online"
          statusCell.innerHTML = '<span class="status-badge online">Online</span>'
          break
        case "ban":
          newStatus = "banned"
          statusCell.innerHTML = '<span class="status-badge banned">Banned</span>'
          break
      }

      row.setAttribute("data-status", newStatus)

      // Send to backend
      fetch("http://localhost:8000/api/player/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName, 
          status: newStatus
        })
      })
    }
  })
}


function showBroadcastModal() {
  const modal = document.getElementById("broadcast-modal")
  modal.classList.add("show")

  const form = document.getElementById("broadcast-form")
  form.onsubmit = (e) => {
    e.preventDefault()
    handleBroadcast()
  }
}

function closeBroadcastModal() {
  const modal = document.getElementById("broadcast-modal")
  modal.classList.remove("show")
  document.getElementById("broadcast-form").reset()
}

function handleBroadcast() {
  const message = document.getElementById("broadcast-message").value
  const type = document.getElementById("broadcast-type").value

  if (!message.trim()) {
    alert("Please enter a broadcast message")
    return
  }

  processBroadcast(message, type)

  closeBroadcastModal()
  createNotification("Broadcast sent successfully", "")
  addLogEntry("INFO", `Server broadcast sent: ${type.toUpperCase()}`)
}

function processBroadcast(message, type) {
  const broadcastNotification = document.createElement("div")
  broadcastNotification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${getBroadcastColor(type)};
        color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 1001;
        font-weight: 600;
        width: 300px;
        word-wrap: break-word;
        max-width: 1000px;
        text-align: center;
        animation: fadeIn 0.5s ease;
    `

  broadcastNotification.innerHTML = `
        <h4 style="margin-bottom: 1rem; text-transform: uppercase;">${type}</h4>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); border: none; border-radius: 0.25rem; color: white; cursor: pointer;">Close</button>
    `

  document.body.appendChild(broadcastNotification)
  setTimeout(() => {
    if (broadcastNotification.parentNode) {
      broadcastNotification.remove()
    }
  }, 10000)
}

function getBroadcastColor(type) {
  const colors = {
    info: "linear-gradient(135deg, #3b82f6, #2563eb)",
    warning: "linear-gradient(135deg, #f59e0b, #d97706)",
    announcement: "linear-gradient(135deg, #10b981, #059669)",
    emergency: "linear-gradient(135deg, #ef4444, #dc2626)",
  }
  return colors[type] || colors["info"]
}

function showLogsModal() {
  const logsModal = `
        <div class="modal show" id="logs-modal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Server Logs</h3>
                    <button class="modal-close" onclick="closeLogsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="logs-container" style="height: 400px;">
                        ${generateExtendedLogs()}
                    </div>
                </div>
            </div>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", logsModal)
}

function closeLogsModal() {
  const modal = document.getElementById("logs-modal")
  if (modal) {
    modal.remove()
  }
}

function generateExtendedLogs() {
  const logTypes = ["INFO", "WARN", "ERROR"]
  const logMessages = [
    "Player connected to server",
    "Vehicle spawned successfully",
    "Database backup completed",
    "High CPU usage detected",
    "Player disconnected",
    "Transaction processed",
    "Memory usage warning",
    "Security scan completed",
    "Player banned for cheating",
    "Server restart scheduled",
  ]

  let logs = ""
  for (let i = 0; i < 20; i++) {
    const time = new Date(Date.now() - i * 60000).toLocaleTimeString()
    const type = logTypes[Math.floor(Math.random() * logTypes.length)]
    const message = logMessages[Math.floor(Math.random() * logMessages.length)]

    logs += `
            <div class="log-entry ${type.toLowerCase()}">
                <span class="log-time">[${time}]</span>
                <span class="log-type">[${type}]</span>
                <span class="log-message">${message}</span>
            </div>
        `
  }

  return logs
}

function handleAction(action) {
  createNotification(action + " executed successfully", "")
  addLogEntry("INFO", `Admin executed: ${action}`)

  
  switch (action.toLowerCase()) {
    case "server restart":
      showRestartConfirmation()
      break
    case "create backup":
      simulateBackupProcess()
      break
    default:
      playActionSound("default")
  }
}

function showRestartConfirmation() {
  const confirmation = confirm("Are you sure you want to restart the server? All players will be disconnected.")
  if (confirmation) {
    simulateServerRestart()
  }
}

function simulateServerRestart() {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 1001;
        font-weight: 600;
        text-align: center;
        animation: fadeIn 0.5s ease;
    `

  notification.innerHTML = `
        <h4 style="margin-bottom: 1rem;">SERVER RESTART</h4>
        <p>Server will restart in 30 seconds...</p>
        <div style="margin-top: 1rem;">
            <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; margin: 0 auto;">
                <div id="restart-progress" style="width: 0%; height: 100%; background: white; border-radius: 2px; transition: width 0.1s;"></div>
            </div>
        </div>
    `

  document.body.appendChild(notification)

  let progress = 0
  const interval = setInterval(() => {
    progress += 3.33
    document.getElementById("restart-progress").style.width = progress + "%"

    if (progress >= 100) {
      clearInterval(interval)
      notification.remove()
      addLogEntry("INFO", "Server restart completed")
    }
  }, 1000)
}

function simulateBackupProcess() {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-save"></i>
            <span>Creating backup...</span>
        </div>
        <div style="width: 100%; height: 2px; background: rgba(255,255,255,0.3); border-radius: 1px; margin-top: 0.5rem;">
            <div id="backup-progress" style="width: 0%; height: 100%; background: white; border-radius: 1px; transition: width 0.2s;"></div>
        </div>
    `

  document.body.appendChild(notification)
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    document.getElementById("backup-progress").style.width = progress + "%"

    if (progress >= 100) {
      clearInterval(interval)
      notification.querySelector("span").textContent = "Backup completed!"
      setTimeout(() => {
        notification.remove()
      }, 2000)
    }
  }, 200)
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
  if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }
}

async function loadPlayersToTable() {
  totalOnlinePlayers = 0
  try {
    const response = await fetch("http://localhost:8000/api/getTotalPlayers")
    const players = await response.json()
    const tableBody = document.getElementById("player-table-body")
    tableBody.innerHTML = ""

    players.forEach(player => {
      const status = player.status || "offline"
      let statusBadgeClass = ""
      let statusText = ""

      switch (status) {
        case "online":
          statusBadgeClass = "online"
          statusText = "Online"
          totalOnlinePlayers += 1
          break
        case "banned":
          statusBadgeClass = "banned"
          statusText = "Banned"
          break
        case "offline":
        default:
          statusBadgeClass = "offline"
          statusText = "Offline"
          break
      }

      const row = document.createElement("tr")
      row.setAttribute("data-status", status)

      row.innerHTML = `
        <td>${player.name}</td>
        <td>${player.identifier}</td>
        <td>${player.level || 0}</td>
        <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
        <td>Now</td>
        <td>0</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-reward" onclick="showPlayerModal('online', '${player.name}')">Allow</button>
            <button class="btn btn-warn" onclick="showPlayerModal('warn', '${player.name}', '${player.identifier}')">Warn</button>
            <button class="btn btn-kick" onclick="showPlayerModal('kick', '${player.name}', '${player.identifier}')">Kick</button>
            <button class="btn btn-ban" onclick="showPlayerModal('ban', '${player.name}', '${player.identifier}')">Ban</button>
          </div>
        </td>
      `

      tableBody.appendChild(row)
    })

    const totalPlayerElement = document.getElementById("tPlayerCount")
    totalPlayerElement.innerText = totalOnlinePlayers
  } catch (err) {
    console.error("Failed to load players:", err)
  }
}

function loadTotalItemCount() {
  fetch('http://localhost:8000/api/getTotalItems')
  .then(res => res.json())
  .then(data => {
    document.getElementById('pItemCount').innerText = data.total_quantity;
  })
  .catch(err => console.error("Error fetching item count:", err));

}

async function loadTotalVehicleCount() {
  try {
    const response = await fetch("http://localhost:8000/api/total-vehicle-count");
    const data = await response.json();
    const vehicleCountElement = document.getElementById("vehicleStatQuant");
    vehicleCountElement.textContent = data.totalVehicles;
  } catch (err) {
    console.error("Failed to fetch vehicle count:", err);
  }
}

document.addEventListener("click", (e) => {
  const playerModal = document.getElementById("player-modal")
  const broadcastModal = document.getElementById("broadcast-modal")

  if (e.target === playerModal) {
    closePlayerModal()
  }

  if (e.target === broadcastModal) {
    closeBroadcastModal()
  }
})
console.log("ADMIN PANEL Loaded Successfully!")

function checkPlayerAdminStatus() {
  fetch("http://localhost:8000/api/check-admin")
  .then(res => res.json())
  .then(data => {
    if (data.admin) {
      document.getElementById("adminLink").style.display = "block";
    }
  });
}