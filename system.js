const System = (() => {
    const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
    const engine = Engine.create();
    engine.world.gravity.y = 1.7;

    let w, h;

    const init = (containerId) => {
        const container = document.getElementById(containerId);
        w = container.clientWidth;
        h = container.clientHeight;

        const render = Render.create({
            element: container,
            engine: engine,
            options: { width: w, height: h, wireframes: false, background: 'transparent' }
        });

        Render.run(render);
        Runner.run(Runner.create(), engine);
        createWorld();
        setupCollisions();
    };

    const createWorld = () => {
        // بزمارەکان
        for (let i = 0; i < 14; i++) {
            for (let j = 0; j <= i; j++) {
                Composite.add(engine.world, Bodies.circle(w/2 + (j - i/2) * (w/15), 60 + i*(h/23), 3.5, {
                    isStatic: true, render: { fillStyle: "#334155" }
                }));
            }
        }
        // خانەکان (Slots)
        const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
        const colors = ["#ff0055", "#ff5500", "#ffaa00", "#ccff00", "#00ffa3", "#00ffa3", "#ccff00", "#ffaa00", "#ff5500", "#ff0055"];
        const sW = w / multipliers.length;
        
        multipliers.forEach((val, i) => {
            const slot = Bodies.rectangle(i * sW + sW / 2, h - 45, sW - 8, 40, {
                isStatic: true, isSensor: true, label: `x-${val}`,
                render: { fillStyle: colors[i] }
            });
            slot.originalY = h - 45;
            Composite.add(engine.world, slot);
        });
    };

    const spawnBall = (color) => {
        const ball = Bodies.circle(w/2 + (Math.random()*4-2), 20, 8, {
            restitution: 0.5, frictionAir: 0.04, label: 'ball',
            render: { fillStyle: color, shadowBlur: 20, shadowColor: color }
        });
        Composite.add(engine.world, ball);
    };

    const setupCollisions = () => {
        Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const ball = pair.bodyA.label === 'ball' ? pair.bodyA : (pair.bodyB.label === 'ball' ? pair.bodyB : null);
                const slot = pair.bodyA.label?.startsWith('x-') ? pair.bodyA : (pair.bodyB.label?.startsWith('x-') ? pair.bodyB : null);
                if (ball && slot && !ball.used) {
                    ball.used = true;
                    const multiplier = parseFloat(slot.label.split('-')[1]);
                    // فەرمان ناردن بۆ UI
                    window.ui.handleWin(multiplier, ball, slot);
                }
            });
        });
    };

    return { init, spawnBall };
})();

// دەسپێکردنی سیستەم کاتێک شاشە بار دەبێت
window.onload = () => System.init('game-canvas-area');
