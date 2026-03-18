const canvas=document.getElementById("board")

const ctx=canvas.getContext("2d")

canvas.width=420
canvas.height=420

let risk="green"

let ball=null

let bet=0.30

const betText=document.getElementById("bet")

const rows=14

let pegs=[]

for(let r=0;r<rows;r++){

for(let c=0;c<=r;c++){

pegs.push({

x:210-r*13+c*26,

y:40+r*25

})

}

}

function drawBoard(){

ctx.clearRect(0,0,420,420)

ctx.fillStyle="white"

pegs.forEach(p=>{

ctx.beginPath()

ctx.arc(p.x,p.y,3,0,Math.PI*2)

ctx.fill()

})

if(ball){

ctx.beginPath()

ctx.arc(ball.x,ball.y,6,0,Math.PI*2)

ctx.fillStyle="white"

ctx.fill()

ball.y+=3

ball.x+=(Math.random()-0.5)*4

if(ball.y>380){

ball=null

}

}

requestAnimationFrame(drawBoard)

}

function dropBall(){

ball={

x:210,

y:10

}

}

function setRisk(r){

risk=r

generateMultipliers()

}

function betPlus(){

bet+=0.10

betText.innerText=bet.toFixed(2)

}

function betMinus(){

bet-=0.10

if(bet<0.10)bet=0.10

betText.innerText=bet.toFixed(2)

}

function generateMultipliers(){

const container=document.getElementById("multipliers")

container.innerHTML=""

let values

if(risk=="green"){

values=[18,3.2,1.6,1.3,1.2,1.1,1,0.5,1,1.1,1.2,1.3,1.6,3.2,18]

}

if(risk=="yellow"){

values=[55,12,5.6,3.2,1.6,1,0.7,0.2,0.7,1,1.6,3.2,5.6,12,55]

}

if(risk=="red"){

values=[353,49,14,5.3,2.1,0.5,0.2,0,0.2,0.5,2.1,5.3,14,49,353]

}

values.forEach(v=>{

let d=document.createElement("div")

d.innerText=v

d.className=risk

container.appendChild(d)

})

}

generateMultipliers()

drawBoard()
