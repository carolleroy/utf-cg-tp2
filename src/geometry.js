function createDiskBufferInfo(gl, radius = 3, segments = 96) {
    const positions = [0, 0, 0];
    const normals = [0, 1, 0];
    const texcoords = [0.5, 0.5];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const angle = i / segments * Math.PI * 2;
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        positions.push(radius * x, 0, radius * z);
        normals.push(0, 1, 0);
        texcoords.push((x + 1) / 2, (z + 1) / 2);

        if (i < segments) {
            indices.push(0, i + 2, i + 1);
        }
    }

    return twgl.createBufferInfoFromArrays(gl, {
        position: {numComponents: 3, data: positions},
        normal: {numComponents: 3, data: normals},
        texcoord: {numComponents: 2, data: texcoords},
        indices,
    });
}
