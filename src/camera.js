class Camera {
    constructor() {
        // define o centro da cena e a distância de visão
        this.target = [0, 0, 0];
        this.distance = 9;

        this.minDist = 4;
        this.maxDist= 25;

        // controla a posição horizontal e vertical da câmera
        this.anguloHorizontal = Math.PI / 6;
        this.elevation = Math.PI / 4;
        this.fieldOfView = Math.PI / 4;
        this.near = 0.1;
        this.far = 100;

        //adiciona estado das duas cameras
        this.mode = 1; // 1: auto-rotação 45º | 2: orbital livre
        this.rotationSpeed = 0.5; // velocidade da Câmera 1 (rad/s)
        this.isInteracting = false;
        this.posicaoAnteriorMouse = { x: 0, y: 0 };
        this.sensibilidade = 0.005;
    }

    // ADICIONEI: TECLADO E MOUSE
    bindEvents(canvasElement) {
        // alterna aâmeras 1 e 2
        window.addEventListener('keydown', (event) => {
            if (event.key === '1') {
                this.mode = 1;
                this.elevation = Math.PI / 4; // Volta para 45º na câmera 1
            } else if (event.key === '2') {
                this.mode = 2;
            }
        });

        // zoom no Scroll (Cam 1)
        canvasElement.addEventListener('wheel', (event) => {
            if (this.mode === 1) {
                event.preventDefault();
                this.distance += event.deltaY * 0.04; //aumentar um pouco pra nn fazer um zoom muito pequeno e NEM muito grande
                this.distance = Math.max(this.minDist, Math.min(this.maxDist, this.distance));
            }
        }, { passive: false });

        // CLICA E ARRASTA do Mouse (Câmera 2 )
        canvasElement.addEventListener('mousedown', (event) => {
            if (event.button === 0 && this.mode === 2) {
                this.isInteracting = true;
                this.posicaoAnteriorMouse = { x: event.clientX, y: event.clientY };
            }
        });

        window.addEventListener('mousemove', (event) => {
            if (!this.isInteracting || this.mode !== 2) return;

            const deltaX = event.clientX - this.posicaoAnteriorMouse.x;
            const deltaY = event.clientY - this.posicaoAnteriorMouse.y;

            this.anguloHorizontal -= deltaX * this.sensibilidade;
            this.elevation += deltaY * this.sensibilidade;

            // Limite de elevação para não virar de ponta-cabeça pelo visto
            const maxElevacao = Math.PI / 2 - 0.05;
            this.elevation = Math.max(-maxElevacao, Math.min(maxElevacao, this.elevation));

            this.posicaoAnteriorMouse = { x: event.clientX, y: event.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isInteracting = false;
        });
    }

    // animacao camera 1
    update(variacaoTempo) {
        if (this.mode === 1) {
            this.anguloHorizontal += this.rotationSpeed * variacaoTempo;
        }
    }

    getViewProjection(aspect) {
        const m4 = twgl.m4;
        // calcula a posição da câmera ao redor do alvo
        const horizontalDistance = this.distance * Math.cos(this.elevation);
        const eye = [
            this.target[0] + horizontalDistance * Math.sin(this.anguloHorizontal),
            this.target[1] + this.distance * Math.sin(this.elevation),
            this.target[2] + horizontalDistance * Math.cos(this.anguloHorizontal),
        ];
        // ajusta o campo de visão e cria as matrizes da câmera
        const fieldOfView = 2 * Math.atan(Math.tan(this.fieldOfView / 2) / Math.min(aspect, 1));
        const projection = m4.perspective(fieldOfView, aspect, this.near, this.far);
        const view = m4.inverse(m4.lookAt(eye, this.target, [0, 1, 0]));
        return m4.multiply(projection, view);
    }
}
