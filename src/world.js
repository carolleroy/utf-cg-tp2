async function createWorld(gl) {
    const m4 = twgl.m4;
    const objects = [
        {
            bufferInfo: twgl.primitives.createCylinderBufferInfo(gl, 1.8, 0.2, 96, 1),
            worldMatrix: m4.identity(),
            color: [0.92, 0.96, 1, 1],
        },
        {
            bufferInfo: createDiskBufferInfo(gl, 1.8),
            worldMatrix: m4.translation([0, 0.101, 0]),
            color: [0.92, 0.96, 1, 1],
        },
        {
            bufferInfo: createHemisphereBufferInfo(gl),
            worldMatrix: m4.translation([0, -0.1, 0]),
            color: [0.62, 0.78, 0.85, 1],
        },
    ];

    const pedestalParts = [
        {radius: 1.5, height: 0.72, y: -1.7, color: [0.55, 0.06, 0.12, 1]},
        {radius: 1.57, height: 0.1, y: -1.34, color: [0.88, 0.64, 0.25, 1]},
        {radius: 1.57, height: 0.1, y: -2.06, color: [0.88, 0.64, 0.25, 1]},
        {radius: 1.63, height: 0.12, y: -2.17, color: [0.06, 0.23, 0.18, 1]},
    ];

    for (const part of pedestalParts) {
        objects.push({
            bufferInfo: twgl.primitives.createCylinderBufferInfo(gl, part.radius, part.height, 96, 1),
            worldMatrix: m4.translation([0, part.y, 0]),
            color: part.color,
        });
    }

    objects.push(...await createSnowPines(gl));
    objects.push(...await createPresents(gl));

    return objects;
}
async function createSnowPines(gl) {
    const m4 = twgl.m4;
    const model = await loadTexturedModel(gl, 'assets/models/pinheiro/pinheiro.json', 'assets/models/pinheiro/deco0057.png');
    const trees = [
        {x: -1.05, z: -0.5, height: 1.55, rotation: 0},
        {x: -0.15, z: -1.22, height: 1.15, rotation: Math.PI / 3},
        {x: 0.85, z: -0.83, height: 1.35, rotation: -Math.PI / 4},
    ];

    return trees.map(tree => {
        let worldMatrix = m4.translation([tree.x, 0.101, tree.z]);
        worldMatrix = m4.rotateY(worldMatrix, tree.rotation);
        worldMatrix = m4.scale(worldMatrix, [tree.height, tree.height, tree.height]);

        return {
            bufferInfo: model.bufferInfo,
            texture: model.texture,
            worldMatrix,
            color: [1, 1, 1, 1],
        };
    });
}
async function createPresents(gl) {
    const m4 = twgl.m4;
    const variants = [
        {id: 'pre01', texture: 'texture_0_05bd_2300_2315.png', x: -1.25, z: 0.82, height: 0.32, rotation: 0.25},
        {id: 'pre03', texture: 'texture_0_05bf_2300_2315.png', x: -1.03, z: 0.38, height: 0.46, rotation: -0.3},
        {id: 'pre04', texture: 'texture_0_05c0_2300_2315.png', x: 1.08, z: 0.5, height: 0.39, rotation: -0.4},
    ];

    return Promise.all(variants.map(async gift => {
        const folder = `assets/models/presentes/${gift.id}`;
        const model = await loadTexturedModel(gl, `${folder}/model.json`, `${folder}/textures/${gift.texture}`);
        let worldMatrix = m4.translation([gift.x, 0.101, gift.z]);
        worldMatrix = m4.rotateY(worldMatrix, gift.rotation);
        worldMatrix = m4.scale(worldMatrix, [gift.height, gift.height, gift.height]);

        return {
            bufferInfo: model.bufferInfo,
            texture: model.texture,
            worldMatrix,
            color: [1, 1, 1, 1],
        };
    }));
}
