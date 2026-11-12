class GlassDome {
    constructor(gl) {
        this.gl = gl;
        const radius = 2.2;
        const baseRadius = 1.57;
        const baseHeight = -1.29;
        const centerHeight = baseHeight + Math.sqrt(radius * radius - baseRadius * baseRadius);
        const maxAngle = Math.acos((baseHeight - centerHeight) / radius);
        const rings = 48;
        const segments = 128;
        const position = [];
        const normal = [];
        const indices = [];

        for (let ring = 0; ring <= rings; ring++) {
            const angle = ring / rings * maxAngle;
            for (let segment = 0; segment <= segments; segment++) {
                const longitude = segment / segments * Math.PI * 2;
                const x = Math.sin(angle) * Math.cos(longitude);
                const y = Math.cos(angle);
                const z = Math.sin(angle) * Math.sin(longitude);
                position.push(radius * x, centerHeight + radius * y, radius * z);
                normal.push(x, y, z);
                if (ring < rings && segment < segments) {
                    const first = ring * (segments + 1) + segment;
                    const next = first + segments + 1;
                    if (ring > 0) indices.push(first, first + 1, next);
                    indices.push(first + 1, next + 1, next);
                }
            }
        }

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            position: {numComponents: 3, data: position},
            normal: {numComponents: 3, data: normal},
            indices,
        });
        const vertexShader = `#version 300 es
        in vec3 position;
        in vec3 normal;
        uniform mat4 u_viewProjection;
        out vec3 v_position;
        out vec3 v_normal;

        void main() {
            v_position = position;
            v_normal = normal;
            gl_Position = u_viewProjection * vec4(position, 1.0);
        }
        `;
        const fragmentShader = `#version 300 es
        precision highp float;
        in vec3 v_position;
        in vec3 v_normal;
        uniform vec3 u_eye;
        out vec4 outColor;

        void main() {
            vec3 normal = normalize(v_normal);
            vec3 view = normalize(u_eye - v_position);
            float facing = abs(dot(normal, view));
            float edge = pow(1.0 - facing, 3.0);
            vec3 reflection = reflect(-view, normal);
            float highlight = pow(max(dot(reflection, normalize(vec3(-0.65, 0.8, 0.5))), 0.0), 90.0);
            float softHighlight = pow(max(dot(reflection, normalize(vec3(0.9, 0.35, -0.45))), 0.0), 55.0);
            vec3 color = mix(vec3(0.55, 0.75, 0.88), vec3(0.88, 0.96, 1.0), edge);
            color = mix(color, vec3(1.0), min(highlight + softHighlight * 0.6, 1.0));
            float alpha = 0.018 + 0.22 * edge + 0.48 * highlight + 0.22 * softHighlight;
            outColor = vec4(color, min(alpha, 0.65));
        }
        `;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
    }

    draw(camera, viewProjection) {
        const gl = this.gl;
        const wasBlending = gl.isEnabled(gl.BLEND);
        const wasCulling = gl.isEnabled(gl.CULL_FACE);
        const depthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        const cullMode = gl.getParameter(gl.CULL_FACE_MODE);
        const blendSourceRGB = gl.getParameter(gl.BLEND_SRC_RGB);
        const blendDestinationRGB = gl.getParameter(gl.BLEND_DST_RGB);
        const blendSourceAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
        const blendDestinationAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
        const horizontalDistance = camera.distance * Math.cos(camera.elevation);
        const eye = [
            camera.target[0] + horizontalDistance * Math.sin(camera.anguloHorizontal),
            camera.target[1] + camera.distance * Math.sin(camera.elevation),
            camera.target[2] + horizontalDistance * Math.cos(camera.anguloHorizontal),
        ];

        gl.useProgram(this.programInfo.program);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, {u_viewProjection: viewProjection, u_eye: eye});
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        twgl.drawBufferInfo(gl, this.bufferInfo);
        gl.cullFace(gl.BACK);
        twgl.drawBufferInfo(gl, this.bufferInfo);

        gl.depthMask(depthMask);
        gl.cullFace(cullMode);
        gl.blendFuncSeparate(blendSourceRGB, blendDestinationRGB, blendSourceAlpha, blendDestinationAlpha);
        if (!wasBlending) gl.disable(gl.BLEND);
        if (!wasCulling) gl.disable(gl.CULL_FACE);
    }
}
