let currentBalance = 1000;
let currentBet = 10;

const dropBtn = document.getElementById('main-drop-btn');
const balanceEl = document.getElementById('balance-display');

dropBtn.addEventListener('click', () => {
    if (currentBalance >= currentBet) {
        currentBalance -= currentBet;
        updateUI();
        
        // لێرەدا تەنها فەرمان بۆ System دەنێرین کە تۆپێک دروست بکات
        createNewBall(); 
    }
});

function updateUI() {
    balanceEl.innerText = currentBalance.toLocaleString();
}
