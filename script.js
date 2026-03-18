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

// ڕەنگی خانەکان بەپێی وەشانی Spribe
const colors = ["#ff0000", "#f44336", "#fb8c00", "#ffb300", "#fdd835", "#4caf50", "#fdd835", "#ffb300", "#fb8c00", "#f44336", "#ff0000"];
const multipliers = [15, 8, 3, 2, 1.2, 0.5, 1.2, 2, 3, 8, 15];

// ١. دروستکردنی بزمارەکان (Pegs)
const rows = 12;
const spacing = w / 12.5;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 60 + i * (h / 19);
        const peg = Bodies.circle(x, y, 3.5, {
            isStatic: true,
            render: { fillStyle: "#ffffff44" },
            restitution: 1.1 // بۆ ئەوەی تۆپەکە بە جوانی هەڵبەزێتەوە
        });
        Composite.add(world, peg);
    }
}

// ٢. دروستکردنی خانەکان (Multipliers)
const sW = w / multipliers.length;
multipliers.forEach((val, i) => {
    const xPos = i * sW + sW / 2;
    const slot = Bodies.rectangle(xPos, h - 45, sW - 4, 35, {
        isStatic: true,
        isSensor: true, // ڕێگە دەدات تۆپەکە بچێتە سەری بەڵام نەیگەیەنێتە خوارەوە
        label: `slot-${val}`,
        render: { fillStyle: colors[i] }
    });
    slot.originalY = h - 45; // پاشکۆ بۆ ئەنیمەیشن
    Composite.add(world, slot);
});

// ٣. نوسینی ژمارەکان لەسەر خانەکان
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    multipliers.forEach((val, i) => {
        ctx.fillText(val + 'x', i * sW + sW / 2, h - 35);
    });
});

let balance = 1000, bet = 10;

// ٤. فڕێدانی تۆپەکە
document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return;
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w / 2 + (Math.random() * 4 - 2), 20, 6, {
        restitution: 0.5,
        friction: 0.01,
        label: 'ball',
        render: { fillStyle: '#ff3d00' }
    });
    Composite.add(world, ball);
});

// ٥. گرنگترین بەش: لۆژیکی نیشتنەوەی تۆپەکە
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('slot-') ? bodyA : (bodyB.label.startsWith('slot-') ? bodyB : null);

        if (ball && slot && !ball.isDone) {
            ball.isDone = true; // بۆ ئەوەی تەنها یەکجار هەژمار بکرێت
            
            const xVal = parseFloat(slot.label.split('-')[1]);
            handleWin(ball, slot, xVal);
        }
    });
});

function handleWin(ball, slot, x) {
    balance += bet * x;

    // --- ئەنیمەیشنی "نیشتنەوە" ---
    // وەستاندنی تۆپەکە لەسەر خانەکە
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setStatic(ball, true); 
    ball.render.opacity = 0.6;

    // داچوونی خانەکە (Bounce Effect)
    const originalY = slot.originalY;
    Body.setPosition(slot, { x: slot.position.x, y: originalY + 10 });
    
    // گەڕانەوەی خانەکە و سڕینەوەی تۆپەکە دوای ١٥٠ میللی چرکە
    setTimeout(() => {
        Body.setPosition(slot, { x: slot.position.x, y: originalY });
        Composite.remove(world, ball);
    }, 150);

    document.getElementById('winNotice').innerText = `WIN: x${x}`;
    updateUI();
}

function updateUI() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; updateUI(); };
