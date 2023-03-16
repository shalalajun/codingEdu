let program;
let cameraPosition;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);		// 캔버스를 생성하는 함수: 너비px, 높이px, 렌더러
	angleMode(DEGREES);								// 각도 모드: 파이(radians) 혹은 0~360도(degrees)
	background(0); 										// 캔버스의 배경색
	program = createShader(vs,fs);
    //cameraPosition = createVector(0,0,0);
    frameRate(60);
  
}


function draw() {
	//
	background("#048A81");	


  
	shader(program);
	noStroke();
	orbitControl();		
	setColor([0.024,0.839,0.627]);
	mySpherePlanet(0,0, 0, 120, '#06D6A0');
	myTorusPlanet(cos(frameCount*1.3)*480,sin(frameCount*1.3)*480,0);
}

function mySpherePlanet(x,y,z,  radius, color)
{
	let sphereRotation = sin(frameCount) * 180;
	smooth();
	push();
	translate(x,y,z);
	//rotateY(sphereRotation);
	sphere(radius,60,60);		
	pop();
}

function myTorusPlanet(x,y,z)
{
	push();
	//fill("#ff00ff");
	setColor([1.0,0.0,1.0]);
	translate(x,y,z);
	rotateX(millis()*0.1);
	torus(125, 30, 64, 64);
	//myTorusSatellite();
	pop();
}

function setColor([x,y,z]){
return program.setUniform('dColor',[x,y,z]);
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }

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

}

`

let fs = `
 
precision mediump float;

varying vec3 var_vertNormal;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 modelPosition; //specular위해서

uniform vec3 dColor;
uniform vec3 u_CameraPosition;

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

gl_FragColor = vec4(lightCol + specular + rimLight,1.0);//라이팅
}

`

