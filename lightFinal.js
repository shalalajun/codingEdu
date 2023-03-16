let program;
let cameraPosition;
let gltfLoader, mesh;
let img1, img2, tex1, tex2;

function preload() {
    img1 = loadImage("Texture2.png");
    img2 = loadImage("Texture5.png");
  }
  


function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);		// 캔버스를 생성하는 함수: 너비px, 높이px, 렌더러
	angleMode(DEGREES);								// 각도 모드: 파이(radians) 혹은 0~360도(degrees)
	background(0); 										// 캔버스의 배경색
	program = createShader(vs,rampFs);
   // frameRate(60);
    tex1 = img1.get();
    tex2 = img2.get();
   
}


function draw() {
	//
	background("#048A81");	  
	shader(program);
    program.setUniform("uFrameCount", frameCount);


	noStroke();
	orbitControl();		
    myTorusPlanet(cos(frameCount*1.3)*480,sin(frameCount*1.3)*480,0);
	mySpherePlanet(0,0, 0, 120, '#06D6A0');

}

function mySpherePlanet(x,y,z,  radius, color)
{
	let sphereRotation = sin(frameCount) * 180;
	smooth();
	push();
	translate(x,y,z);
    //setColor([0.024,0.839,0.627]);
    program.setUniform('uTexture', tex2);
	//rotateY(sphereRotation);
	sphere(radius,60,60);		
	pop();
}

function myTorusPlanet(x,y,z)
{
	push();
    program.setUniform('uTexture', tex1);
	//fill("#ff00ff");
	//setColor([1.0,0.0,1.0]);
	translate(x,y,z);
	rotateX(millis()*0.1);
	torus(125, 30, 64, 64);
	//myTorusSatellite();
	pop();
}

function setColor([x,y,z]){
return program.setUniform('dColor',[x,y,z]);
}



// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
// }

let vs = `


// attributes, in
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

// attributes, out
varying vec3 var_vertPos;
varying vec4 var_vertCol;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 modelPosition;


uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;



		
void main() {

vec4 modelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
vUv = aTexCoord;
vNormal = normalize(vec3(uNormalMatrix * aNormal));
gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
gl_PointSize = 20.0;

}

`

let distVs = `


// attributes, in
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

// attributes, out
varying vec3 var_vertPos;
varying vec4 var_vertCol;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 modelPosition;


uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform float uFrameCount;
		
void main() {

// copy the position data into a vec4, using 1.0 as the w component
vec4 positionVec4 = vec4(aPosition, 1.0);

// Frequency and Amplitude will determine the look of the displacement
float frequency = 20.0;
float amplitude = 0.1;

// Displace the x position withe the sine of the x + time. Multiply by the normal to move it in the correct direction
// You could add more distortions to the other axes too. 
float distortion = sin(positionVec4.x * frequency + uFrameCount * 0.1);
positionVec4.x += distortion * aNormal.x * amplitude;
//positionVec4.y += distortion * aNormal.x * amplitude;

vec4 modelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
vUv = aTexCoord;
vNormal = normalize(vec3(uNormalMatrix * aNormal));
gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

}

`

let fs = `
 
precision lowp float;

varying vec3 var_vertNormal;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 modelPosition; //specular위해서

uniform vec3 dColor;
uniform vec3 u_CameraPosition;
uniform sampler2D uTexture;

void main(){
  
    vec3 normal = normalize(vNormal);
    vec3 lightPos = normalize(-vec3(1.5, 0.5, -1.5));
    //float NdotL = max(0.0,dot(normal,lightPos));
    float NdotL = dot(lightPos,normal)*0.5+0.5;


    //NdotL = ceil(NdotL * 2.0) / 2.0;



vec3 lightCol =vec3(1.0,1.0,1.0) * NdotL * dColor;
vec3 camPos = vec3(0.0,0.0,500.0);
vec3 viewDir = normalize(camPos - vec3(modelPosition.xyz));
vec3 H = normalize(lightPos + viewDir);
float HdN =max(0.0,dot(H, normal));

// vec4 specularColor = vec4(1.0,1.0,1.0,1.0);
// vec3 specular = vec3(0.0,0.0,0.0);
// vec3 viewDir = normalize(u_CameraPosition - vec3(modelPosition.xyz));
// vec3 reflectDir = reflect(-lightPos, normal);
// float specularStrength = pow(max(dot(viewDir, reflectDir), 0.0), specularColor.g * 128.0);
// specular = specularStrength * specularColor.rgb;

float specular = pow(HdN, 1240.0);
//specular = smoothstep(0.03, 0.1, specular);

vec3 specularCol = specular * vec3(1.0,1.0,1.0);

float rim = dot(viewDir, normal);
rim = 1.0 -rim;
float rimAmount = 0.2;
float rimIntensity = pow(rim,3.0);  
//rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity); //toon
vec3 rimLight = rimIntensity * vec3(1.0,1.0,1.0);

//float specular = pow(max(0.0, dot(R, viewDirection)), 120.0);

float dotScale = 0.9;
vec2 v = gl_FragCoord.xy * dotScale;
float f = (sin(v.x) * 0.5 + 0.5) + (sin(v.y) * 0.5 + 0.5);
    
float s;
if(NdotL > 0.6){
    s = 1.0;
}else if(NdotL > 0.2){
    s = 0.6;
}else{
    s = 0.4;
}

//vec3 fCol = f * vec3(0.5,0.5,0.0);
//gl_FragColor = vec4(lightCol + specular + rimLight,1.0);//라이팅
vec3 dot = (NdotL + vec3(f)) * s;
//vec3 dot = (NdotL + fCol) * s;

//gl_FragColor = vec4(dColor * dot, 1.0);// 툰닷

 vec4 ramp = texture2D(uTexture, vec2(NdotL,rim));
 gl_FragColor = vec4(ramp.rgb,1.0);
}

`

let rampFs = `
 
precision lowp float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec4 modelPosition;

uniform sampler2D uTexture;

void main(){

//float distance = distance(gl_PointCoord, vec2(0.5, 0.5));

vec3 normal = normalize(vNormal);
vec3 lightPos = normalize(-vec3(1.5, 0.5, -1.5));
float NdotL = dot(lightPos,normal)*0.5+0.5;

vec3 camPos = vec3(0.0,0.0,500.0);
vec3 viewDir = normalize(camPos - vec3(modelPosition.xyz));

float rim = dot(viewDir, normal);
rim = 1.0 -rim;

 vec4 ramp = texture2D(uTexture, vec2(NdotL,rim));
//  if (distance > 0.5) {
//     discard;
// }
 gl_FragColor = vec4(ramp.rgb,1.0);


}

`
