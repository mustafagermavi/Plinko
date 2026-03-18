const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
const gameArea = document.getElementById('game-area');

let w = gameArea.clientWidth || 360;
let h = gameArea.clientHeight || 500;

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
            render: { fillStyle: '#ffffff44' },
            restitution: 0.8
        }));
    }
}

// خانەکانی خەڵات (Multipliers)
const multipliers = [15, 8, 3, 1.2, 0.5, 0.2, 0.5, 1.2, 3, 8, 15];
const sW = w / multipliers.length;

multipliers.forEach((val, i) => {
    const x = i * sW + sW / 2;
    const slot = Bodies.rectangle(x, h - 40, sW - 5, 35, {
        isStatic: true,
        isSensor: true,
        label: `x-${val}`,
        render: { fillStyle: getXColor(val) }
    });
    slot.originalY = h - 40; // پاشکۆ بۆ ئەنیمەیشن
    Composite.add(world, slot);
});

// نووسینی ژمارەکان لەسەر خانەکان
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    multipliers.forEach((val, i) => {
        ctx.fillText(val + 'x', i * sW + sW / 2, h - 32);
    });
});

let balance = 1000, bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return alert("باڵانست نییە!");
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w/2 + (Math.random()*6-3), 20, 7, {
        restitution: 0.5, friction: 0.01, label: 'ball',
        render: { fillStyle: '#00f2ff' }
    });
    Composite.add(world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('x-') ? bodyA : (bodyB.label.startsWith('x-') ? bodyB : null);

        if (ball && slot && !ball.used) {
            ball.used = true;
            handleWin(ball, slot);
        }
    });
});

function handleWin(ball, slot) {
    const x = parseFloat(slot.label.split('-')[1]);
    const win = bet * x;
    balance += win;

    // --- ئەنیمەیشنی "Bounce" و سپی بوونی خانەکە ---
    const originalColor = getXColor(x);
    slot.render.fillStyle = '#ffffff';
    Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 10 });

    setTimeout(() => {
        slot.render.fillStyle = originalColor;
        Body.setPosition(slot, { x: slot.position.x, y: slot.originalY });
        Composite.remove(world, ball);
    }, 120);

    const notice = document.getElementById('winNotice');
    notice.innerText = `X${x} (+$${win.toFixed(2)})`;
    notice.style.color = x >= 1 ? '#00f2ff' : '#ff4444';
    notice.style.transform = "scale(1.2)";
    setTimeout(() => notice.style.transform = "scale(1)", 200);

    updateUI();
}

function updateUI() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
