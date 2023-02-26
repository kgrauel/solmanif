
import './index.css';
import CONFIG from './config';

class Application {
    canvasElement: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    // timing
    lastFrameTime: number = 0;
    deltaTime: number = 0;
    framesRendered: number = 0;
    frameDeltaHistory: number[] = [];
    avgFPS: number = 0;

    constructor() {
        this.canvasElement = <HTMLCanvasElement>document.getElementById(CONFIG.canvasElementID);
        this.canvasContext = this.canvasElement.getContext('2d');

        this.canvasElement.width = CONFIG.renderDimensions[0];
        this.canvasElement.height = CONFIG.renderDimensions[1];

        this.wireEventHandlers();
    }

    wireEventHandlers() {
        window.addEventListener('resize', (e) => {
            this.onWindowResize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('DOMContentLoaded', (e) => {
            this.onWindowResize(window.innerWidth, window.innerHeight);
        });

        window.requestAnimationFrame(this.onFrameRequested.bind(this));
    }

    onWindowResize(w: number, h: number, dpr: number = window.devicePixelRatio) {
        console.log(`Window resized to ${w}x${h}`);

        // We want to center the canvas in the middle of the screen,
        // but we also need to make sure that the aspect ratio is correct.
        // So we'll need to figure out which dimension is the limiting factor.

        const canvasAspectRatio = CONFIG.renderDimensions[0] / CONFIG.renderDimensions[1];
        const windowAspectRatio = w / h;

        // Use CSS styles to position the canvas in the middle of the screen.

        if (windowAspectRatio <= canvasAspectRatio) {
            // The window is wider than the canvas, so we'll need to limit
            // the width of the canvas to fit the window.
            this.canvasElement.style.width = `${w}px`;
            this.canvasElement.style.height = `${w / canvasAspectRatio}px`;
            this.canvasElement.style.top = `${(h - (w / canvasAspectRatio)) / 2}px`;
            this.canvasElement.style.left = '0px';
        } else {
            // The window is taller than the canvas, so we'll need to limit
            // the height of the canvas to fit the window.
            this.canvasElement.style.width = `${h * canvasAspectRatio}px`;
            this.canvasElement.style.height = `${h}px`;
            this.canvasElement.style.top = '0px';
            this.canvasElement.style.left = `${(w - (h * canvasAspectRatio)) / 2}px`;
        }
    }

    updateTiming() {
        const now = performance.now() / 1000;

        if (this.lastFrameTime === 0) {
            this.lastFrameTime = now;
        }

        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // update frame delta history
        this.frameDeltaHistory.push(this.deltaTime);
        if (this.frameDeltaHistory.length > CONFIG.frameTimeHistoryLength) {
            this.frameDeltaHistory.shift();
        }

        // calculate average FPS
        let totalDelta = 0;
        for (let i = 0; i < this.frameDeltaHistory.length; i++) {
            totalDelta += this.frameDeltaHistory[i];
        }
        this.avgFPS = 1 / (totalDelta / this.frameDeltaHistory.length);
    }

    render() {
        // test speed by writing pixel data to the canvas
        const imageData = this.canvasContext.createImageData(this.canvasElement.width, this.canvasElement.height)
        const data = imageData.data;

        const [w, h] = CONFIG.renderDimensions;
        const t = this.framesRendered;
        for (let cycle = 0; cycle < 1; cycle++) {
            for (let row = 0; row < h; row++) {
                let i = (row * w) * 4;
                for (let col = 0; col < w; col++) {
                    data[i + 0] = (row + t) % 256;
                    data[i + 1] = (col + t) % 256;
                    data[i + 2] = (row + col) % 256;
                    data[i + 3] = 255;
                    i += 4;
                }
            }
        }

        this.canvasContext.putImageData(imageData, 0, 0);

        // overlay
        document.getElementById("frame").innerText = `${this.framesRendered}`;
        document.getElementById("delta").innerText = `${(this.deltaTime * 1000).toFixed(2)}`;
        document.getElementById("fps").innerText = `${this.avgFPS.toFixed(1)}`;
    }

    onFrameRequested() {
        this.updateTiming();
        this.render();

        this.framesRendered++;
        window.requestAnimationFrame(this.onFrameRequested.bind(this));
    }
}

const app = new Application();
