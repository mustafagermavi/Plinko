const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 1.6;

const gameArea = document.getElementById('game-area');
const w = gameArea.clientWidth;
const h = gameArea.clientHeight;

const render = Render.create({
    element: gameArea,
    engine: engine,
    options: { width: w, height: h, wireframes: false, background: 'transparent' }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const multipliers = [15, 8, 3, 1.2, 0.4, 0.4, 1.2, 3, 8, 15];
const colors = ["#ff0000", "#f97316", "#fbce07", "#a3e635", "#22c55e", "#22c55e", "#a3e635", "#fbce07", "#f97316", "#ff0000"];

const rows = 14;
const spacing = w / 15;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
        Composite.add(engine.world, Bodies.circle(w/2 + (j - i/2) * spacing, 50 + i * (h/23), 3.2, {
            isStatic: true, restitution: 0.5, render: { fillStyle: "#334155" }
        }));
    }
}

const sW = w / multipliers.length;
multipliers.forEach((val, i) => {
    const slot = Bodies.rectangle(i * sW + sW / 2, h - 40, sW - 4, 35, {
        isStatic: true, isSensor: true, label: `x-${val}`, render: { fillStyle: colors[i] }
    });
    slot.originalY = h - 40;
    Composite.add(engine.world, slot);
});

Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    multipliers.forEach((val, i) => ctx.fillText(val + 'x', i * sW + sW / 2, h - 35));
});

let balance = 1000, bet = 10;

document.getElementById('drop-btn').addEventListener('click', (e) => {
    if (balance < bet) return;
    balance -= bet;
    animateBalance();

    const ball = Bodies.circle(w/2 + (Math.random()*4-2), 15, 6, {
        restitution: 0.4, friction: 0.02, frictionAir: 0.035, label: 'ball',
        render: { fillStyle: "#22c55e" }
    });
    Composite.add(engine.world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : (pair.bodyB.label === 'ball' ? pair.bodyB : null);
        const slot = pair.bodyA.label?.startsWith('x-') ? pair.bodyA : (pair.bodyB.label?.startsWith('x-') ? pair.bodyB : null);
        if (ball && slot && !ball.used) {
            ball.used = true;
            const x = parseFloat(slot.label.split('-')[1]);
            balance += bet * x;
            animateBalance();
            Body.setStatic(ball, true);
            Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 10 });
            setTimeout(() => { Body.setPosition(slot, { x: slot.position.x, y: slot.originalY }); Composite.remove(engine.world, ball); }, 150);
            document.getElementById('winNotice').innerText = `WIN: x${x}`;
        }
    });
});

function animateBalance() {
    const el = document.getElementById('balance');
    let curr = parseFloat(el.innerText);
    const step = (balance - curr) / 10;
    if (Math.abs(step) > 0.01) {
        el.innerText = (curr + step).toFixed(2);
        requestAnimationFrame(animateBalance);
    } else { el.innerText = balance.toFixed(2); }
    document.getElementById('betAmount').innerText = bet;
}

window.changeBet = (v) => { if (bet + v >= 5) bet += v; document.getElementById('betAmount').innerText = bet; };
