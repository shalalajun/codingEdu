let y=0;

function setup(){
    createCanvas(windowWidth,windowHeight);
} 

function draw(){
    background(255,255,255);
    noStroke();
    fill(255,0,0);
    y = y + 3;
    ellipse(windowWidth/2, y, 40,40);
}