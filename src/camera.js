class Camera {
    constructor() {
        this.target = [0, 0, 0];
        this.distance = 9;
        this.azimuth = Math.PI / 6;
        this.elevation = Math.PI / 4;
        this.fieldOfView = Math.PI / 4;
        this.near = 0.1;
        this.far = 100;
    }

    getViewProjection(aspect) {
        const m4 = twgl.m4;
        const horizontalDistance = this.distance * Math.cos(this.elevation);
        const eye = [
            this.target[0] + horizontalDistance * Math.sin(this.azimuth),
            this.target[1] + this.distance * Math.sin(this.elevation),
            this.target[2] + horizontalDistance * Math.cos(this.azimuth),
        ];
        const fieldOfView = 2 * Math.atan(Math.tan(this.fieldOfView / 2) / Math.min(aspect, 1));
        const projection = m4.perspective(fieldOfView, aspect, this.near, this.far);
        const view = m4.inverse(m4.lookAt(eye, this.target, [0, 1, 0]));
        return m4.multiply(projection, view);
    }
}
