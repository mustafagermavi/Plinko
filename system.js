const System = {
    // ... هەمان کۆدی پێشوو لە Init و Engine ...

    createWorld() {
        // بزمارەکان دەبێت زۆر بچووک و وەک خاڵی ڕووناک بن
        for (let i = 0; i < 14; i++) {
            for (let j = 0; j <= i; j++) {
                const x = this.w / 2 + (j - i / 2) * (this.w / 14);
                const y = 70 + i * (this.h / 24);
                Matter.Composite.add(this.engine.world, Matter.Bodies.circle(x, y, 2.5, {
                    isStatic: true,
                    render: { fillStyle: "#1e293b" }
                }));
            }
        }

        // خانەکان (Slots) - ستایلی Minimalist
        const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
        const sW = this.w / multipliers.length;

        multipliers.forEach((val, i) => {
            const slot = Matter.Bodies.rectangle(i * sW + sW / 2, this.h - 40, sW - 10, 4, {
                isStatic: true, isSensor: true, label: `x-${val}`,
                render: { 
                    fillStyle: "rgba(255, 255, 255, 0.05)", // زۆر کاڵ
                    strokeStyle: "rgba(255, 255, 255, 0.1)",
                    lineWidth: 1
                }
            });
            slot.originalY = this.h - 40;
            Matter.Composite.add(this.engine.world, slot);
        });
    },

    setupTextRendering() {
        Matter.Events.on(this.render, 'afterRender', () => {
            const ctx = this.render.context;
            ctx.font = '600 11px "Inter", sans-serif';
            ctx.textAlign = 'center';
            
            const multipliers = [10, 5, 2, 1.1, 0.5, 0.5, 1.1, 2, 5, 10];
            const sW = this.w / multipliers.length;

            multipliers.forEach((val, i) => {
                ctx.fillStyle = val >= 2 ? "#00ffa3" : "#64748b"; // ڕەنگی سەوز تەنها بۆ بردنەوەکان
                ctx.fillText(val + 'x', i * sW + sW / 2, this.h - 55);
            });
        });
    },

    spawnBall() {
        // تۆپەکە با وەک دڵۆپە ڕووناکییەک بێت
        const ball = Matter.Bodies.circle(this.w / 2 + (Math.random() * 4 - 2), 20, 6, {
            restitution: 0.4, frictionAir: 0.04, label: 'ball',
            render: { fillStyle: "#fff" }
        });
        Matter.Composite.add(this.engine.world, ball);
    }
};
