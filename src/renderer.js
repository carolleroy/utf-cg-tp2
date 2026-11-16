class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        // começa com o modelo de iluminação desligado
        this.luzesAcesas = false;
        this.lightDirection = [0.0, 1.0, 0.2];
        this.eyePosition = [0, 0, 0];

        // alterna as luzes uma vez por pressionamento da tecla l
        window.addEventListener('keydown', event => {
            if (event.code === 'KeyL' && !event.repeat) {
                this.luzesAcesas = !this.luzesAcesas;
            }
        });

        // obtém o contexto webgl 2 usado para desenhar a cena
        this.gl = canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("Seu navegador não suporta WebGL 2.");
        }

        const vertexShader = `#version 300 es
        in vec4 position;
        in vec3 normal;
        in vec2 texcoord;
        
        uniform mat4 u_matrix;
        uniform mat4 u_world;
        uniform mat4 u_normalMatrix;

        out vec3 v_position;
        out vec3 v_normal;
        out vec2 v_texcoord;

        void main() {
            // passa posição, normal e textura do vértice para o shader de fragmentos
            vec4 worldPos = u_world * position;
            v_position = worldPos.xyz;
            v_normal = mat3(u_normalMatrix) * normal;
            v_texcoord = texcoord;
            gl_Position = u_matrix * position;
        }
        `;

    // calcula os termos ambiente, difuso e especular do modelo de phong
    const fragmentShader = `#version 300 es
    precision highp float;

    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texcoord;

    uniform vec4 u_color;
    uniform sampler2D u_texture;
    uniform vec3 u_eye;
    uniform vec3 u_lightDirection;
    uniform vec3 u_specularColor;
    uniform float u_shininess;
    uniform bool u_luzesAcesas;

    out vec4 outColor;

    void main() {
        vec4 color = u_color * texture(u_texture, v_texcoord);
        if (color.a < 0.5) discard;

        vec3 N = normalize(v_normal);
        vec3 iluminacao = color.rgb;

        if (u_luzesAcesas) {
            vec3 L = normalize(u_lightDirection);
            vec3 V = normalize(u_eye - v_position);

            // a luz ambiente evita que as faces sem luz direta fiquem pretas
            vec3 ambiente = color.rgb * 0.18;

            // o material difuso usa a cor e a textura próprias de cada objeto
            float difusao = max(dot(N, L), 0.0);
            vec3 difusa = color.rgb * vec3(1.0, 0.9, 0.75) * difusao;

            // o brilho especular depende da direção da luz e da câmera
            vec3 R = reflect(-L, N);
            float fatorEspecular = 0.0;
            if (difusao > 0.0) {
                fatorEspecular = pow(max(dot(R, V), 0.0), u_shininess);
            }
            vec3 especular = u_specularColor * fatorEspecular;

            iluminacao = ambiente + difusa + especular;
        }

        outColor = vec4(iluminacao, color.a);
    }
    `;

        this.programInfo = twgl.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
        this.whiteTexture = twgl.createTexture(this.gl, {src: [255, 255, 255, 255]});
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    beginFrame(camera, variacaoTempo = 0) {
        const gl = this.gl;

        // atualiza a câmera e adapta o desenho ao tamanho 
        camera.update(variacaoTempo);
        
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        twgl.resizeCanvasToDisplaySize(this.canvas, pixelRatio);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        gl.clearColor(0.03, 0.10, 0.16, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.programInfo.program);

        // calcula a matriz que transforma a cena para a visão da câmera
        const aspect = this.canvas.width / Math.max(this.canvas.height, 1);
        this.viewProjection = camera.getViewProjection(aspect);

        if (camera.position) {
            this.eyePosition = camera.position;
        } else if (camera.target && camera.distance !== undefined) {
            // calcula a posição da câmera orbital a partir dos ângulos e da distância
            const hDist = camera.distance * Math.cos(camera.elevation || 0);
            this.eyePosition = [
                camera.target[0] + hDist * Math.sin(camera.anguloHorizontal || 0),
                camera.target[1] + camera.distance * Math.sin(camera.elevation || 0),
                camera.target[2] + hDist * Math.cos(camera.anguloHorizontal || 0)
            ];
        }
    }

    draw(object) {
        const gl = this.gl;

        // configura a geometria e envia matrizes, cores e estado das luzes aos shaders
        twgl.setBuffersAndAttributes(gl, this.programInfo, object.bufferInfo);
        twgl.setUniforms(this.programInfo, {
            u_matrix: twgl.m4.multiply(this.viewProjection, object.worldMatrix),
            u_world: object.worldMatrix,
            u_normalMatrix: twgl.m4.transpose(twgl.m4.inverse(object.worldMatrix)),
            u_color: object.color || [1, 1, 1, 1],
            u_texture: object.texture || this.whiteTexture,
            u_eye: this.eyePosition,
            u_luzesAcesas: this.luzesAcesas,
            u_lightDirection: this.lightDirection,
            u_specularColor: object.specularColor || [0.35, 0.35, 0.35],
            u_shininess: object.shininess === undefined ? 32 : object.shininess
        });
        twgl.drawBufferInfo(gl, object.bufferInfo);
    }
}