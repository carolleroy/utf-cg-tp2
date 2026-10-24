function createWorld(gl) {
    return [
        {
            bufferInfo: twgl.primitives.createCylinderBufferInfo(gl, 1.8, 0.2, 96, 1),
            worldMatrix: twgl.m4.identity(),
            color: [0.92, 0.96, 1, 1],
        },
        {
            bufferInfo: createDiskBufferInfo(gl, 1.8),
            worldMatrix: twgl.m4.translation([0, 0.101, 0]),
            color: [0.92, 0.96, 1, 1],
        },
    ];
}
