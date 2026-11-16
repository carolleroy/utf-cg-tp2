async function createReindeer(gl) {
    const m4 = twgl.m4;
    const sceneOffset = m4.translation([0, -0.2, 0]);
//cada uma das poses que o deer vai ter 
    const poses = [
        {position: [0, 0, 0], rotation: [0, 0, 0]},
        {position: [0, 0, 0.65], rotation: [0, 0, 0]},
        {position: [0, 0, 0.65], rotation: [0, Math.PI / 2, 0]},
        {position: [0, 0, 0.65], rotation: [0, -Math.PI / 2, 0]},
    ];
    let currentPose = 0;

    // carrega o modelo principal da rena
    const model = await loadOBJModel(gl, 'assets/models/rena/pm0586_11_00.obj');
    // calcula a escala usando a altura original do modelo
    const scale = 1.18 / (model.maximum[1] - model.minimum[1]);
    const centerX = (model.minimum[0] + model.maximum[0]) / 2;
    const centerZ = (model.minimum[2] + model.maximum[2]) / 2;

    // matriz base do modelo (escala e centralização)
    let baseMatrix = m4.identity();
    baseMatrix = m4.scale(baseMatrix, [scale, scale, scale]);
    baseMatrix = m4.translate(baseMatrix, [-centerX, -model.minimum[1], -centerZ]);

    const parts = model.parts.map(part => ({
        ...part,
        worldMatrix: baseMatrix,
    }));
    if (parts.length === 0) {
        throw new Error('O modelo da rena não contém malhas.');
    }

    //cada uma das poses indica um valor de 0 a 2

    parts[0].update = () => {
        const pose = poses[currentPose];
        let poseMatrix = m4.translation(pose.position);
        poseMatrix = m4.rotateX(poseMatrix, pose.rotation[0]);
        poseMatrix = m4.rotateY(poseMatrix, pose.rotation[1]);
        poseMatrix = m4.rotateZ(poseMatrix, pose.rotation[2]);

        const worldMatrix = m4.multiply(sceneOffset, m4.multiply(poseMatrix, baseMatrix));
        for (const part of parts) {
            part.worldMatrix = worldMatrix;
        }
    };

    //adiciona evento do P para p ou P e segue as poses para sempre ir uma pra frente

    window.addEventListener('keydown', event => {
        if (event.code === 'KeyP' && !event.repeat) {
            currentPose = (currentPose + 1) % poses.length;
        }
    });

    return parts;
}