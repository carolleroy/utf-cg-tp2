class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        // obtém o contexto de renderização webgl 2
        this.gl = canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("Seu navegador não suporta WebGL 2.");
        }

        const vertexShader = `#version 300 es
        in vec4 position;
        in vec3 normal;
        in vec2 texcoord;
        out vec2 v_texcoord;
        uniform mat4 u_normalMatrix;
        out vec3 v_normal;
        uniform mat4 u_matrix;

        void main() {
            gl_Position = u_matrix * position;
            v_normal = mat3(u_normalMatrix) * normal;
            v_texcoord = texcoord;
        }
        `;

        const fragmentShader = `#version 300 es
        precision highp float;
        uniform vec4 u_color;
        uniform sampler2D u_texture;
        in vec2 v_texcoord;
        in vec3 v_normal;
        out vec4 outColor;

        void main() {
            vec4 color = u_color * texture(u_texture, v_texcoord);
            if (color.a < 0.5) discard;
            vec3 normal = normalize(v_normal);
            vec3 lightDir = normalize(vec3(0.2, 1.0, 0.3));
            float diff = max(dot(normal, lightDir), 0.3);
            vec3 shadowColor = color.rgb * vec3(0.65 / 0.92, 0.72 / 0.96, 0.85);
            outColor = vec4(mix(shadowColor, color.rgb, diff), color.a);
        }
        `;

        // cria o programa de shaders e uma textura branca padrão
        this.programInfo = twgl.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
        this.whiteTexture = twgl.createTexture(this.gl, {src: [255, 255, 255, 255]});
        // ativa o teste de profundidade para esconder superfícies atrás de outras
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    beginFrame(camera, variacaoTempo =0 ) {
        const gl = this.gl;

        camera.update(variacaoTempo);
        // limita o tamanho da tela para evitar renderização excessiva
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        twgl.resizeCanvasToDisplaySize(this.canvas, pixelRatio);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);


        // limpa a tela e prepara o programa antes de desenhar
        gl.clearColor(0.03, 0.10, 0.16, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.programInfo.program);

        const aspect = this.canvas.width / Math.max(this.canvas.height, 1);

        // combina a projeção da câmera com o aspecto da tela
        this.viewProjection = camera.getViewProjection(aspect);
    }

    draw(object) {
        const gl = this.gl;
        // conecta os vértices do objeto ao programa de renderização
        twgl.setBuffersAndAttributes(gl, this.programInfo, object.bufferInfo);
        twgl.setUniforms(this.programInfo, {
            u_matrix: twgl.m4.multiply(this.viewProjection, object.worldMatrix),
            u_color: object.color,
            u_normalMatrix: twgl.m4.transpose(twgl.m4.inverse(object.worldMatrix)),
            u_texture: object.texture || this.whiteTexture,
        });
        twgl.drawBufferInfo(gl, object.bufferInfo);
    }

    
}
