/**
 * f = ma
 * 만약 질량이 1이라면 결국 f = a
 * 힘은 결국 가속도 이다.
 */



// 전역변수
let y = 0;

let velY = 0;

let accY = 1;
let radius = 40;

function setup(){
    createCanvas(windowWidth,windowHeight);
} 

function draw(){
    background(220);
    noStroke();
    fill(255,0,0);

    velY = velY + accY;
    y = y + velY;
    
    if(y >= windowHeight - radius/2)
    {
        y = windowHeight - radius/2;
        velY = velY * -0.7;
    }
    ellipse(windowWidth/2, y, radius, radius);
}