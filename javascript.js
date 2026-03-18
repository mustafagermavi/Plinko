const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

// ڕێکخستنی سەرەتایی
let balance = 1000;
let bet = 10;
const engine = Engine.create();
const world = engine.world;

const gameArea = document.getElementById('game-area');
const width = gameArea.clientWidth;
const height = gameArea.clientHeight;

const render = Render.create({
    element: gameArea,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent'
    }
});

// دروستکردنی بزمارەکان بە ستایلی Neon
const rows = 12;
const spacing = width / 14;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = width / 2 + (j - i / 2) * spacing;
        const y = 80 + i * (height / 18);
        const peg = Bodies.circle(x, y, 3, {
            isStatic: true,
            render: { fillStyle: '#ffffff' }
        });
        Composite.add(world, peg);
    }
}

// مولتیپلایەرەکان (Multipliers)
const multipliers = [5, 2, 1.2, 0.5, 0.2, 0.5, 1.2, 2, 5];
const slotWidth = width / multipliers.length;

multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const sensor = Bodies.rectangle(x, height - 20, slotWidth - 5, 40, {
        isStatic: true,
        isSensor: true,
        label: `slot-${val}`,
        render: { fillStyle: val > 1 ? '#ff007b' : '#333' }
    });
    Composite.add(world, sensor);
});

// لۆژیکی پێکدادان و خەڵات
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        if (pair.bodyA.label.startsWith('slot-')) {
            const mult = parseFloat(pair.bodyA.label.split('-')[1]);
            calculateWin(mult);
            Composite.remove(world, pair.bodyB);
        }
    });
});

function calculateWin(mult) {
    const win = bet * mult;
    balance += win;
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('lastWin').innerText = "+" + win.toFixed(1);
    document.getElementById('lastWin').style.color = mult >= 1 ? '#00f2ff' : '#ff007b';
}

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return alert("پارەکەت بەشی ناکات!");
    
    balance -= bet;
    document.getElementById('balance').innerText = Math.floor(balance);

    const ball = Bodies.circle(width / 2 + (Math.random() * 4 - 2), 20, 7, {
        restitution: 0.5,
        friction: 0.05,
        render: { 
            fillStyle: '#00f2ff',
            sprite: { strokeStyle: '#00f2ff', lineWidth: 2 }
        }
    });
    Composite.add(world, ball);
});

function changeBet(val) {
    bet = Math.max(10, bet + val);
    document.getElementById('betAmount').innerText = bet;
}

Render.run(render);
Runner.run(Runner.create(), engine);
