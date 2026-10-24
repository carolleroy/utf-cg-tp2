const canvas = document.getElementById("glCanvas");

function start() {
    const renderer = new Renderer(canvas);
    const objects = createWorld(renderer.gl);

    function render() {
        renderer.beginFrame();

        for (const object of objects) {
            renderer.draw(object);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

try {
    start();
} catch (error) {
    canvas.hidden = true;
    document.getElementById("errorMessage").textContent = error.message;
    console.error(error);
}
