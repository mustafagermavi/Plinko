const ui = (() => {
    let balance = 1000;
    let bet = 10;

    const balanceEl = document.getElementById('balance');
    const betEl = document.getElementById('betAmount');
    const dropBtn = document.getElementById('drop-btn');

    const adjustBet = (amount) => {
        if (bet + amount >= 5) {
            bet += amount;
            updateDisplay();
        }
    };

    const updateDisplay = () => {
        balanceEl.innerText = balance.toLocaleString(undefined, { minimumFractionDigits: 2 });
        betEl.innerText = bet;
    };

    const handleWin = (multiplier, ball, slot) => {
        balance += (bet * multiplier);
        updateDisplay();

        // ئەنیمەیشنی سادەی خانەکە
        Matter.Body.setStatic(ball, true);
        setTimeout(() => {
            Matter.Composite.remove(System.engine, ball); // کاتێک تۆپەکە لادەبرێت
        }, 200);
    };

    dropBtn.onclick = () => {
        if (balance >= bet) {
            balance -= bet;
            updateDisplay();
            System.spawnBall("#00ffa3"); // فەرمان بۆ بزوێنەرەکە
        }
    };

    return { adjustBet, handleWin };
})();

// هەناردەکردنی بۆ ئەوەی سیستەم بیبینێت
window.ui = ui;
