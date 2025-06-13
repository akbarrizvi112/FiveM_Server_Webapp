
document.addEventListener("DOMContentLoaded", () => {
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

    updateStats();
    checkPlayerAdminStatus()
  
    setInterval(updateStats, 60000)
})
  
function updateStats() {
  fetch("http://127.0.0.1:8000/api/player")
    .then((response) => response.json())
    .then((data) => {
      if (!data.error) {
        document.querySelector(".player-name").textContent = data.name;
        document.querySelector(".identifier").textContent = "Identifier: " + data.identifier;
        document.querySelector(".level-badge").textContent = "Level " + data.level;
        document.querySelector(".xp-text").textContent = `XP: ${data.xp} / ${data.xp_max}`;

        const healthBar = document.querySelector(".progress-fill.health");
        const armorBar = document.querySelector(".progress-fill.armor");
        const staminaBar = document.querySelector(".progress-fill.stamina");

        const healthValue = document.querySelectorAll(".stat-card .stat-value")[0];
        const armorValue = document.querySelectorAll(".stat-card .stat-value")[1];
        const staminaValue = document.querySelectorAll(".stat-card .stat-value")[2];

        healthBar.style.width = data.health + "%";
        healthValue.textContent = data.health + "%";

        armorBar.style.width = data.armor + "%";
        armorValue.textContent = data.armor + "%";

        staminaBar.style.width = data.stamina + "%";
        staminaValue.textContent = data.stamina + "%";

        // ACTIVITY LIST UPDATE
        const activityList = document.getElementById("activity-items");
        const noActivityText = document.getElementById("no-activity");
              
        activityList.innerHTML = ""; // Clear old list
              
        if (data.recent_activity && data.recent_activity.length > 0) {
          noActivityText.style.display = "none";
          data.recent_activity.forEach((activity) => {
            const iconClass =
              activity.type === "mission"
                ? "fa-eye"
                : activity.type === "purchase"
                ? "fa-dollar-sign"
                : activity.type === "login"
                ? "fa-key"
                : "fa-circle";
          
            const item = document.createElement("div");
            item.className = "activity-item";
            item.innerHTML = `
              <div class="activity-icon ${activity.type}-icon">
                <i class="fas ${iconClass.split(" ")[0]}"></i>
              </div>
              <div class="activity-details">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${new Date(activity.time).toLocaleString()}</div>
              </div>
            `;
            activityList.appendChild(item);
          });
        } else {
          noActivityText.style.display = "block";
        }
      }
    });
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