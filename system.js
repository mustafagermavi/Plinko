// ئەم بەشە لە ناو system.js بدۆزەرەوە و وەک ئەمەی لێ بکە:
const setupCollisions = () => {
    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach(pair => {
            const ball = pair.bodyA.label === 'ball' ? pair.bodyA : (pair.bodyB.label === 'ball' ? pair.bodyB : null);
            const slot = pair.bodyA.label?.startsWith('x-') ? pair.bodyA : (pair.bodyB.label?.startsWith('x-') ? pair.bodyB : null);

            if (ball && slot && !ball.used) {
                ball.used = true;
                const multiplier = parseFloat(slot.label.split('-')[1]);
                
                // ناردنی زانیاری بۆ UI
                window.ui.handleWin(multiplier);

                // --- لێرەدا کێشەکە چاک دەبێت ---
                // تۆپەکە ون دەبێت (Fade out) و پاشان دەسڕێتەوە
                ball.render.opacity = 0; 
                setTimeout(() => {
                    Composite.remove(engine.world, ball);
                }, 100); 
            }
        });
    });
};
