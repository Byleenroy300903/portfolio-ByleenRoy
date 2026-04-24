import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-particle-background',
  standalone: true,
  template: '<canvas #canvas class="particle-canvas" aria-hidden="true"></canvas>',
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .particle-canvas {
        width: 100%;
        height: 100%;
        display: block;
        opacity: 0.9;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticleBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private threeModule?: typeof import('three');
  private renderer?: import('three').WebGLRenderer;
  private scene?: import('three').Scene;
  private camera?: import('three').PerspectiveCamera;
  private stars?: import('three').Points;
  private secondaryStars?: import('three').Points;
  private animationFrameId?: number;
  private resizeHandler?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.zone.runOutsideAngular(async () => {
      await this.initializeScene();
      this.animate();
      this.resizeHandler = () => this.onResize();
      window.addEventListener('resize', this.resizeHandler);
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    this.stars?.geometry.dispose();
    (this.stars?.material as import('three').Material | undefined)?.dispose();
    this.secondaryStars?.geometry.dispose();
    (this.secondaryStars?.material as import('three').Material | undefined)?.dispose();
    this.renderer?.dispose();
  }

  private async initializeScene(): Promise<void> {
    const THREE = await import('three');
    this.threeModule = THREE;

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 55;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(2200 * 3);

    for (let index = 0; index < vertices.length; index += 3) {
      vertices[index] = (Math.random() - 0.5) * 180;
      vertices[index + 1] = (Math.random() - 0.5) * 180;
      vertices[index + 2] = (Math.random() - 0.5) * 180;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: '#a855f7',
      size: 0.55,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);

    this.secondaryStars = new THREE.Points(
      geometry.clone(),
      new THREE.PointsMaterial({
        color: '#60a5fa',
        size: 0.25,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
    this.secondaryStars.rotation.x = 1.1;
    this.secondaryStars.rotation.z = 0.25;
    this.scene.add(this.secondaryStars);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.scene || !this.camera || !this.renderer || !this.stars || !this.secondaryStars) {
      return;
    }

    this.stars.rotation.y += 0.0009;
    this.stars.rotation.x += 0.00035;
    this.secondaryStars.rotation.y -= 0.00055;

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
