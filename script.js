const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
const world = engine.world;

const gameArea = document.getElementById('game-area');
const width = gameArea.clientWidth || 350;
const height = gameArea.clientHeight || 500;

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

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 1. دروستکردنی بزمارەکان (Pegs)
const rows = 10;
const spacingX = width / 10;
const spacingY = height / 15;

for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        const x = width / 2 + (j - i / 2) * spacingX;
        const y = 60 + i * spacingY;
        const peg = Bodies.circle(x, y, 4, {
            isStatic: true,
            render: { fillStyle: '#ffffff' },
            restitution: 0.8
        });
        Composite.add(world, peg);
    }
}

// 2. دروستکردنی دیوارەکان (بۆ ئەوەی تۆپەکە دەرنەچێت)
const wallOptions = { isStatic: true, render: { visible: false } };
Composite.add(world, [
    Bodies.rectangle(0, height / 2, 10, height, wallOptions),
    Bodies.rectangle(width, height / 2, 10, height, wallOptions)
]);

// 3. دروستکردنی خانەکانی خەڵات (Multipliers)
const multipliers = [5, 2, 1.2, 0.5, 0.2, 0.5, 1.2, 2, 5];
const slotWidth = width / multipliers.length;

multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, height - 25, slotWidth - 4, 40, {
        isStatic: true,
        label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00f2ff22' : '#ff007b22', strokeStyle: '#ffffff22', lineWidth: 1 }
    });
    Composite.add(world, slot);
});

// 4. سیستەمی باڵانس و خەڵات
let balance = 1000;
let bet = 10;

function changeBet(val) {
    if (bet + val >= 10) {
        bet += val;
        document.getElementById('betAmount').innerText = bet;
    }
}

document.getElementById('drop-btn').addEventListener('click', () => {
    if (balance < bet) return alert("باڵانست بەشی ناکات!");
    
    balance -= bet;
    document.getElementById('balance').innerText = Math.floor(balance);

    const ball = Bodies.circle(width / 2 + (Math.random() * 10 - 5), 20, 8, {
        restitution: 0.5,
        friction: 0.01,
        label: 'ball',
        render: { fillStyle: '#00f2ff' }
    });
    Composite.add(world, ball);
});

// 5. دیاریکردنی پێکدادان (Collision Detection)
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : (pair.bodyB.label === 'ball' ? pair.bodyB : null);
        const slot = pair.bodyA.label.startsWith('slot-') ? pair.bodyA : (pair.bodyB.label.startsWith('slot-') ? pair.bodyB : null);

        if (ball && slot) {
            const mult = parseFloat(slot.label.split('-')[1]);
            const win = bet * mult;
            balance += win;
            
            document.getElementById('balance').innerText = Math.floor(balance);
            document.getElementById('lastWin').innerText = "+" + win.toFixed(1);
            
            // سڕینەوەی تۆپەکە دوای بردنەوە
            setTimeout(() => {
                Composite.remove(world, ball);
            }, 100);
        }
    });
});
