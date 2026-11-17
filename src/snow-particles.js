function createSnowParticles(gl, worldObjects) {
    const m4 = twgl.m4;
    const canvas = document.getElementById('glCanvas');
    // define a quantidade de flocos, a altura do chão e o tamanho da cúpula
    const count = 30;
    const floorY = -0.055;
    const domeRaio = 2.2;
    const domeCenterY = -1.29 + Math.sqrt(domeRaio ** 2 - 1.57 ** 2);
    // todos os flocos compartilham a mesma malha de esfera para economizar memória
    const bufferEsfera = twgl.primitives.createSphereBufferInfo(gl, 1, 8, 6);

    // cada clique no canvas cria mais flocos sem reiniciar os anteriores
    canvas.addEventListener('click', () => {
        const lote = criarLote(performance.now() * 0.001);
        worldObjects.push(...lote);

        // remove o grupo depois que os flocos terminarem de cair
        window.setTimeout(() => {
            for (const particula of lote) {
                const indice = worldObjects.indexOf(particula);
                if (indice !== -1) worldObjects.splice(indice, 1);
            }
        }, 6000);
    });

    // cria um grupo com tamanhos, posições e tempos variados
    function criarLote(startTime) {
        return Array.from({length: count}, () => {
            const startAngle = Math.random() * Math.PI * 2;
            const orbitRadius = Math.sqrt(Math.random()) * 1.72;
            const size = 0.018 + Math.random() * 0.022;

            // limita a altura para que cada esfera permaneça dentro da cúpula
            const ceilingY = domeCenterY
                + Math.sqrt(domeRaio ** 2 - orbitRadius ** 2)
                - size * 2;
            // escolhe um ponto máximo diferente para cada floco
            const alturaPico = floorY + (ceilingY - floorY) * (0.55 + Math.random() * 0.4);
            // varia o atraso e a duração para os flocos não se moverem juntos
            const delay = Math.random() * 0.35;
            const riseDuration = 1.2 + Math.random() * 0.8;
            const fallDuration = 2.4 + Math.random() * 0.8;
            const angularSpeed = 0.8 + Math.random() * 1.2;
            const cor = [0.88, 0.95, 1, 0];

            return {
                bufferInfo: bufferEsfera,
                worldMatrix: m4.identity(),
                color: cor,
                update(tempo) {
                    // esconde o floco antes e depois da animação
                    const elapsed = tempo - startTime - delay;
                    const duration = riseDuration + fallDuration;
                    if (elapsed < 0 || elapsed > duration) {
                        cor[3] = 0;
                        return;
                    }

                    cor[3] = 1;
                    let y;
                    if (elapsed < riseDuration) {
                        // sobe suavemente do chão até o pico escolhido
                        const progress = elapsed / riseDuration;
                        const eased = progress * progress * (3 - 2 * progress);
                        y = floorY + (alturaPico - floorY) * eased;
                    } else {
                        // desce suavemente do pico de volta ao chão
                        const progress = (elapsed - riseDuration) / fallDuration;
                        const eased = progress * progress * (3 - 2 * progress);
                        y = alturaPico + (floorY - alturaPico) * eased;
                    }

                    // gira em torno do centro para dar movimento de neve agitada
                    const angle = startAngle + elapsed * angularSpeed;
                    let worldMatrix = m4.translation([
                        Math.cos(angle) * orbitRadius,
                        y,
                        Math.sin(angle) * orbitRadius,
                    ]);
                    worldMatrix = m4.scale(worldMatrix, [size, size, size]);
                    this.worldMatrix = worldMatrix;
                },
            };
        });
    }
}
