const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

const engine = Engine.create();
const world = engine.world;
const gameArea = document.getElementById('game-area');

// وەرگرتنی قەبارەی ڕاستەقینەی شاشەی مۆبایلەکە
let w = gameArea.clientWidth;
let h = gameArea.clientHeight;

const render = Render.create({
    element: gameArea,
    engine: engine,
    options: {
        width: w,
        height: h,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio // بۆ ئەوەی لە شاشەی بەهێز لێڵ نەبێت
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// دروستکردنی بزمارەکان بەپێی شاشەکە
function createGrid() {
    const rows = 10;
    const spacing = w / 11;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= i; j++) {
            const x = w / 2 + (j - i / 2) * spacing;
            const y = 50 + i * (h / 16);
            const peg = Bodies.circle(x, y, 3, {
                isStatic: true,
                render: { fillStyle: '#ffffff88' }
            });
            Composite.add(world, peg);
        }
    }
}

// خانەکانی خەڵات لە خوارەوە
const mults = [10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10];
const sW = w / mults.length;
mults.forEach((m, i) => {
    const slot = Bodies.rectangle(i * sW + sW / 2, h - 20, sW - 4, 40, {
        isStatic: true,
        label: `s-${m}`,
        render: { fillStyle: '#111', strokeStyle: '#333', lineWidth: 1 }
    });
    Composite.add(world, slot);
});

// لۆژیکی یاریکردن
let balance = 1000;
let bet = 10;

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return;
    balance -= bet;
    updateUI();

    const ball = Bodies.circle(w / 2 + (Math.random() * 10 - 5), 10, 7, {
        restitution: 0.6,
        friction: 0.01,
        label: 'ball',
        render: { fillStyle: '#00f2ff' }
    });
    Composite.add(world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const a = pair.bodyA;
        const b = pair.bodyB;
        if (a.label === 'ball' && b.label.startsWith('s-')) handleWin(a, b.label);
        else if (b.label === 'ball' && a.label.startsWith('s-')) handleWin(b, a.label);
    });
});

function handleWin(ball, label) {
    const m = parseFloat(label.split('-')[1]);
    const win = bet * m;
    balance += win;
    document.getElementById('lastWin').innerText = `+${win}`;
    updateUI();
    Composite.remove(world, ball);
}

function updateUI() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('betAmount').innerText = bet;
}

function changeBet(v) {
    if (bet + v >= 10) bet += v;
    updateUI();
}

createGrid();
