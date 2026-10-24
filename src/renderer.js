class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("Seu navegador não suporta WebGL 2.");
        }

        const vertexShader = `#version 300 es
        in vec4 position;
        in vec3 normal;
        out vec3 v_normal;
        uniform mat4 u_matrix;

        void main() {
            gl_Position = u_matrix * position;
            v_normal = normal;
        }
        `;

        const fragmentShader = `#version 300 es
        precision highp float;
        uniform vec4 u_color;
        in vec3 v_normal;
        out vec4 outColor;

        void main() {
            vec3 normal = normalize(v_normal);
            vec3 lightDir = normalize(vec3(0.2, 1.0, 0.3));
            float diff = max(dot(normal, lightDir), 0.3);
            vec3 shadowColor = u_color.rgb * vec3(0.65 / 0.92, 0.72 / 0.96, 0.85);
            outColor = vec4(mix(shadowColor, u_color.rgb, diff), u_color.a);
        }
        `;

        this.programInfo = twgl.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    beginFrame() {
        const gl = this.gl;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        twgl.resizeCanvasToDisplaySize(this.canvas, pixelRatio);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.06, 0.09, 0.14, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.programInfo.program);

        const m4 = twgl.m4;
        const aspect = this.canvas.width / Math.max(this.canvas.height, 1);
        const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100);
        const camera = m4.lookAt([0, 6, 9], [0, 0, 0], [0, 1, 0]);
        this.viewProjection = m4.multiply(projection, m4.inverse(camera));
    }

    draw(object) {
        const gl = this.gl;
        twgl.setBuffersAndAttributes(gl, this.programInfo, object.bufferInfo);
        twgl.setUniforms(this.programInfo, {
            u_matrix: twgl.m4.multiply(this.viewProjection, object.worldMatrix),
            u_color: object.color,
        });
        twgl.drawBufferInfo(gl, object.bufferInfo);
    }
}
