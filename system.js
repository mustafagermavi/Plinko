const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
const engine = Engine.create();
engine.world.gravity.y = 1.6;

const gameArea = document.getElementById('game-area');
const render = Render.create({
    element: gameArea,
    engine: engine,
    options: {
        width: gameArea.clientWidth,
        height: gameArea.clientHeight,
        wireframes: false,
        background: 'transparent'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// دروستکردنی بزمارەکان و خانەکان بە شێوەی ئۆتۆماتیکی لێرە ئەنجام دەدرێت
function initSystem() {
    // کۆدی دروستکردنی بزمارەکان (Pegs)
    // ...
}
initSystem();
