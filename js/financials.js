
document.addEventListener("DOMContentLoaded", () => {
    const transactionFilters = document.querySelectorAll(".transaction-filters .filter-btn")
    const balanceCards = document.querySelectorAll(".balance-card")
  
  
    transactionFilters.forEach((filter) => {
      filter.addEventListener("click", function () {
        transactionFilters.forEach((f) => f.classList.remove("active"))
        this.classList.add("active")
        const filterValue = this.getAttribute("data-filter")
        filterTransactions(filterValue)
      })
    })
  
 
    balanceCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  
  
    const investmentCards = document.querySelectorAll(".investment-card")
    investmentCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = "none"
      })
    })
  
    setInterval(animateBalanceChanges, 60000) 
  })
  
  function filterTransactions(filter) {
    const transactionItems = document.querySelectorAll(".transaction-item")
  
    transactionItems.forEach((item) => {
      const type = item.getAttribute("data-type")
  
      if (filter === "all" || type === filter) {
        item.style.display = "flex"
        item.style.animation = "fadeIn 0.3s ease"
      } else {
        item.style.display = "none"
      }
    })
  }
  
  function showModal(type) {
    const modal = document.getElementById("financial-modal")
    const modalTitle = document.getElementById("modal-title")
    const recipientGroup = document.getElementById("recipient-group")
    const confirmBtn = document.getElementById("confirm-btn")
  
   
    document.getElementById("financial-form").reset()
  
    switch (type) {
      case "withdraw":
        modalTitle.textContent = "Withdraw Money"
        recipientGroup.style.display = "none"
        confirmBtn.textContent = "Withdraw"
        confirmBtn.className = "btn btn-withdraw"
        break
      case "deposit":
        modalTitle.textContent = "Deposit Money"
        recipientGroup.style.display = "none"
        confirmBtn.textContent = "Deposit"
        confirmBtn.className = "btn btn-deposit"
        break
      case "transfer":
        modalTitle.textContent = "Send Money"
        recipientGroup.style.display = "block"
        confirmBtn.textContent = "Send"
        confirmBtn.className = "btn btn-send"
        break
      case "invest":
        modalTitle.textContent = "Make Investment"
        recipientGroup.style.display = "none"
        confirmBtn.textContent = "Invest"
        confirmBtn.className = "btn btn-invest"
        break
    }
  
    modal.classList.add("show")
  
   
    const form = document.getElementById("financial-form")
    form.onsubmit = (e) => {
      e.preventDefault()
      handleFinancialAction(type)
    }
  }
  
  function closeModal() {
    const modal = document.getElementById("financial-modal")
    modal.classList.remove("show")
  }
  
  function handleFinancialAction(type) {
    const amount = document.getElementById("amount").value
    const recipient = document.getElementById("recipient").value
    const description = document.getElementById("description").value
  
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }
  
    if (type === "transfer" && !recipient) {
      alert("Please enter a recipient")
      return
    }
  
  
    const transactionData = {
      type: type,
      amount: Number.parseFloat(amount),
      recipient: recipient,
      description: description || getDefaultDescription(type),
      timestamp: new Date(),
    }
  

    processTransaction(transactionData)
  
   
    closeModal()
  
    createNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Successful`, `$${amount}`)
  
    
    updateBalances(type, Number.parseFloat(amount))
  }
  
  function getDefaultDescription(type) {
    const descriptions = {
      withdraw: "ATM withdrawal",
      deposit: "Cash deposit",
      transfer: "Money transfer",
      invest: "Investment transaction",
    }
    return descriptions[type] || "Financial transaction"
  }
  
  function processTransaction(data) {

    const transactionList = document.querySelector(".transaction-list")
    const transactionHTML = createTransactionHTML(data)
    transactionList.insertAdjacentHTML("afterbegin", transactionHTML)
  
  
    const transactions = transactionList.querySelectorAll(".transaction-item")
    if (transactions.length > 10) {
      transactions[transactions.length - 1].remove()
    }
  }
  
  function createTransactionHTML(data) {
    const isPositive = data.type === "deposit" || data.type === "invest"
    const iconClass = getTransactionIcon(data.type)
    const amountClass = isPositive ? "positive" : "negative"
    const amountPrefix = isPositive ? "+" : "-"
  
    return `
          <div class="transaction-item" data-type="${data.type}">
              <div class="transaction-icon ${data.type}">
                  <i class="${iconClass}"></i>
              </div>
              <div class="transaction-info">
                  <div class="transaction-type">${data.description}</div>
                  <div class="transaction-description">${data.recipient || "Personal account"}</div>
                  <div class="transaction-time">Just now</div>
              </div>
              <div class="transaction-amount ${amountClass}">${amountPrefix}$${data.amount.toLocaleString()}</div>
          </div>
      `
  }
  
  function getTransactionIcon(type) {
    const icons = {
      withdraw: "fas fa-minus-circle",
      deposit: "fas fa-plus-circle",
      transfer: "fas fa-paper-plane",
      invest: "fas fa-chart-line",
    }
    return icons[type] || "fas fa-dollar-sign"
  }
  
  function updateBalances(type, amount) {
    const cashAmount = document.querySelector(".cash-color")
    const bankAmount = document.querySelector(".bank-color")
  
    if (!cashAmount || !bankAmount) return
  
    let currentCash = Number.parseFloat(cashAmount.textContent.replace(/[$,]/g, ""))
    let currentBank = Number.parseFloat(bankAmount.textContent.replace(/[$,]/g, ""))
  
    switch (type) {
      case "withdraw":
        currentBank -= amount
        currentCash += amount
        break
      case "deposit":
        currentCash -= amount
        currentBank += amount
        break
      case "transfer":
        currentBank -= amount
        break
      case "invest":
        currentBank -= amount
        break
    }
  

    animateBalanceUpdate(cashAmount, currentCash)
    animateBalanceUpdate(bankAmount, currentBank)
  
    updateTotalWorth()
  }
  
  function animateBalanceUpdate(element, newValue) {
    element.style.transform = "scale(1.1)"
    element.style.color = "#10b981"
  
    setTimeout(() => {
      element.textContent = `$${newValue.toLocaleString()}`
      element.style.transform = "scale(1)"
      setTimeout(() => {
        element.style.color = ""
      }, 200)
    }, 200)
  }
  
  function updateTotalWorth() {
    const totalElement = document.querySelector(".total-color")
    if (!totalElement) return
  
    const cashAmount = Number.parseFloat(document.querySelector(".cash-color").textContent.replace(/[$,]/g, ""))
    const bankAmount = Number.parseFloat(document.querySelector(".bank-color").textContent.replace(/[$,]/g, ""))
    const cryptoValue = 28500 
  
    const totalWorth = cashAmount + bankAmount + cryptoValue
    animateBalanceUpdate(totalElement, totalWorth)
  }
  
  function animateBalanceChanges() {
    const balanceAmounts = document.querySelectorAll(".balance-amount")
    balanceAmounts.forEach((amount) => {
      
      const currentValue = Number.parseFloat(amount.textContent.replace(/[$₿,]/g, ""))
      const change = (Math.random() - 0.5) * 100 
      const newValue = Math.max(0, currentValue + change)
  
      if (amount.textContent.includes("₿")) {
        amount.textContent = `₿${newValue.toFixed(2)}`
      } else {
        amount.textContent = `$${Math.round(newValue).toLocaleString()}`
      }
  
     
      amount.style.transform = "scale(1.05)"
      setTimeout(() => {
        amount.style.transform = "scale(1)"
      }, 300)
    })
  }
  
  function createNotification(action, amount) {
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
  
    notification.textContent = `✓ ${action}: ${amount}`
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
  

  document.addEventListener("click", (e) => {
    const modal = document.getElementById("financial-modal")
    if (e.target === modal) {
      closeModal()
    }
  })
  