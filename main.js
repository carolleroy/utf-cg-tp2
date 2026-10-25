const canvas = document.getElementById("glCanvas");

async function start() {
    const renderer = new Renderer(canvas);
    const camera = new Camera();
    const objects = await createWorld(renderer.gl);

    function render() {
        renderer.beginFrame(camera);

        for (const object of objects) {
            renderer.draw(object);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

start().catch(error => {
    canvas.hidden = true;
    document.getElementById("errorMessage").textContent = error.message;
    console.error(error);
});
