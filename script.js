const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 500;

let ball = null;

const pegs = [];

for(let y=80; y<400; y+=40){
for(let x=60; x<540; x+=60){
pegs.push({x:x,y:y});
}
}

const multipliers = [0.5,1,2,5,2,1,0.5];

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="white";

pegs.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,5,0,Math.PI*2);
ctx.fill();
});

multipliers.forEach((m,i)=>{
ctx.fillText(m+"x",80*i+40,480);
});

if(ball){
ctx.beginPath();
ctx.arc(ball.x,ball.y,8,0,Math.PI*2);
ctx.fillStyle="yellow";
ctx.fill();

ball.y += 4;

pegs.forEach(p=>{
if(Math.hypot(ball.x-p.x,ball.y-p.y)<10){
ball.x += (Math.random()-0.5)*40;
}
});

if(ball.y>450){

let slot = Math.floor(ball.x/80);
let multi = multipliers[slot] || 0;

let bet = parseFloat(document.getElementById("bet").value);

document.getElementById("result").innerText =
"Win: "+ (bet*multi).toFixed(2);

ball = null;

}

}

requestAnimationFrame(draw);

}

function dropBall(){

ball = {
x:300,
y:20
}

}

draw();
