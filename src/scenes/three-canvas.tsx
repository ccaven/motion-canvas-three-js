import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { SimpleSignal, createSignal } from "@motion-canvas/core/lib/signals";
import * as THREE from 'three';

export interface ThreeCanvasProps extends NodeProps {
    canvasWidth: number,
    canvasHeight: number
}

export class ThreeCanvas extends Node {
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    
    public readonly scene: THREE.Scene;
    public readonly camera: THREE.PerspectiveCamera;
    public readonly objects: DynamicObject3D[] = [];

    constructor(props: ThreeCanvasProps) {
        super(props);

        this.canvas = document.createElement("canvas");
        this.canvas.width = props.canvasWidth;
        this.canvas.height = props.canvasHeight;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 100.0);

        this.objects.push(new DynamicObject3D(this.camera));

        this.renderer.clear(true);
    }

    getCamera = () => this.objects[0];

    addDynamicObject(o: DynamicObject3D) {
        this.objects.push(o);
    }

    render(context: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.objects.length; i ++) {
            this.objects[i].update();
        }

        this.renderer.render(this.scene, this.camera);

        context.drawImage(
            this.canvas, 
            this.position.x() - this.canvas.width / 2,
            this.position.y() - this.canvas.height / 2
        );
    }
}

export class DynamicObject3D {
    object: THREE.Object3D;
    
    readonly position: SimpleSignal<[number, number, number], this>;
    readonly scale: SimpleSignal<[number, number, number], this>;
    readonly quaternion: SimpleSignal<[number, number, number, number], this>;

    constructor(original: THREE.Object3D) {
        this.object = original;
        this.position = createSignal([this.object.position.x, this.object.position.y, this.object.position.z]);
        this.scale = createSignal([this.object.scale.x, this.object.scale.y, this.object.scale.z]);
        this.quaternion = createSignal([this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w]);
    }

    addTo(parent: THREE.Object3D) {
        parent.add(this.object);
    }

    update() {
        this.object.position.set(...this.position());
        this.object.scale.set(...this.scale());
        this.object.quaternion.set(...this.quaternion());
    }
}