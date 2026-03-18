const System = {
    engine: Matter.Engine.create(),
    render: null,
    w: 0,
    h: 0,

    init() {
        const container = document.getElementById('game-canvas-area');
        this.w = container.clientWidth;
        this.h = container.clientHeight;

        // ئەگەر پێشتر ڕێندەر هەبوو، لایبەرە
        if (this.render) {
            Matter.Render.stop(this.render);
            Matter.Composite.clear(this.engine.world, false);
        }

        this.render = Matter.Render.create({
            element: container,
            engine: this.engine,
            options: {
                width: this.w,
                height: this.h,
                wireframes: false,
                background: 'transparent'
            }
        });

        this.engine.gravity.y = 1.5;
        Matter.Render.run(this.render);
        Matter.Runner.run(Matter.Runner.create(), this.engine);
        
        this.createWorld();
        this.setupCollisions();
    },

    createWorld() {
        // دروستکردنی بزمارەکان
        for (let i = 0; i < 14; i++) {
            for (let j = 0; j <= i; j++) {
                const x = this.w / 2 + (j - i / 2) * (this.w / 14);
                const y = 50 + i * (this.h / 22);
                Matter.Composite.add(this.engine.world, Matter.Bodies.circle(x, y, 3, {
                    isStatic: true, render: { fillStyle: "#475569" }
                }));
            }
        }

        // دروستکردنی خانەکان (Slots)
        const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
        const colors = ["#ff0055", "#ff5500", "#ffaa00", "#ccff00", "#00ffa3", "#00ffa3", "#ccff00", "#ffaa00", "#ff5500", "#ff0055"];
        const sW = this.w / multipliers.length;

        multipliers.forEach((val, i) => {
            const slot = Matter.Bodies.rectangle(i * sW + sW / 2, this.h - 35, sW - 5, 30, {
                isStatic: true, isSensor: true, label: `x-${val}`,
                render: { fillStyle: colors[i] }
            });
            Matter.Composite.add(this.engine.world, slot);
        });
    },

    spawnBall() {
        const ball = Matter.Bodies.circle(this.w / 2 + (Math.random() * 6 - 3), 10, 7, {
            restitution: 0.5, frictionAir: 0.04, label: 'ball',
            render: { fillStyle: "#00ffa3", shadowBlur: 15, shadowColor: "#00ffa3" }
        });
        Matter.Composite.add(this.engine.world, ball);
    },

    setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const ball = pair.bodyA.label === 'ball' ? pair.bodyA : (pair.bodyB.label === 'ball' ? pair.bodyB : null);
                const slot = pair.bodyA.label?.startsWith('x-') ? pair.bodyA : (pair.bodyB.label?.startsWith('x-') ? pair.bodyB : null);

                if (ball && slot && !ball.used) {
                    ball.used = true;
                    const mult = parseFloat(slot.label.split('-')[1]);
                    window.ui.handleWin(mult);
                    
                    // لادانی تۆپەکە دوای بردنەوە
                    setTimeout(() => Matter.Composite.remove(this.engine.world, ball), 100);
                }
            });
        });
    }
};
