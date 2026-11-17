async function createWorld(gl, canvas) {
    const snowTexture = await loadModelTexture(gl, 'assets/textures/neve-craquelada.png');
    const m4 = twgl.m4;
    // cria os elementos básicos da base e da camada de neve
    const objects = [
        {
            bufferInfo: twgl.primitives.createTruncatedConeBufferInfo(gl, 2.12, 2.16, 0.2, 96, 1),
            texture: snowTexture,
            worldMatrix: m4.translation([0, -0.2, 0]),
            color: [0.92, 0.96, 1, 1],
        },
        {
            bufferInfo: createDiskBufferInfo(gl, 2.16),
            texture: snowTexture,
            worldMatrix: m4.translation([0, -0.099, 0]),
            color: [0.92, 0.96, 1, 1],
        },
        {
            bufferInfo: createSnowBaseBufferInfo(gl, -0.3),
            texture: snowTexture,
            worldMatrix: m4.identity(),
            color: [0.92, 0.96, 1, 1],
        },
    ];

    const pedestalParts = [
        // cada item representa uma camada do pedestal
        {radius: 1.5, height: 0.72, y: -1.7, color: [0.55, 0.06, 0.12, 1]},
        {radius: 1.57, height: 0.1, y: -1.34, color: [0.88, 0.64, 0.25, 1]},
        {radius: 1.57, height: 0.1, y: -2.06, color: [0.88, 0.64, 0.25, 1]},
        {radius: 1.63, height: 0.12, y: -2.17, color: [0.06, 0.23, 0.18, 1]},
    ];

    for (const part of pedestalParts) {
        // monta uma camada cilíndrica do pedestal
        objects.push({
            bufferInfo: twgl.primitives.createCylinderBufferInfo(gl, part.radius, part.height, 96, 1),
            worldMatrix: m4.translation([0, part.y, 0]),
            color: part.color,
        });
    }

    const sceneryStart = objects.length;

    // adiciona os modelos decorativos ao mundo
    objects.push(...await createSnowPines(gl));
    objects.push(...await createPresents(gl));
    objects.push(...await createReindeer(gl));
    objects.push(...await createSnowRocks(gl));
    objects.push(...await createSnowPlants(gl));
    objects.push(...await createSnowMound(gl));
    objects.push(...await createChristmasTree(gl));
    objects.push(...await createGiftSleigh(gl));

    const shift = m4.translation([0, -0.2, 0]);
    const shiftedParents = new Set();
    for (const object of objects.slice(sceneryStart)) {
        if (object.parent) {
            if (!shiftedParents.has(object.parent)) {
                object.parent.worldMatrix = m4.multiply(shift, object.parent.worldMatrix);
                shiftedParents.add(object.parent);
            }
            object.worldMatrix = object.parent.worldMatrix;
        } else {
            object.worldMatrix = m4.multiply(shift, object.worldMatrix);
        }
    }

    objects.push(...await createFestoonLights(gl));
    createSnowParticles(gl, objects); //NEVE QUE VAI TER NO GLOBO

    return objects;
}
async function createSnowPines(gl) {
    const m4 = twgl.m4;
    const model = await loadTexturedModel(gl, 'assets/models/pinheiro/pinheiro.json', 'assets/models/pinheiro/deco0057.png');
    const trees = [
        {x: -1.28, z: -0.61, height: 1.55, rotation: 0},
        {x: -0.4, z: -1.08, height: 1.15, rotation: Math.PI / 3},
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
        {id: 'acc144', texture: 'acc144a01.png', x: 0.65, z: -0.58, height: 0.22, rotation: 0.35},
        {id: 'acc144', texture: 'acc144b01.png', x: 1.07, z: -0.62, height: 0.31, rotation: -0.2},
        {id: 'acc145', texture: 'acc145a01.png', x: 1.43, z: -0.7, height: 0.23, rotation: 0.5},
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
        {x: -0.45, z: 1.35, width: 0.28, rotation: 0.3},
        {x: 0.85, z: -0.9, width: 0.32, rotation: -0.7},
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
        {x: -0.86, z: 0.2, width: 0.58, rotation: -Math.PI / 5},
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
