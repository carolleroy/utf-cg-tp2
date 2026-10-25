async function createReindeer(gl) {
    const m4 = twgl.m4;
    const model = await loadOBJModel(gl, 'assets/models/rena/pm0586_11_00.obj');
    const scale = 1.55 / (model.maximum[1] - model.minimum[1]);
    const centerX = (model.minimum[0] + model.maximum[0]) / 2;
    const centerZ = (model.minimum[2] + model.maximum[2]) / 2;
    let worldMatrix = m4.translation([0, 0.101, 0.1]);
    worldMatrix = m4.rotateY(worldMatrix, Math.PI / 18);
    worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
    worldMatrix = m4.translate(worldMatrix, [-centerX, -model.minimum[1], -centerZ]);

    return model.parts.map(part => ({...part, worldMatrix}));
}
