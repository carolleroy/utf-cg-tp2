function createDiskBufferInfo(gl, radius = 3, segments = 96) {
    // o primeiro vértice é o centro do disco
    const positions = [0, 0, 0];
    const normals = [0, 1, 0];
    const texcoords = [0.5, 0.5];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        // calcula uma posição ao redor da circunferência
        const angle = i / segments * Math.PI * 2;
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        positions.push(radius * x, 0, radius * z);
        normals.push(0, 1, 0);
        texcoords.push((x + 1) / 2, (z + 1) / 2);

        if (i < segments) {
            // conecta o centro aos dois vértices próximos
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

function createHemisphereBufferInfo(gl, radius = 1.8, segments = 96, rings = 24) {
    // listas usadas para armazenar os vértices da meia esfera
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];

    for (let ring = 0; ring <= rings; ring++) {
        // percorre a meia esfera de cima para baixo
        const latitude = ring / rings * Math.PI / 2;
        const ringRadius = Math.cos(latitude);
        const y = -Math.sin(latitude);

        for (let segment = 0; segment <= segments; segment++) {
            // calcula cada posição ao redor da meia esfera
            const longitude = segment / segments * Math.PI * 2;
            const x = ringRadius * Math.cos(longitude);
            const z = ringRadius * Math.sin(longitude);
            positions.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
            texcoords.push(segment / segments, ring / rings);

            if (ring < rings && segment < segments) {
                // cria dois triângulos para cada quad da malha
                const first = ring * (segments + 1) + segment;
                const next = first + segments + 1;
                indices.push(first, first + 1, next);

                if (ring < rings - 1) {
                    indices.push(first + 1, next + 1, next);
                }
            }
        }
    }

    return twgl.createBufferInfoFromArrays(gl, {
        position: {numComponents: 3, data: positions},
        normal: {numComponents: 3, data: normals},
        texcoord: {numComponents: 2, data: texcoords},
        indices,
    });
}
