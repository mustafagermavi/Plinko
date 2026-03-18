const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
const gameArea = document.getElementById('game-area');

let w = gameArea.clientWidth || 380;
let h = gameArea.clientHeight || 550;

const render = Render.create({
    element: gameArea,
    engine: engine,
    options: {
        width: w, height: h,
        wireframes: false, background: 'transparent',
        pixelRatio: window.devicePixelRatio
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// ڕەنگی خانەکان
const getXColor = (v) => v >= 10 ? '#ef4444' : v >= 2 ? '#f59e0b' : v >= 1 ? '#eab308' : '#475569';

// دروستکردنی بزمارەکان
const rows = 12;
const spacing = w / 12.5;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 60 + i * (h / 19);
        Composite.add(world, Bodies.circle(x, y, 3.5, {
            isStatic: true,
            render: { fillStyle: '#ffffff66' },
            restitution: 0.8
        }));
    }
}

// خانەکانی خەڵات (Multipliers)
const multipliers = [15, 8, 3, 1.2, 0.5, 0.2, 0.5, 1.2, 3, 8, 15];
const sW = w / multipliers.length;

multipliers.forEach((val, i) => {
    const x = i * sW + sW / 2;
    const slot = Bodies.rectangle(x, h - 45, sW - 5, 40, {
        isStatic: true,
        isSensor: true,
        label: `x-${val}`,
        render: { fillStyle: getXColor(val), strokeStyle: '#ffffff22', lineWidth: 1 }
    });
    slot.originalY = h - 45; // پاشکۆ بۆ ئەنیمەیشن
    Composite.add(world, slot);
});

// نووسینی X لەسەر خانەکان
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    multipliers.forEach((val, i) => {
        ctx.fillText(val + 'x', i * sW + sW / 2, h - 35);
    });
});

let balance = 1000, bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return alert("باڵانست بەشی ناکات!");
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w/2 + (Math.random()*8-4), 20, 7, {
        restitution: 0.6, friction: 0.01, label: 'ball',
        render: { fillStyle: '#00f2ff', shadowBlur: 10, shadowColor: '#00f2ff' }
    });
    Composite.add(world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'ball' && bodyB.label.startsWith('x-')) handleWin(bodyA, bodyB);
        else if (bodyB.label === 'ball' && bodyA.label.startsWith('x-')) handleWin(bodyB, bodyA);
    });
});

function handleWin(ball, slot) {
    const x = parseFloat(slot.label.split('-')[1]);
    const win = bet * x;
    balance += win;

    // --- ئەنیمەیشنی "Bounce"ی خانەکە ---
    const originalColor = getXColor(x);
    slot.render.fillStyle = '#ffffff';
    Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 8 });

    setTimeout(() => {
        slot.render.fillStyle = originalColor;
        Body.setPosition(slot, { x: slot.position.x, y: slot.originalY });
    }, 120);

    // نوێکردنەوەی UI
    const notice = document.getElementById('winNotice');
    notice.innerText = `X${x} (+$${win.toFixed(2)})`;
    notice.style.color = x >= 1 ? '#00f2ff' : '#ff4444';
    notice.style.transform = "scale(1.15)";
    setTimeout(() => notice.style.transform = "scale(1)", 200);

    updateUI();
    Composite.remove(world, ball);
}

function updateUI() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
