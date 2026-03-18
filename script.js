const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

const engine = Engine.create();
const world = engine.world;
const gameArea = document.getElementById('game-area');

// قەبارەی داینامیکی بەپێی شاشە
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

// ڕەنگی خانەکان بەپێی خەڵاتەکە
function getXColor(val) {
    if (val >= 10) return '#ef4444'; // سوور
    if (val >= 2) return '#f59e0b';  // پرتەقاڵی
    if (val >= 1) return '#eab308';  // زەرد
    return '#475569';                // تۆخ
}

// دروستکردنی بزمارەکان (Pegs)
const rows = 12;
const spacing = w / 12;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = w / 2 + (j - i / 2) * spacing;
        const y = 50 + i * (h / 18);
        const peg = Bodies.circle(x, y, 3, {
            isStatic: true,
            render: { fillStyle: '#ffffff88' }
        });
        Composite.add(world, peg);
    }
}

// خانەکانی خەڵات (Multipliers)
const multipliers = [15, 8, 3, 1.5, 0.5, 0.2, 0.5, 1.5, 3, 8, 15];
const sW = w / multipliers.length;

multipliers.forEach((val, i) => {
    const x = i * sW + sW / 2;
    const slot = Bodies.rectangle(x, h - 35, sW - 4, 35, {
        isStatic: true,
        label: `x-${val}`,
        render: { fillStyle: getXColor(val) }
    });
    Composite.add(world, slot);
});

// نووسینی ژمارەی X لەسەر خانەکان
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 10px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    multipliers.forEach((val, i) => {
        ctx.fillText(val + 'x', i * sW + sW / 2, h - 30);
    });
});

// سیستەمی باڵانس
let balance = 1000;
let bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return;
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w/2 + (Math.random()*6-3), 15, 7, {
        restitution: 0.5, friction: 0.01, label: 'ball',
        render: { fillStyle: '#00f2ff' }
    });
    Composite.add(world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const a = pair.bodyA; const b = pair.bodyB;
        if (a.label === 'ball' && b.label.startsWith('x-')) handleWin(a, b.label);
        else if (b.label === 'ball' && a.label.startsWith('x-')) handleWin(b, a.label);
    });
});

function handleWin(ball, label) {
    const x = parseFloat(label.split('-')[1]);
    const win = bet * x;
    balance += win;
    
    const notice = document.getElementById('winNotice');
    notice.innerText = x >= 1 ? `WIN: ${x}x` : `LOSS: ${x}x`;
    notice.style.color = x >= 1 ? '#00f2ff' : '#ff4444';
    
    updateUI();
    Composite.remove(world, ball);
}

function updateUI() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('betAmount').innerText = bet;
}

function changeBet(v) {
    if (bet + v >= 5) bet += v;
    updateUI();
}
