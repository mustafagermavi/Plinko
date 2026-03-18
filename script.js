const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 1.6; 

const gameArea = document.getElementById('game-area');
let w = gameArea.clientWidth;
let h = gameArea.clientHeight;

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

// ڕەنگەکان و نرخەکان (بە شێوازی قورس)
const multipliers = [10, 5, 2, 1.1, 0.4, 0.4, 1.1, 2, 5, 10];
const colors = ["#ff0000", "#f97316", "#fbce07", "#a3e635", "#22c55e", "#22c55e", "#a3e635", "#fbce07", "#f97316", "#ff0000"];

// دروستکردنی بزمارەکان (Pegs) - ١٤ ڕیز
const rows = 14;
const spacing = w / 15;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 50 + i * (h / 22);
        Composite.add(engine.world, Bodies.circle(x, y, 3, {
            isStatic: true,
            restitution: 0.6,
            render: { fillStyle: "#ffffff33" }
        }));
    }
}

// دروستکردنی خانەکان
const sW = w / multipliers.length;
multipliers.forEach((val, i) => {
    const slot = Bodies.rectangle(i * sW + sW / 2, h - 40, sW - 4, 35, {
        isStatic: true, isSensor: true, label: `x-${val}`,
        render: { fillStyle: colors[i] }
    });
    slot.originalY = h - 40;
    Composite.add(engine.world, slot);
});

// نووسینی X
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Roboto'; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    multipliers.forEach((val, i) => ctx.fillText(val + 'x', i * sW + sW / 2, h - 35));
});

let balance = 1000, bet = 10;

// فڕێدانی تۆپ
document.getElementById('drop-btn').addEventListener('click', (e) => {
    e.preventDefault(); // ڕێگری لە هەر کاردانەوەیەکی تری وێبگەڕ
    if (balance < bet) return;
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w / 2 + (Math.random() * 2 - 1), 10, 6, {
        restitution: 0.4, friction: 0.02, frictionAir: 0.04,
        label: 'ball', render: { fillStyle: '#ff3d00' }
    });
    Composite.add(engine.world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('x-') ? bodyA : (bodyB.label.startsWith('x-') ? bodyB : null);

        if (ball && slot && !ball.used) {
            ball.used = true;
            handleWin(ball, slot, parseFloat(slot.label.split('-')[1]));
        }
    });
});

function handleWin(ball, slot, x) {
    balance += bet * x;
    Body.setStatic(ball, true);
    Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 10 });
    setTimeout(() => {
        Body.setPosition(slot, { x: slot.position.x, y: slot.originalY });
        Composite.remove(engine.world, ball);
    }, 150);
    updateUI();
}

function updateUI() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
