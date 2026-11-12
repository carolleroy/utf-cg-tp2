async function loadGLBParts(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Não foi possível carregar: ${path}`);
    const buffer = await response.arrayBuffer();
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
        throw new Error('Modelo GLB inválido ou incompatível.');
    }

    let document;
    let binary;
    for (let offset = 12; offset < buffer.byteLength;) {
        const length = view.getUint32(offset, true);
        const type = view.getUint32(offset + 4, true);
        if (type === 0x4e4f534a) {
            document = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, offset + 8, length)).trim());
        } else if (type === 0x004e4942) {
            binary = new DataView(buffer, offset + 8, length);
        }
        offset += length + 8;
    }

    function readAccessor(index) {
        const accessor = document.accessors[index];
        const source = document.bufferViews[accessor.bufferView];
        const readers = {
            5120: ['getInt8', 1, 127], 5121: ['getUint8', 1, 255],
            5122: ['getInt16', 2, 32767], 5123: ['getUint16', 2, 65535],
            5125: ['getUint32', 4, 4294967295], 5126: ['getFloat32', 4, 1],
        };
        const [method, size, maximum] = readers[accessor.componentType];
        const width = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4}[accessor.type];
        const stride = source.byteStride || width * size;
        const start = (source.byteOffset || 0) + (accessor.byteOffset || 0);
        const values = [];
        for (let vertex = 0; vertex < accessor.count; vertex++) {
            for (let axis = 0; axis < width; axis++) {
                let value = binary[method](start + vertex * stride + axis * size, true);
                if (accessor.normalized) value = Math.max(-1, value / maximum);
                values.push(value);
            }
        }
        return values;
    }

    const m4 = twgl.m4;
    const parts = [];
    function visit(index, parent) {
        const node = document.nodes[index];
        let local = node.matrix || m4.identity();
        if (!node.matrix) {
            local = m4.translation(node.translation || [0, 0, 0]);
            if (node.rotation) {
                const [x, y, z, w] = node.rotation;
                const rotation = [
                    1-2*(y*y+z*z), 2*(x*y+z*w), 2*(x*z-y*w), 0,
                    2*(x*y-z*w), 1-2*(x*x+z*z), 2*(y*z+x*w), 0,
                    2*(x*z+y*w), 2*(y*z-x*w), 1-2*(x*x+y*y), 0,
                    0, 0, 0, 1,
                ];
                local = m4.multiply(local, rotation);
            }
            local = m4.scale(local, node.scale || [1, 1, 1]);
        }
        const world = m4.multiply(parent, local);
        const normalMatrix = m4.transpose(m4.inverse(world));
        if (node.mesh !== undefined) {
            const mesh = document.meshes[node.mesh];
            for (const primitive of mesh.primitives) {
                if (primitive.mode !== undefined && primitive.mode !== 4) {
                    throw new Error('O modelo precisa usar malhas trianguladas.');
                }
                const positions = readAccessor(primitive.attributes.POSITION);
                const normals = readAccessor(primitive.attributes.NORMAL);
                const indices = primitive.indices === undefined
                    ? Array.from({length: positions.length / 3}, (_, i) => i)
                    : readAccessor(primitive.indices);
                const position = [];
                const normal = [];
                for (const vertex of indices) {
                    position.push(...m4.transformPoint(world, positions.slice(vertex * 3, vertex * 3 + 3)));
                    normal.push(...twgl.v3.normalize(m4.transformDirection(normalMatrix, normals.slice(vertex * 3, vertex * 3 + 3))));
                }
                parts.push({
                    name: mesh.name,
                    position,
                    normal,
                    color: document.materials[primitive.material].pbrMetallicRoughness.baseColorFactor,
                });
            }
        }
        for (const child of node.children || []) visit(child, world);
    }
    for (const index of document.scenes[document.scene || 0].nodes) visit(index, m4.identity());
    return parts;
}
