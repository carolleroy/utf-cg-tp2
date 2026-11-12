function separateTreeStar(part) {
    const count = part.position.length / 3;
    const parents = Array.from({length: count}, (_, i) => i);
    const vertices = new Map();
    function find(index) {
        if (parents[index] !== index) parents[index] = find(parents[index]);
        return parents[index];
    }
    function join(first, second) {
        parents[find(first)] = find(second);
    }
    for (let vertex = 0; vertex < count; vertex++) {
        const key = part.position.slice(vertex * 3, vertex * 3 + 3).join(',');
        if (vertices.has(key)) join(vertex, vertices.get(key));
        else vertices.set(key, vertex);
        if (vertex % 3) join(vertex, vertex - vertex % 3);
    }

    let topVertex = 0;
    for (let vertex = 1; vertex < count; vertex++) {
        if (part.position[vertex * 3 + 1] > part.position[topVertex * 3 + 1]) topVertex = vertex;
    }
    const starRoot = find(topVertex);
    const star = {...part, position: [], normal: []};
    const ornaments = {...part, position: [], normal: []};
    for (let vertex = 0; vertex < count; vertex++) {
        const target = find(vertex) === starRoot ? star : ornaments;
        target.position.push(...part.position.slice(vertex * 3, vertex * 3 + 3));
        target.normal.push(...part.normal.slice(vertex * 3, vertex * 3 + 3));
    }
    return {star, ornaments};
}

async function createChristmasTree(gl) {
    const m4 = twgl.m4;
    const parts = await loadGLBParts('assets/models/arvore-natal/arvore-com-estrela.glb');
    const gold = parts.find(part => part.name === 'brass');
    const {star, ornaments} = separateTreeStar(gold);
    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];
    for (const part of parts) {
        for (let vertex = 0; vertex < part.position.length; vertex += 3) {
            for (let axis = 0; axis < 3; axis++) {
                minimum[axis] = Math.min(minimum[axis], part.position[vertex + axis]);
                maximum[axis] = Math.max(maximum[axis], part.position[vertex + axis]);
            }
        }
    }
    const scale = 1.25 / (maximum[1] - minimum[1]);
    const root = {worldMatrix: m4.scale(m4.translation([0.7356, 0.101, -1.0132]), [scale, scale, scale])};
    root.worldMatrix = m4.translate(root.worldMatrix, [0, -minimum[1], 0]);
    const pivot = [0, 1, 2].map(axis => {
        const values = star.position.filter((_, index) => index % 3 === axis);
        return (Math.min(...values) + Math.max(...values)) / 2;
    });

    function createPart(part, spinning = false) {
        const object = {
            bufferInfo: twgl.createBufferInfoFromArrays(gl, {
                position: {numComponents: 3, data: part.position},
                normal: {numComponents: 3, data: part.normal},
                texcoord: {numComponents: 2, data: new Float32Array(part.position.length / 3 * 2)},
            }),
            color: part.color,
            worldMatrix: root.worldMatrix,
            parent: root,
        };
        if (spinning) {
            object.update = time => {
                let matrix = m4.translate(root.worldMatrix, pivot);
                matrix = m4.rotateY(matrix, time * 0.9);
                object.worldMatrix = m4.translate(matrix, pivot.map(value => -value));
            };
        } else {
            object.update = () => { object.worldMatrix = root.worldMatrix; };
        }
        return object;
    }
    return [...parts.filter(part => part !== gold), ornaments].map(part => createPart(part)).concat(createPart(star, true));
}
