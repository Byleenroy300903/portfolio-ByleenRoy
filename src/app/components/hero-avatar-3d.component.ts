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

type ThreeModule = typeof import('three');

@Component({
  selector: 'app-hero-avatar-3d',
  standalone: true,
  template: '<canvas #avatarCanvas class="avatar3d-canvas" aria-hidden="true"></canvas>',
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: auto;
      }

      .avatar3d-canvas {
        width: 100%;
        height: 100%;
        display: block;
        touch-action: none;
        cursor: grab;
      }

      .avatar3d-canvas:active {
        cursor: grabbing;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroAvatar3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('avatarCanvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private renderer?: import('three').WebGLRenderer;
  private scene?: import('three').Scene;
  private camera?: import('three').PerspectiveCamera;
  private root?: import('three').Group;
  private headPivot?: import('three').Group;
  private chestPivot?: import('three').Group;
  private leftUpperArm?: import('three').Mesh;
  private leftForearm?: import('three').Mesh;
  private leftHand?: import('three').Mesh;
  private rightUpperArm?: import('three').Mesh;
  private rightForearm?: import('three').Mesh;
  private rightHand?: import('three').Mesh;
  private laptopProp?: import('three').Group;
  private animationStartSec = 0;
  private baseRootY = -0.6;

  private rafId?: number;
  private resizeHandler?: () => void;
  private downHandler?: (event: PointerEvent) => void;
  private moveHandler?: (event: PointerEvent) => void;
  private upHandler?: (event: PointerEvent) => void;
  private leaveHandler?: () => void;
  private orientationHandler?: (event: DeviceOrientationEvent) => void;
  private motionPermissionHandler?: () => void;

  private targetHeadX = 0;
  private targetHeadY = 0;
  private targetChestY = 0;
  private targetRootX = 0;
  private targetRootY = 0;
  private pointerActive = false;
  private activePointerId: number | null = null;
  private lastPointerX = 0;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.zone.runOutsideAngular(async () => {
      await this.initializeScene();
      this.bindPointer();
      this.bindDeviceTilt();
      this.animate();

      this.resizeHandler = () => this.onResize();
      window.addEventListener('resize', this.resizeHandler);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    const canvas = this.canvasRef.nativeElement;
    if (this.downHandler) {
      canvas.removeEventListener('pointerdown', this.downHandler);
    }
    if (this.moveHandler) {
      canvas.removeEventListener('pointermove', this.moveHandler);
    }
    if (this.upHandler) {
      window.removeEventListener('pointerup', this.upHandler);
      window.removeEventListener('pointercancel', this.upHandler);
    }
    if (this.leaveHandler) {
      canvas.removeEventListener('pointerleave', this.leaveHandler);
    }
    if (this.orientationHandler) {
      window.removeEventListener('deviceorientation', this.orientationHandler as EventListener, true);
    }
    if (this.motionPermissionHandler) {
      canvas.removeEventListener('pointerdown', this.motionPermissionHandler);
    }

    this.renderer?.dispose();
  }

  private async initializeScene(): Promise<void> {
    const THREE: ThreeModule = await import('three');
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 360;
    const height = canvas.clientHeight || 540;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    this.camera.position.set(0, 0.1, 7.8);
    this.camera.lookAt(0, -0.52, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const hemi = new THREE.HemisphereLight(0xf2f8ff, 0x1a1f35, 1.1);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(4, 8, 6);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xbdd7ff, 0.4);
    fill.position.set(-3, 4, 4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x8fb7ff, 0.3);
    rim.position.set(-5, 4, -4);
    this.scene.add(rim);

    this.root = this.buildMinecraftAvatar(THREE);
    this.scene.add(this.root);
    this.updateSceneFraming(width, height);
  }

  private buildMinecraftAvatar(THREE: ThreeModule): import('three').Group {
    const root = new THREE.Group();
    root.position.set(0, -0.6, 0);
    root.scale.setScalar(0.8);

    const voxel = (color: number) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.02,
        flatShading: true
      });

    const skin = voxel(0xc69b7e);
    const hair = voxel(0x121212);
    const shirt = voxel(0x8fb4d9);
    const pants = voxel(0x22344f);
    const shoe = voxel(0x8b5a2b);
    const sole = voxel(0x2a2a2a);
    const frame = voxel(0x1d2024);
    const laptopBody = voxel(0x2b3440);
    const laptopScreen = voxel(0x94b8d9);
    const keyboard = voxel(0x1c232b);
    const standMat = voxel(0x364152);
    const chairMat = voxel(0x2f3846);
    const lens = new THREE.MeshStandardMaterial({
      color: 0xaec4db,
      transparent: true,
      opacity: 0.25,
      roughness: 0.35,
      metalness: 0.1,
      flatShading: true
    });

    this.chestPivot = new THREE.Group();
    this.chestPivot.position.set(0, 0, 0);
    root.add(this.chestPivot);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.35, 0.62), shirt);
    torso.position.set(0, -0.02, 0);
    this.chestPivot.add(torso);

    const waist = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.62), pants);
    waist.position.set(0, -0.92, -0.08);
    root.add(waist);

    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.95, 0);
    root.add(this.headPivot);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.9, 0.84), skin);
    head.position.set(0, 0.48, 0);
    this.headPivot.add(head);

    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.88), hair);
    hairTop.position.set(0, 0.9, 0);
    this.headPivot.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.84, 0.12), hair);
    hairBack.position.set(0, 0.5, -0.36);
    this.headPivot.add(hairBack);

    const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.66), hair);
    hairSideL.position.set(-0.4, 0.52, 0);
    this.headPivot.add(hairSideL);

    const hairSideR = hairSideL.clone();
    hairSideR.position.x = 0.4;
    this.headPivot.add(hairSideR);

    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.36, 0.16), hair);
    beard.position.set(0, 0.14, 0.35);
    this.headPivot.add(beard);

    const beardSideL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.28, 0.12), hair);
    beardSideL.position.set(-0.29, 0.2, 0.32);
    this.headPivot.add(beardSideL);

    const beardSideR = beardSideL.clone();
    beardSideR.position.x = 0.27;
    this.headPivot.add(beardSideR);

    const beardCheekL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.22), hair);
    beardCheekL.position.set(-0.33, 0.28, 0.18);
    this.headPivot.add(beardCheekL);

    const beardCheekR = beardCheekL.clone();
    beardCheekR.position.x = 0.33;
    this.headPivot.add(beardCheekR);

    const beardJaw = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.18), hair);
    beardJaw.position.set(0, 0.04, 0.24);
    this.headPivot.add(beardJaw);

    const moustache = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.08), hair);
    moustache.position.set(0, 0.3, 0.36);
    this.headPivot.add(moustache);

    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), frame);
    eyeL.position.set(-0.15, 0.5, 0.42);
    this.headPivot.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.15;
    this.headPivot.add(eyeR);

    const glassFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.03), frame);
    glassFrameL.position.set(-0.15, 0.5, 0.43);
    this.headPivot.add(glassFrameL);

    const glassFrameR = glassFrameL.clone();
    glassFrameR.position.x = 0.15;
    this.headPivot.add(glassFrameR);

    const glassBridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.03), frame);
    glassBridge.position.set(0, 0.5, 0.43);
    this.headPivot.add(glassBridge);

    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.01), lens);
    lensL.position.set(-0.15, 0.5, 0.445);
    this.headPivot.add(lensL);

    const lensR = lensL.clone();
    lensR.position.x = 0.15;
    this.headPivot.add(lensR);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), skin);
    nose.position.set(0, 0.39, 0.43);
    this.headPivot.add(nose);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.05, 0.34), shirt);
    armL.position.set(-0.64, -0.06, 0.14);
    armL.rotation.z = 0.56;
    armL.rotation.x = -0.82;
    root.add(armL);
    this.leftUpperArm = armL;

    const armR = armL.clone();
    armR.position.set(0.64, -0.06, 0.14);
    armR.rotation.z = -0.58;
    armR.rotation.x = -0.84;
    root.add(armR);
    this.rightUpperArm = armR;

    const forearmL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.32), skin);
    forearmL.position.set(-0.24, -0.54, 0.78);
    forearmL.rotation.z = 0.2;
    forearmL.rotation.x = -1.05;
    root.add(forearmL);
    this.leftForearm = forearmL;

    const forearmR = forearmL.clone();
    forearmR.position.set(0.24, -0.54, 0.78);
    forearmR.rotation.z = -0.22;
    forearmR.rotation.x = -1.02;
    root.add(forearmR);
    this.rightForearm = forearmR;

    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.28), skin);
    handL.position.set(-0.18, -0.56, 1.2);
    root.add(handL);
    this.leftHand = handL;

    const handR = handL.clone();
    handR.position.set(0.18, -0.56, 1.2);
    root.add(handR);
    this.rightHand = handR;

    const watch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.24), frame);
    watch.position.set(0.24, -0.58, 1.1);
    root.add(watch);

    // Match furniture leg height to the avatar leg span.
    const personLegHeight = 1.56;

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.16, 0.98), chairMat);
    chairSeat.position.set(0, -1.05, -0.2);
    root.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.06, 0.16), chairMat);
    chairBack.position.set(0, -0.46, -0.66);
    root.add(chairBack);

    const chairLegFL = new THREE.Mesh(new THREE.BoxGeometry(0.12, personLegHeight, 0.12), chairMat);
    chairLegFL.position.set(-0.44, -1.91, -0.62);
    root.add(chairLegFL);

    const chairLegFR = chairLegFL.clone();
    chairLegFR.position.x = 0.44;
    root.add(chairLegFR);

    const chairLegBL = chairLegFL.clone();
    chairLegBL.position.z = 0.18;
    root.add(chairLegBL);

    const chairLegBR = chairLegBL.clone();
    chairLegBR.position.x = 0.44;
    root.add(chairLegBR);

    const standTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 1.04), standMat);
    standTop.position.set(0, -0.64, 1.12);
    root.add(standTop);

    const standApronFront = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.12, 0.08), standMat);
    standApronFront.position.set(0, -0.83, 1.56);
    root.add(standApronFront);

    const standApronBack = standApronFront.clone();
    standApronBack.position.z = 0.68;
    root.add(standApronBack);

    const standLegFL = new THREE.Mesh(new THREE.BoxGeometry(0.12, personLegHeight, 0.12), standMat);
    standLegFL.position.set(-1.0, -1.49, 1.56);
    root.add(standLegFL);

    const standLegFR = standLegFL.clone();
    standLegFR.position.x = 1.0;
    root.add(standLegFR);

    const standLegBL = standLegFL.clone();
    standLegBL.position.z = 0.68;
    root.add(standLegBL);

    const standLegBR = standLegBL.clone();
    standLegBR.position.x = 1.0;
    root.add(standLegBR);

    const laptop = new THREE.Group();
    laptop.position.set(0.02, -0.57, 1.15);
    laptop.rotation.set(0.01, 0.02, -0.01);

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.06, 0.76), laptopBody);
    laptop.add(laptopBase);

    const keyDeck = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.02, 0.58), keyboard);
    keyDeck.position.set(0, 0.045, 0.08);
    laptop.add(keyDeck);

    const hingeBar = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.03, 0.03), laptopBody);
    hingeBar.position.set(0, 0.035, 0.33);
    laptop.add(hingeBar);

    const screenHinge = new THREE.Group();
    screenHinge.position.set(0, 0.035, 0.33);
    screenHinge.rotation.x = 0;
    laptop.add(screenHinge);

    const laptopScreenPanel = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.68, 0.05), laptopBody);
    laptopScreenPanel.position.set(0, 0.34, 0.04);
    screenHinge.add(laptopScreenPanel);

    const laptopDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.5, 0.01), laptopScreen);
    laptopDisplay.position.set(0, 0.34, 0.01);
    screenHinge.add(laptopDisplay);

    root.add(laptop);
    this.laptopProp = laptop;

    const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.98), pants);
    thighL.position.set(-0.24, -1.18, 0.28);
    root.add(thighL);

    const thighR = thighL.clone();
    thighR.position.x = 0.24;
    root.add(thighR);

    const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.42), pants);
    kneeL.position.set(-0.24, -1.35, 0.76);
    root.add(kneeL);

    const kneeR = kneeL.clone();
    kneeR.position.x = 0.24;
    root.add(kneeR);

    const calfL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.9, 0.36), pants);
    calfL.position.set(-0.24, -1.86, 0.78);
    root.add(calfL);

    const calfR = calfL.clone();
    calfR.position.x = 0.24;
    root.add(calfR);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.72), shoe);
    shoeL.position.set(-0.24, -2.39, 0.9);
    root.add(shoeL);

    const shoeR = shoeL.clone();
    shoeR.position.x = 0.24;
    root.add(shoeR);

    const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.72), sole);
    soleL.position.set(-0.24, -2.52, 0.9);
    root.add(soleL);

    const soleR = soleL.clone();
    soleR.position.x = 0.24;
    root.add(soleR);

    return root;
  }

  private bindPointer(): void {
    const canvas = this.canvasRef.nativeElement;
    this.downHandler = (event: PointerEvent) => {
      this.pointerActive = true;
      this.activePointerId = event.pointerId;
      this.lastPointerX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    };

    this.moveHandler = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      if (this.pointerActive && this.activePointerId === event.pointerId) {
        const dx = event.clientX - this.lastPointerX;
        this.lastPointerX = event.clientX;
        this.targetRootY += dx * 0.0055;
        this.targetRootY = Math.max(-1.15, Math.min(1.15, this.targetRootY));
      }

      this.targetHeadY = nx * 0.33;
      this.targetHeadX = -ny * 0.15;
      this.targetChestY = nx * 0.08;
    };

    this.upHandler = (event: PointerEvent) => {
      if (this.activePointerId === event.pointerId) {
        this.pointerActive = false;
        this.activePointerId = null;
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }
    };

    this.leaveHandler = () => {
      if (this.pointerActive) {
        return;
      }
      this.targetHeadX = 0;
      this.targetHeadY = 0;
      this.targetChestY = 0;
    };

    canvas.addEventListener('pointerdown', this.downHandler);
    canvas.addEventListener('pointermove', this.moveHandler);
    window.addEventListener('pointerup', this.upHandler);
    window.addEventListener('pointercancel', this.upHandler);
    canvas.addEventListener('pointerleave', this.leaveHandler);
  }

  private bindDeviceTilt(): void {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const orientationApi = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    }) | undefined;

    if (!orientationApi) {
      return;
    }

    const registerOrientation = () => {
      if (this.orientationHandler) {
        return;
      }

      this.orientationHandler = (event: DeviceOrientationEvent) => {
        const gamma = Math.max(-45, Math.min(45, event.gamma ?? 0));
        const beta = Math.max(10, Math.min(80, event.beta ?? 45));

        this.targetRootY = gamma * 0.012;
        this.targetRootX = (beta - 45) * 0.0035;
        this.targetHeadY = gamma * 0.0055;
        this.targetHeadX = -(beta - 45) * 0.0025;
        this.targetChestY = gamma * 0.0018;
      };

      window.addEventListener('deviceorientation', this.orientationHandler as EventListener, true);
    };

    if (typeof orientationApi.requestPermission === 'function') {
      this.motionPermissionHandler = () => {
        void orientationApi.requestPermission?.()
          .then((state) => {
            if (state === 'granted') {
              registerOrientation();
            }
          })
          .catch(() => undefined)
          .finally(() => {
            if (this.motionPermissionHandler) {
              canvas.removeEventListener('pointerdown', this.motionPermissionHandler);
              this.motionPermissionHandler = undefined;
            }
          });
      };

      canvas.addEventListener('pointerdown', this.motionPermissionHandler, { once: true });
      return;
    }

    registerOrientation();
  }

  private animate = (): void => {
    this.rafId = requestAnimationFrame(this.animate);

    if (!this.scene || !this.camera || !this.renderer || !this.root) {
      return;
    }

    const t = performance.now() * 0.001;
    if (this.animationStartSec === 0) {
      this.animationStartSec = t;
    }
    const elapsed = t - this.animationStartSec;
    const typingBlend = Math.max(0, Math.min(1, (elapsed - 1.4) / 0.7));
    const typingPulse = Math.sin(t * 7.4);
    const swayY = Math.sin(t * 0.9) * 0.16;
    const swayX = Math.cos(t * 0.7) * 0.04;
    const floatX = Math.sin(t * 0.9) * 0.14;

    this.root.position.x = floatX;
    this.root.position.y = this.baseRootY + Math.sin(t * 1.15) * 0.05;
    this.root.rotation.y += ((this.targetRootY + swayY) - this.root.rotation.y) * 0.1;
    this.root.rotation.x += ((this.targetRootX + swayX) - this.root.rotation.x) * 0.08;
    this.root.rotation.z = Math.sin(t * 0.52) * 0.025;

    if (this.headPivot) {
      this.headPivot.rotation.x += (this.targetHeadX - this.headPivot.rotation.x) * 0.12;
      this.headPivot.rotation.y += (this.targetHeadY - this.headPivot.rotation.y) * 0.12;
    }

    if (this.chestPivot) {
      this.chestPivot.rotation.y += (this.targetChestY - this.chestPivot.rotation.y) * 0.08;
      const breath = 1 + Math.sin(t * 2.1) * 0.02;
      this.chestPivot.scale.set(1, breath, 1);
    }

    // Initial hi with right hand, then transition to typing on laptop.
    if (this.rightUpperArm) {
      const hiZ = -1.02 + Math.sin(t * 4.2) * 0.16;
      const hiX = -0.24 + Math.cos(t * 4.2) * 0.08;
      const typeZ = -0.5 + typingPulse * 0.05;
      const typeX = -0.9 + Math.abs(typingPulse) * 0.08;
      this.rightUpperArm.rotation.z = hiZ * (1 - typingBlend) + typeZ * typingBlend;
      this.rightUpperArm.rotation.x = hiX * (1 - typingBlend) + typeX * typingBlend;
    }

    if (this.rightForearm) {
      const hiZ = -0.64 + Math.sin(t * 4.2 + 0.9) * 0.22;
      const hiX = -0.34 + Math.cos(t * 4.2 + 0.9) * 0.08;
      const typeZ = -0.18 + typingPulse * 0.06;
      const typeX = -1.06 + Math.abs(typingPulse) * 0.1;
      this.rightForearm.rotation.z = hiZ * (1 - typingBlend) + typeZ * typingBlend;
      this.rightForearm.rotation.x = hiX * (1 - typingBlend) + typeX * typingBlend;
    }

    if (this.rightHand) {
      const hiY = -0.24 + Math.sin(t * 4.2 + 1.1) * 0.1;
      const typeY = -0.56 + Math.abs(typingPulse) * 0.03;
      this.rightHand.position.y = hiY * (1 - typingBlend) + typeY * typingBlend;
      this.rightHand.position.x = 0.18 * (1 - typingBlend) + 0.22 * typingBlend;
      this.rightHand.position.z = 1.2 * (1 - typingBlend) + 1.2 * typingBlend;
    }

    if (this.leftHand) {
      this.leftHand.position.y = -0.56 + Math.sin(t * 7.4 + 1.8) * 0.03;
      this.leftHand.position.x = -0.2;
      this.leftHand.position.z = 1.2;
    }

    if (this.leftUpperArm) {
      this.leftUpperArm.rotation.z = 0.56 + Math.sin(t * 1.7) * 0.02;
      this.leftUpperArm.rotation.x = -0.84;
    }

    if (this.leftForearm) {
      this.leftForearm.rotation.z = 0.18 + Math.sin(t * 7.4 + 1.3) * 0.03;
      this.leftForearm.rotation.x = -1.06 + Math.sin(t * 7.4 + 1.3) * 0.04;
    }

    if (this.laptopProp) {
      this.laptopProp.rotation.x = 0.02 + Math.sin(t * 2.1) * 0.004;
      this.laptopProp.rotation.z = -0.01 + Math.sin(t * 2.1 + 0.6) * 0.004;
      this.laptopProp.position.y = -0.57 + Math.sin(t * 2.1) * 0.003;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 360;
    const height = canvas.clientHeight || 540;

    this.updateSceneFraming(width, height);
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private updateSceneFraming(width: number, height: number): void {
    if (!this.camera || !this.root) {
      return;
    }

    const compact = width <= 480;
    const tablet = width <= 900;

    this.camera.fov = compact ? 40 : tablet ? 36 : 34;
    this.camera.position.set(0, compact ? 0.2 : 0.1, compact ? 9.2 : tablet ? 8.4 : 7.8);
    this.camera.lookAt(0, compact ? -0.28 : -0.52, 0);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.baseRootY = compact ? -0.36 : tablet ? -0.48 : -0.6;
    this.root.scale.setScalar(compact ? 0.63 : tablet ? 0.72 : 0.8);
    this.root.position.set(0, this.baseRootY, 0);
  }
}
