const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
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

// ڕەنگی خانەکان بەپێی Spribe (لە ناوەڕاستەوە بۆ لایەکان دەگۆڕێت)
const colors = ["#ff0000", "#ff4500", "#ffa500", "#ffff00", "#adff2f", "#22c55e", "#adff2f", "#ffff00", "#ffa500", "#ff4500", "#ff0000"];
const multipliers = [15, 8, 3, 1.5, 1.1, 0.5, 1.1, 1.5, 3, 8, 15];

// دروستکردنی بزمارەکان
const rows = 12;
const spacing = w / 12.5;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 50 + i * (h / 18);
        Composite.add(world, Bodies.circle(x, y, 4, {
            isStatic: true,
            render: { fillStyle: "#8b949e" },
            restitution: 1.2 // وا دەکات تۆپەکە باشتر هەڵبەزێتەوە
        }));
    }
}

// دروستکردنی خانەکان
const sW = w / multipliers.length;
multipliers.forEach((val, i) => {
    const slot = Bodies.rectangle(i * sW + sW / 2, h - 35, sW - 4, 35, {
        isStatic: true, isSensor: true, label: `x-${val}`,
        render: { fillStyle: colors[i] }
    });
    slot.originalY = h - 35;
    Composite.add(world, slot);
});

// نووسینی X لەسەر خانەکان
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Roboto';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    multipliers.forEach((val, i) => {
        ctx.fillText(val + 'x', i * sW + sW / 2, h - 30);
    });
});

let balance = 1000, bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return;
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w / 2 + (Math.random() * 4 - 2), 15, 6, {
        restitution: 0.5, friction: 0.001, label: 'ball',
        render: { fillStyle: '#ff0000' }
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
            const x = parseFloat(slot.label.split('-')[1]);
            balance += bet * x;
            
            // ئەنیمەیشنی Bounce
            Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 8 });
            setTimeout(() => Body.setPosition(slot, { x: slot.position.x, y: slot.originalY }), 100);
            
            document.getElementById('winNotice').innerText = `WIN: x${x}`;
            updateUI();
            Composite.remove(world, ball);
        }
    });
});

function updateUI() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
