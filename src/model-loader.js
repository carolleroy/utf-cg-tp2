async function loadModelTexture(gl, textureUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(twgl.createTexture(gl, {
            src: image,
            flipY: true,
            wrap: gl.CLAMP_TO_EDGE,
        }));
        image.onerror = () => reject(new Error(`Não foi possível carregar a textura: ${textureUrl}`));
        image.src = textureUrl;
    });
}

async function loadTexturedModel(gl, modelUrl, textureUrl) {
    const response = await fetch(modelUrl);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar o modelo: ${modelUrl}`);
    }

    const arrays = await response.json();
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    const texture = await loadModelTexture(gl, textureUrl);
    return {bufferInfo, texture};
}
