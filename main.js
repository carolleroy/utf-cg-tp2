const canvas = document.getElementById("glCanvas");

async function start() {
    const renderer = new Renderer(canvas);
    const camera = new Camera();

    let tempoAnterior = 0;

    // liga todos os eventos de teclado e mouse para o canvas
    camera.bindEvents(canvas);

    const objects = await createWorld(renderer.gl);
    const glassDome = new GlassDome(renderer.gl);

    function render(tempoAtual = 0) {
        // converte de milissegundos para segundos
        tempoAtual *= 0.001;
        const variacaoTempo = tempoAnterior === 0 ? 0 : tempoAtual - tempoAnterior;
        tempoAnterior = tempoAtual;
        // passa a variação de tempo para atualizar a animação da câmera
        renderer.beginFrame(camera, variacaoTempo);

        for (const animated of objects) {
            if (animated.update) animated.update(tempoAtual);
        }

        for (const object of objects) {
            renderer.draw(object);
        }

        glassDome.draw(camera, renderer.viewProjection);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

start().catch(error => {
    canvas.hidden = true;
    document.getElementById("errorMessage").textContent = error.message;
    console.error(error);
});
