const ui = {
    balance: 1000,
    bet: 10,

    init() {
        document.getElementById('drop-btn').onclick = () => this.play();
        this.updateDisplay();
    },

    adjustBet(val) {
        if (this.bet + val >= 5) {
            this.bet += val;
            this.updateDisplay();
        }
    },

    play() {
        if (this.balance >= this.bet) {
            this.balance -= this.bet;
            this.updateDisplay();
            System.spawnBall();
        }
    },

    handleWin(multiplier) {
        this.balance += (this.bet * multiplier);
        this.updateDisplay();
    },

    updateDisplay() {
        document.getElementById('balance').innerText = this.balance.toLocaleString(undefined, { minimumFractionDigits: 2 });
        document.getElementById('betAmount').innerText = this.bet;
    }
};

// ڕێکخستنی کۆتایی
window.onload = () => {
    System.init();
    ui.init();
    window.ui = ui; // بۆ ئەوەی دوگمەکانی HTML بیبینن
};
