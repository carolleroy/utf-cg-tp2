const canvas = document.getElementById("glCanvas");

async function start() {
    const renderer = new Renderer(canvas);
    const camera = new Camera();
    const music = document.getElementById("backgroundMusic");
    const errorMessage = document.getElementById("errorMessage");

    let tempoAnterior = 0;

    // liga todos os eventos de teclado e mouse para o canvas
    camera.bindEvents(canvas);

    const objects = await createWorld(renderer.gl, canvas);
    const glassDome = new GlassDome(renderer.gl);

    // a tecla m toca ou pausa a música após uma ação do usuário
    window.addEventListener('keydown', event => {
        if (event.code !== 'KeyM' || event.repeat) return;

        if (music.paused) {
            music.play().catch(error => {
                errorMessage.textContent = `Não foi possível reproduzir a música: ${error.message}`;
                console.error(error);
            });
        } else {
            music.pause();
        }
    });

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

