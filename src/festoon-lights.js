async function createFestoonLights(gl) {
    const m4 = twgl.m4;
    const parts = await loadGLBParts('assets/models/pisca-pisca/luzes.glb');
    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];

    // encontra os limites do modelo para calcular sua escala e centralização
    for (const part of parts) {
        for (let vertex = 0; vertex < part.position.length; vertex += 3) {
            for (let axis = 0; axis < 3; axis++) {
                minimum[axis] = Math.min(minimum[axis], part.position[vertex + axis]);
                maximum[axis] = Math.max(maximum[axis], part.position[vertex + axis]);
            }
        }
    }

    // ajusta o tamanho e posiciona o cordão acima do cenário
    const scale = 2.85 / (maximum[0] - minimum[0]);
    const centerX = (minimum[0] + maximum[0]) / 2;
    const centerZ = (minimum[2] + maximum[2]) / 2;
    let worldMatrix = m4.translation([0, 1.85, 0]);
    worldMatrix = m4.rotateY(worldMatrix, Math.PI / 6);
    worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
    worldMatrix = m4.translate(worldMatrix, [-centerX, -maximum[1], -centerZ]);

    return parts.map(part => {
        return {
            // envia posições, normais e coordenadas de textura para a gpu
            bufferInfo: twgl.createBufferInfoFromArrays(gl, {
                position: {numComponents: 3, data: part.position},
                normal: {numComponents: 3, data: part.normal},
                texcoord: {numComponents: 2, data: new Float32Array(part.position.length / 3 * 2)},
            }),
            worldMatrix,
            color: part.color,
            emissiveColor: part.color.slice(0, 3).map(channel => channel * 0.85),
        };
    });

}

//função para desenhar o psica-pisca aceso
function drawFestoonLights(renderer, festoonParts) {
    for (const part of festoonParts) {
        renderer.draw(part);
    }
}
