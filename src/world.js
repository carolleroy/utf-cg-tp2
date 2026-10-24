function createWorld(gl) {
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

    return objects;
}
