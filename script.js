const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 1.2; // کەمێک کێشکردن زیاد کراوە بۆ خێرایی

const gameArea = document.getElementById('game-area');
let w = gameArea.clientWidth;
let h = gameArea.clientHeight;

const render = Render.create({
    element: gameArea,
    engine: engine,
    options: { width: w, height: h, wireframes: false, background: 'transparent' }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// ڕەنگی خانەکان
const colors = ["#ff0000", "#fb923c", "#facc15", "#a3e635", "#4ade80", "#22c55e", "#4ade80", "#a3e635", "#facc15", "#fb923c", "#ff0000"];
const multipliers = [15, 8, 3, 2, 1.2, 0.5, 1.2, 2, 3, 8, 15];

// دروستکردنی بزمارەکان
const rows = 12;
const spacing = w / 12.5;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 60 + i * (h / 19);
        Composite.add(engine.world, Bodies.circle(x, y, 3.5, {
            isStatic: true,
            restitution: 1.0, // گرنگە بۆ هەڵبەزینەوە
            friction: 0.05,
            render: { fillStyle: "#ffffff33" }
        }));
    }
}

// دروستکردنی خانەکان
const sW = w / multipliers.length;
multipliers.forEach((val, i) => {
    const slot = Bodies.rectangle(i * sW + sW / 2, h - 35, sW - 4, 30, {
        isStatic: true, isSensor: true, label: `x-${val}`,
        render: { fillStyle: colors[i] }
    });
    slot.originalY = h - 35;
    Composite.add(engine.world, slot);
});

// نوسینی X
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Roboto'; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    multipliers.forEach((val, i) => ctx.fillText(val + 'x', i * sW + sW / 2, h - 30));
});

let balance = 1000, bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return;
    balance -= bet; updateUI();

    // ١. هەڕەمەکی لە کاتی فڕێدان (Random Start Position)
    const randomStart = (Math.random() * 10) - 5; 
    const ball = Bodies.circle(w / 2 + randomStart, 20, 6, {
        restitution: 0.5,
        friction: 0.01,
        frictionAir: 0.02, // کەمێک بەرگری هەوا بۆ هەڕەمەکی بوون
        label: 'ball',
        render: { fillStyle: '#ef4444' }
    });

    // ٢. لادانی سەرەتایی (Initial Random Force)
    Body.applyForce(ball, ball.position, { 
        x: (Math.random() * 0.002) - 0.001, 
        y: 0 
    });

    Composite.add(engine.world, ball);
});

// ٣. هەڕەمەکی لە کاتی بەرکەوتن بە بزمارەکان
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        
        // ئەگەر تۆپ بەر بزمار کەوت، کەمێک لادانی بدەرێ
        if (bodyA.label === 'ball' && !bodyB.label) {
            const force = (Math.random() * 0.001) - 0.0005;
            Body.applyForce(bodyA, bodyA.position, { x: force, y: 0 });
        }

        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('x-') ? bodyA : (bodyB.label.startsWith('x-') ? bodyB : null);

        if (ball && slot && !ball.used) {
            ball.used = true;
            const x = parseFloat(slot.label.split('-')[1]);
            handleWin(ball, slot, x);
        }
    });
});

function handleWin(ball, slot, x) {
    balance += bet * x;
    updateUI();
    
    // ئەنیمەیشنی نیشتنەوە
    Body.setStatic(ball, true);
    Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 8 });
    
    setTimeout(() => {
        Body.setPosition(slot, { x: slot.position.x, y: slot.originalY });
        Composite.remove(engine.world, ball);
    }, 150);
}

function updateUI() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
