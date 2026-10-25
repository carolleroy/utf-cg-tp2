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
    objects.push(...await createReindeer(gl));
    objects.push(...await createSnowRocks(gl));
    objects.push(...await createSnowPlants(gl));
    objects.push(...await createSnowMound(gl));

    return objects;
}
async function createSnowPines(gl) {
    const m4 = twgl.m4;
    const model = await loadTexturedModel(gl, 'assets/models/pinheiro/pinheiro.json', 'assets/models/pinheiro/deco0057.png');
    const trees = [
        {x: -1.28, z: -0.61, height: 1.55, rotation: 0},
        {x: -0.4, z: -1.08, height: 1.15, rotation: Math.PI / 3},
        {x: 0.38, z: -0.94, height: 1.35, rotation: -Math.PI / 4},
    ];

    const orbitMatrix = m4.rotationY(20 * Math.PI / 180);

    return trees.map(tree => {
        let worldMatrix = m4.multiply(orbitMatrix, m4.translation([tree.x, 0.101, tree.z]));
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
        {id: 'acc144', texture: 'acc144a01.png', x: -1.25, z: 0.82, height: 0.32, rotation: 0.25},
        {id: 'acc144', texture: 'acc144b01.png', x: -1.03, z: 0.38, height: 0.46, rotation: -0.3},
        {id: 'acc145', texture: 'acc145a01.png', x: 1.08, z: 0.5, height: 0.39, rotation: -0.4},
    ];

    return Promise.all(variants.map(async gift => {
        const folder = 'assets/models/presentes/digimon';
        const model = await loadTexturedModel(gl, `${folder}/${gift.id}.json`, `${folder}/${gift.texture}`);
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

async function createSnowRocks(gl) {
    const m4 = twgl.m4;
    const model = await loadOBJModel(gl, 'assets/models/pedra/Snow Rock.obj');
    const width = Math.max(model.maximum[0] - model.minimum[0], model.maximum[2] - model.minimum[2]);
    const centerX = (model.minimum[0] + model.maximum[0]) / 2;
    const centerZ = (model.minimum[2] + model.maximum[2]) / 2;
    const rocks = [
        {x: -0.45, z: 1.25, width: 0.28, rotation: 0.3},
        {x: 1.3, z: -0.12, width: 0.32, rotation: -0.7},
        {x: -1.28, z: -0.08, width: 0.22, rotation: 1.4},
    ];

    return rocks.flatMap(rock => {
        const scale = rock.width / width;
        let worldMatrix = m4.translation([rock.x, 0.101, rock.z]);
        worldMatrix = m4.rotateY(worldMatrix, rock.rotation);
        worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
        worldMatrix = m4.translate(worldMatrix, [-centerX, -model.minimum[1], -centerZ]);

        return model.parts.map(part => ({...part, worldMatrix}));
    });
}

async function createSnowPlants(gl) {
    const m4 = twgl.m4;
    const variants = [
        {
            path: 'assets/models/matinhos/grama/Snow Grass.obj',
            patches: [
                {x: -0.68, z: 1.15, width: 0.25, rotation: 0.4},
                {x: 1.12, z: -0.28, width: 0.26, rotation: -0.6},
                {x: -1.32, z: -0.3, width: 0.23, rotation: 1.2},
                {x: 0.63, z: -1.12, width: 0.22, rotation: 0.8},
            ],
        },
        {
            path: 'assets/models/matinhos/cavalinha/Snow Horsetail.obj',
            patches: [
                {x: -0.28, z: 1.18, width: 0.2, rotation: -0.4},
                {x: 1.35, z: 0.12, width: 0.22, rotation: 1.1},
                {x: -0.79, z: -0.62, width: 0.2, rotation: 0.5},
            ],
        },
    ];
    const objects = [];

    for (const variant of variants) {
        const model = await loadOBJModel(gl, variant.path);
        const width = Math.max(model.maximum[0] - model.minimum[0], model.maximum[2] - model.minimum[2]);
        const centerX = (model.minimum[0] + model.maximum[0]) / 2;
        const centerZ = (model.minimum[2] + model.maximum[2]) / 2;

        for (const patch of variant.patches) {
            const scale = patch.width / width;
            let worldMatrix = m4.translation([patch.x, 0.101, patch.z]);
            worldMatrix = m4.rotateY(worldMatrix, patch.rotation);
            worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
            worldMatrix = m4.translate(worldMatrix, [-centerX, -model.minimum[1], -centerZ]);
            objects.push(...model.parts.map(part => ({...part, worldMatrix})));
        }
    }

    return objects;
}

async function createSnowMound(gl) {
    const m4 = twgl.m4;
    const model = await loadOBJModel(gl, 'assets/models/monte-neve/Snow Mound.obj');
    const width = Math.max(model.maximum[0] - model.minimum[0], model.maximum[2] - model.minimum[2]);
    const centerX = (model.minimum[0] + model.maximum[0]) / 2;
    const centerZ = (model.minimum[2] + model.maximum[2]) / 2;
    const mounds = [
        {x: -0.83, z: 0.8, width: 0.58, rotation: -Math.PI / 5},
        {x: 0.35, z: -1.28, width: 0.42, rotation: Math.PI / 3},
    ];

    return mounds.flatMap(mound => {
        const scale = mound.width / width;
        let worldMatrix = m4.translation([mound.x, 0.091, mound.z]);
        worldMatrix = m4.rotateY(worldMatrix, mound.rotation);
        worldMatrix = m4.scale(worldMatrix, [scale, scale, scale]);
        worldMatrix = m4.translate(worldMatrix, [-centerX, -model.minimum[1], -centerZ]);

        return model.parts.map(part => ({...part, worldMatrix}));
    });
}
