async function loadOBJModel(gl, path) {
    const url = new URL(path, document.baseURI);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar o modelo: ${path}`);
    }

    const text = await response.text();
    const positions = [[0, 0, 0]];
    const normals = [[0, 1, 0]];
    const texcoords = [[0, 0]];
    const groups = new Map();
    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];
    let materialName = '';
    let materialFile = '';

    for (const line of text.split(/\r?\n/)) {
        const [keyword, ...values] = line.trim().split(/\s+/);

        if (keyword === 'v') {
            const vertex = values.slice(0, 3).map(Number);
            positions.push(vertex);
            for (let axis = 0; axis < 3; axis++) {
                minimum[axis] = Math.min(minimum[axis], vertex[axis]);
                maximum[axis] = Math.max(maximum[axis], vertex[axis]);
            }
        } else if (keyword === 'vn') {
            normals.push(values.map(Number));
        } else if (keyword === 'vt') {
            texcoords.push(values.slice(0, 2).map(Number));
        } else if (keyword === 'mtllib') {
            materialFile = values.join(' ');
        } else if (keyword === 'usemtl') {
            materialName = values.join(' ');
        } else if (keyword === 'f') {
            if (!groups.has(materialName)) {
                groups.set(materialName, {position: [], normal: [], texcoord: []});
            }
            const arrays = groups.get(materialName);
            for (let corner = 1; corner < values.length - 1; corner++) {
                for (const vertex of [values[0], values[corner], values[corner + 1]]) {
                    const indices = vertex.split('/').map(Number);
                    for (const [key, source, index] of [
                        ['position', positions, indices[0]],
                        ['texcoord', texcoords, indices[1] || 0],
                        ['normal', normals, indices[2] || 0],
                    ]) {
                        arrays[key].push(...source[index < 0 ? source.length + index : index]);
                    }
                }
            }
        }
    }

    const materialUrl = new URL(materialFile, url);
    const materialResponse = await fetch(materialUrl);
    if (!materialResponse.ok) {
        throw new Error(`Não foi possível carregar os materiais: ${materialFile}`);
    }
    const materials = new Map();
    let material;

    for (const line of (await materialResponse.text()).split(/\r?\n/)) {
        const [keyword, ...values] = line.trim().split(/\s+/);
        if (keyword === 'newmtl') {
            material = {color: [1, 1, 1, 1]};
            materials.set(values.join(' '), material);
        } else if (material && keyword === 'Kd') {
            material.color.splice(0, 3, ...values.map(Number));
        } else if (material && keyword === 'map_Kd') {
            material.textureUrl = new URL(values.join(' '), materialUrl).href;
        }
    }

    const textures = new Map();
    const parts = await Promise.all([...groups].map(async ([name, arrays]) => {
        const material = materials.get(name);
        if (!material) throw new Error(`Material não encontrado: ${name}`);
        if (material.textureUrl && !textures.has(material.textureUrl)) {
            textures.set(material.textureUrl, loadModelTexture(gl, material.textureUrl));
        }
        return {
            bufferInfo: twgl.createBufferInfoFromArrays(gl, {
                position: {numComponents: 3, data: arrays.position},
                normal: {numComponents: 3, data: arrays.normal},
                texcoord: {numComponents: 2, data: arrays.texcoord},
            }),
            color: material.color,
            texture: material.textureUrl ? await textures.get(material.textureUrl) : null,
        };
    }));

    return {parts, minimum, maximum};
}
