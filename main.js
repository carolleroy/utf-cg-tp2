const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
if (!gl) alert("O seu navegador não suporta WebGL 2!");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

gl.enable(gl.DEPTH_TEST);

// Shaders
const vs = `#version 300 es
in vec4 position;
in vec3 normal;

uniform mat4 u_matrix;
out vec3 v_normal;

void main() {
    gl_Position = u_matrix * position;
    v_normal = normal;
}
`;

const fs = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(vec3(0.2, 1.0, 0.3));
    float diff = max(dot(normal, lightDir), 0.3);
    
    // Cor de neve
    vec3 snowColor = vec3(0.92, 0.96, 1.0);
    vec3 shadowColor = vec3(0.65, 0.72, 0.85);
    
    vec3 finalColor = mix(shadowColor, snowColor, diff);
    outColor = vec4(finalColor, 1.0);
}
`;

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

// CILINDRO ACHATADO 
const bufferInfo = twgl.primitives.createCylinderBufferInfo(gl, 1.8, 0.2, 32, 1);  
// (gl, radius, height, radialSubdivisions, verticalSubdivisions)

const m4 = twgl.m4;

function render(time) {
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projectionMatrix = m4.perspective(30 * Math.PI / 180, aspect, 0.1, 100);
    
    // Câmera posicionada para ver o topo do disco de neve
    const eye = [0, 5, 8];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(eye, target, up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.identity(); // Não precisa rotacionar, o cilindro já nasce em pé!

    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    twgl.setUniforms(programInfo, {
        u_matrix: worldViewProjectionMatrix,
    });

    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);