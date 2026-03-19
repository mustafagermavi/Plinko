const System = {
    engine: Matter.Engine.create(),
    render: null,
    w: 0,
    h: 0,

    init() {
        const container = document.getElementById('game-canvas-area');
        this.w = container.clientWidth;
        this.h = container.clientHeight;

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

        this.engine.gravity.y = 1.8; // کەمێک خێراتر بۆ هیجان
        Matter.Render.run(this.render);
        Matter.Runner.run(Matter.Runner.create(), this.engine);
        
        this.createWorld();
        this.setupCollisions();
        this.setupTextRendering();
    },

    createWorld() {
        // بزمارەکان بە ڕەنگی زیویی گەش
        for (let i = 0; i < 14; i++) {
            for (let j = 0; j <= i; j++) {
                const x = this.w / 2 + (j - i / 2) * (this.w / 14);
                const y = 60 + i * (this.h / 23);
                Matter.Composite.add(this.engine.world, Matter.Bodies.circle(x, y, 3.5, {
                    isStatic: true, restitution: 0.6,
                    render: { fillStyle: "#64748b", strokeStyle: "#94a3b8", lineWidth: 1 }
                }));
            }
        }

        // دروستکردنی خانەکان بە شێوازێکی مۆدێرن
        const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
        const colors = ["#ff0055", "#ff5500", "#ffaa00", "#ccff00", "#00ffa3", "#00ffa3", "#ccff00", "#ffaa00", "#ff5500", "#ff0055"];
        const sW = this.w / multipliers.length;

        multipliers.forEach((val, i) => {
            const slot = Matter.Bodies.rectangle(i * sW + sW / 2, this.h - 40, sW - 8, 35, {
                isStatic: true, isSensor: true, label: `x-${val}`,
                render: { fillStyle: colors[i], strokeStyle: "#ffffff44", lineWidth: 2 }
            });
            slot.originalY = this.h - 40; // پاشەکەوتکردنی شوێنی ئەسڵی بۆ ئەنیمەیشن
            Matter.Composite.add(this.engine.world, slot);
        });
    },

    setupTextRendering() {
        Matter.Events.on(this.render, 'afterRender', () => {
            const ctx = this.render.context;
            ctx.font = '900 14px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';

            const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
            const sW = this.w / multipliers.length;

            multipliers.forEach((val, i) => {
                // دۆزینەوەی خانەکە بۆ ئەوەی تێکستەکە لەگەڵ ئەنیمەیشنەکە بجوڵێت
                const slots = Matter.Composite.allBodies(this.engine.world).filter(b => b.label === `x-${val}`);
                const currentSlot = slots[i] || slots[0]; 
                ctx.fillText('x' + val, i * sW + sW / 2, currentSlot.position.y + 5);
            });
        });
    },

    spawnBall() {
        const ball = Matter.Bodies.circle(this.w / 2 + (Math.random() * 8 - 4), 20, 8, {
            restitution: 0.5, frictionAir: 0.03, label: 'ball',
            render: { fillStyle: "#ffffff", shadowBlur: 20, shadowColor: "#00ffa3" }
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
                    if(window.ui) window.ui.handleWin(mult);

                    // --- ئەنیمەیشنی جوڵەی خانەکە (Bouncing Animation) ---
                    Matter.Body.setPosition(slot, { x: slot.position.x, y: slot.originalY + 15 });
                    
                    setTimeout(() => {
                        Matter.Body.setPosition(slot, { x: slot.position.x, y: slot.originalY });
                        Matter.Composite.remove(this.engine.world, ball);
                    }, 150);
                }
            });
        });
    }
};
