const canvas = document.getElementById("game")

const ctx = canvas.getContext("2d")

canvas.width = 700
canvas.height = 600

let ball=null

let pegs=[]

for(let y=100;y<450;y+=40){

for(let x=80;x<620;x+=60){

pegs.push({x:x,y:y})

}

}

let slots=[0.2,0.5,1,2,5,2,1,0.5,0.2]

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="#00ffc3"

pegs.forEach(p=>{

ctx.beginPath()

ctx.arc(p.x,p.y,5,0,Math.PI*2)

ctx.fill()

})

slots.forEach((m,i)=>{

ctx.fillText(m+"x",i*70+40,580)

})

if(ball){

ctx.beginPath()

ctx.arc(ball.x,ball.y,9,0,Math.PI*2)

ctx.fillStyle="yellow"

ctx.fill()

ball.y+=4

pegs.forEach(p=>{

if(Math.hypot(ball.x-p.x,ball.y-p.y)<12){

ball.x+=(Math.random()-0.5)*50

}

})

if(ball.y>560){

let slot=Math.floor(ball.x/70)

let multi=slots[slot]||0

let bet=document.getElementById("bet").value

let win=bet*multi

document.getElementById("win").innerText="WIN: "+win

ball=null

}

}

requestAnimationFrame(draw)

}

function dropBall(){

ball={

x:350,

y:20

}

}

draw()
