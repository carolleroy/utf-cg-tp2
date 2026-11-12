async function createGiftSleigh(gl) {
    const m4 = twgl.m4;
    const parts = await loadGLBParts('assets/models/treno-natal/treno.glb');
    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];
    for (const part of parts) {
        for (let vertex = 0; vertex < part.position.length; vertex += 3) {
            for (let axis = 0; axis < 3; axis++) {
                minimum[axis] = Math.min(minimum[axis], part.position[vertex + axis]);
                maximum[axis] = Math.max(maximum[axis], part.position[vertex + axis]);
            }
        }
    }
    const scale = 1.14 / Math.max(maximum[0] - minimum[0], maximum[2] - minimum[2]);
    const centerX = (minimum[0] + maximum[0]) / 2;
    const centerZ = (minimum[2] + maximum[2]) / 2;
    let worldMatrix = m4.translation([-1.18, 0.101, 0.78]);
    worldMatrix = m4.rotateY(worldMatrix, 75 * Math.PI / 180);
    worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
    worldMatrix = m4.translate(worldMatrix, [-centerX, -minimum[1], -centerZ]);

    return parts.map(part => ({
        bufferInfo: twgl.createBufferInfoFromArrays(gl, {
            position: {numComponents: 3, data: part.position},
            normal: {numComponents: 3, data: part.normal},
            texcoord: {numComponents: 2, data: new Float32Array(part.position.length / 3 * 2)},
        }),
        color: part.color,
        worldMatrix,
    }));
}
