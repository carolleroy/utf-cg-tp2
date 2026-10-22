// obtém o elemento canvas do HTML
const canvas = document.getElementById("glCanvas");

// WebGL 2
const gl = canvas.getContext("webgl2");
if (!gl) {
    alert("O seu navegador não suporta WebGL 2!");
}

// ajusta o tamanho do canvas dinamicamente ao redimensionar a janela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// teste de profundidade 
gl.enable(gl.DEPTH_TEST);

// shaders vertice
const vs = `#version 300 es
in vec4 position;
in vec3 normal;

uniform mat4 u_matrix;

out vec3 v_normal;

void main() {
    // transforma a posição do vértice com a matriz de projeção/vista/mundo
    gl_Position = u_matrix * position;
    v_normal = normal;
}
`;

//fragment shader
const fs = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    outColor = vec4(normal * 0.5 + 0.5, 1.0);
}
`;

// Compila os shaders e cria o programa usando a TWGL
const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const bufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 6, 6);

// atalho para as funções de matriz da TWGL
const m4 = twgl.m4;

// loop principal de renderização (corre continuamente a cada frame)
function render(time) {
    // limpa o ecrã com uma cor de fundo escura
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //ativa os shaders
    gl.useProgram(programInfo.program);

    //vincula vao e vbo ao plano
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);


    //configura a matriz 
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projectionMatrix = m4.perspective(30 * Math.PI / 180, aspect, 0.1, 100);
    
    const eye = [0, 5, 8];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(eye, target, up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.identity();
    worldMatrix = m4.xRotate(worldMatrix, -Math.PI / 2); // Deita o plano no chão

    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    // envia a matriz combinada para o shader e desenha
    twgl.setUniforms(programInfo, {
        u_matrix: worldViewProjectionMatrix,
    });

    twgl.drawBufferInfo(gl, bufferInfo);

    // mantemos o loop ativo
    requestAnimationFrame(render);
}
