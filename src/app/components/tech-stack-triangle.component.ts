import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Bodies,
  Body,
  Composite,
  Engine,
  Mouse,
  MouseConstraint,
  Runner,
  Vector,
  World
} from 'matter-js';

interface StackLogo {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-tech-stack-triangle',
  standalone: true,
  template: `
    <div class="tech-triangle">
      <div class="tech-triangle__header">
        <div class="tech-triangle__headline">
          <p class="tech-triangle__title">Tech Stack Reactor</p>
        </div>
        <div class="tech-triangle__controls">
          <button
            class="tech-triangle__control"
            type="button"
            (click)="remixStack()"
            aria-label="Remix logo flow"
          >
            Remix
          </button>
          <button
            class="tech-triangle__control"
            type="button"
            (click)="toggleInvert()"
            [attr.aria-label]="inverted ? 'Switch to normal gravity' : 'Switch to inverted gravity'"
          >
            {{ inverted ? 'Standard' : 'Flip Flow' }}
          </button>
        </div>
      </div>

      <div
        #arena
        class="tech-triangle__arena"
        [class.inverted]="inverted"
        [class.tech-triangle__arena--burst]="burstActive"
        aria-label="Falling tech logo triangle"
      >
        <div class="tech-triangle__aurora" aria-hidden="true"></div>
        <div class="tech-triangle__scanline" aria-hidden="true"></div>
        <div class="tech-triangle__outline" aria-hidden="true"></div>
        <div class="tech-triangle__neck" aria-hidden="true"></div>

        @for (spark of sparks; track spark) {
          <span class="tech-triangle__spark" [style.--spark-index]="spark" aria-hidden="true"></span>
        }

        @for (stack of stacks; track stack.name) {
          <div #chipRef class="tech-chip" [attr.aria-label]="stack.name">
            <div class="tech-chip__body">
              <img [src]="stack.logo" [alt]="stack.name + ' logo'" loading="eager" />
            </div>
            <div class="tech-chip__tooltip">{{ stack.name }}</div>
          </div>
        }
      </div>

      <div class="tech-triangle__status">
        <span class="tech-triangle__status-pill">Mode: {{ inverted ? 'Inverted Flow' : 'Standard Flow' }}</span>
        <span class="tech-triangle__status-pill">Nodes: {{ stacks.length }}</span>
        <span class="tech-triangle__status-pill">Remix: Scatter + Re-stack</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .tech-triangle {
        margin: 0 auto 2rem;
        max-width: 720px;
        padding: 0.4rem 0.35rem 0.2rem;
        border-radius: 26px;
        background: linear-gradient(180deg, rgba(245, 210, 155, 0.08), rgba(56, 189, 248, 0.06));
        box-shadow: inset 0 0 0 1px rgba(245, 210, 155, 0.18);
      }

      .tech-triangle__header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.95rem;
      }

      .tech-triangle__headline {
        display: grid;
        gap: 0.3rem;
      }

      .tech-triangle__title {
        margin: 0;
        text-align: left;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-size: 0.74rem;
        color: rgba(245, 210, 155, 0.9);
      }

      .tech-triangle__subtitle {
        margin: 0;
        color: rgba(223, 236, 255, 0.72);
        font-size: 0.82rem;
      }

      .tech-triangle__controls {
        display: flex;
        gap: 0.55rem;
      }

      .tech-triangle__control {
        border: 1px solid rgba(245, 210, 155, 0.42);
        background: linear-gradient(120deg, rgba(245, 210, 155, 0.2), rgba(56, 189, 248, 0.17));
        color: rgba(248, 236, 209, 0.98);
        border-radius: 0.75rem;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 600;
        height: 2rem;
        min-width: 4.25rem;
        padding: 0 0.8rem;
        cursor: pointer;
        transition: transform 0.2s ease, filter 0.2s ease;
      }

      .tech-triangle__control:hover {
        transform: translateY(-1px);
        filter: brightness(1.08);
      }

      .tech-triangle__arena {
        --triangle-tilt: 0deg;
        --triangle-scale-y: 1;
        position: relative;
        width: min(100%, 620px);
        height: min(64vw, 420px);
        margin: 0 auto;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(245, 210, 155, 0.22);
        background:
          radial-gradient(circle at 20% 18%, rgba(251, 191, 36, 0.16), transparent 35%),
          radial-gradient(circle at 80% 6%, rgba(45, 212, 191, 0.14), transparent 40%),
          radial-gradient(circle at 50% 82%, rgba(56, 189, 248, 0.14), transparent 45%),
          linear-gradient(180deg, rgba(5, 8, 22, 0.92), rgba(8, 17, 34, 0.95));
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 16px 40px rgba(7, 10, 28, 0.35);
      }

      .tech-triangle__arena::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        background-size: 22px 22px;
        opacity: 0.25;
        pointer-events: none;
      }

      .tech-triangle__arena--burst {
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 0 2px rgba(250, 204, 21, 0.25), 0 22px 50px rgba(7, 10, 28, 0.45);
      }

      .tech-triangle__aurora {
        position: absolute;
        inset: -20% -10%;
        background: conic-gradient(from 120deg at 50% 50%, rgba(251, 191, 36, 0.2), rgba(56, 189, 248, 0.16), rgba(34, 197, 94, 0.14), rgba(251, 191, 36, 0.2));
        filter: blur(36px);
        opacity: 0.56;
        animation: auroraSpin 24s linear infinite;
      }

      .tech-triangle__scanline {
        position: absolute;
        inset: -30% 0;
        background: linear-gradient(180deg, transparent 0%, rgba(245, 210, 155, 0.1) 48%, transparent 100%);
        animation: scanlineDrift 5.8s ease-in-out infinite;
      }

      .tech-triangle__outline {
        position: absolute;
        left: 50%;
        bottom: 8%;
        width: 84%;
        height: 84%;
        transform: translateX(-50%) rotate(var(--triangle-tilt)) scaleY(var(--triangle-scale-y));
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        border: 2px solid rgba(245, 210, 155, 0.38);
        background: linear-gradient(180deg, rgba(245, 210, 155, 0.1), rgba(245, 210, 155, 0));
        filter: drop-shadow(0 0 18px rgba(245, 210, 155, 0.26));
        pointer-events: none;
        transition: transform 0.5s ease;
      }

      .tech-triangle__neck {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 18%;
        height: 18px;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        background: radial-gradient(circle, rgba(245, 210, 155, 0.48), rgba(245, 210, 155, 0.02));
        filter: blur(1px);
      }

      .tech-triangle__spark {
        --travel: calc((var(--spark-index) + 1) * 3.8%);
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        left: calc(8% + var(--travel));
        top: calc(12% + var(--travel));
        background: rgba(226, 240, 255, 0.8);
        box-shadow: 0 0 10px rgba(226, 240, 255, 0.7);
        opacity: 0.32;
        animation: sparkPulse calc(2.2s + (var(--spark-index) * 0.18s)) ease-in-out infinite;
      }

      .tech-triangle__arena.inverted .tech-triangle__outline {
        --triangle-scale-y: -1;
      }

      .tech-chip {
        position: absolute;
        width: 52px;
        height: 52px;
        user-select: none;
        -webkit-user-drag: none;
        will-change: transform;
        transform: translate3d(0, 0, 0);
        cursor: grab;
        transition: filter 0.2s ease;
      }

      .tech-chip__body {
        position: absolute;
        inset: 0;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: rgba(250, 252, 255, 0.95);
        border: 1.2px solid rgba(251, 191, 36, 0.4);
        box-shadow: 0 10px 24px rgba(2, 8, 23, 0.28);
        will-change: transform;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      }

      .tech-chip__body::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: linear-gradient(140deg, rgba(250, 204, 21, 0.35), rgba(56, 189, 248, 0.3));
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: -1;
      }

      .tech-chip:active {
        cursor: grabbing;
      }

      .tech-chip:hover .tech-chip__body {
        box-shadow: 0 14px 30px rgba(2, 8, 23, 0.38), 0 0 16px rgba(250, 204, 21, 0.35);
      }

      .tech-triangle__arena--burst .tech-chip .tech-chip__body {
        box-shadow: 0 14px 30px rgba(2, 8, 23, 0.4), 0 0 18px rgba(56, 189, 248, 0.38);
      }

      .tech-chip:hover .tech-chip__body::before {
        opacity: 1;
      }

      .tech-chip img {
        width: 30px;
        height: 30px;
        object-fit: contain;
        pointer-events: none;
      }

      .tech-chip__tooltip {
        position: absolute;
        bottom: -32px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        color: rgba(245, 210, 155, 0.96);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        letter-spacing: 0.05em;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 10;
      }

      .tech-chip:hover .tech-chip__tooltip {
        opacity: 1;
      }

      .tech-triangle__status {
        margin: 0.8rem auto 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        justify-content: center;
      }

      .tech-triangle__status-pill {
        padding: 0.32rem 0.7rem;
        border-radius: 999px;
        font-size: 0.68rem;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: rgba(232, 240, 255, 0.84);
        border: 1px solid rgba(245, 210, 155, 0.3);
        background: rgba(10, 18, 34, 0.58);
      }

      @keyframes auroraSpin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      @keyframes scanlineDrift {
        0% {
          transform: translateY(-30%);
          opacity: 0.2;
        }

        50% {
          opacity: 0.5;
        }

        100% {
          transform: translateY(60%);
          opacity: 0.2;
        }
      }

      @keyframes sparkPulse {
        0%,
        100% {
          opacity: 0.2;
          transform: scale(1);
        }

        50% {
          opacity: 0.85;
          transform: scale(1.45);
        }
      }

      @media (max-width: 720px) {
        .tech-triangle {
          margin-bottom: 1.3rem;
          padding-inline: 0.2rem;
        }

        .tech-triangle__header {
          justify-content: center;
          gap: 0.7rem;
        }

        .tech-triangle__headline {
          text-align: center;
        }

        .tech-triangle__title,
        .tech-triangle__subtitle {
          text-align: center;
        }

        .tech-triangle__arena {
          height: min(78vw, 320px);
        }

        .tech-chip {
          width: 44px;
          height: 44px;
        }

        .tech-chip__body {
          border-radius: 12px;
        }

        .tech-chip img {
          width: 26px;
          height: 26px;
        }
      }

      @media (max-width: 480px) {
        .tech-triangle {
          padding: 0.3rem 0.1rem 0.1rem;
          border-radius: 20px;
        }

        .tech-triangle__header {
          margin-bottom: 0.7rem;
        }

        .tech-triangle__controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .tech-triangle__control {
          min-width: 3.7rem;
          height: 1.85rem;
          padding: 0 0.65rem;
          font-size: 0.64rem;
        }

        .tech-triangle__arena {
          height: min(84vw, 280px);
          border-radius: 18px;
        }

        .tech-chip {
          width: 40px;
          height: 40px;
        }

        .tech-chip img {
          width: 22px;
          height: 22px;
        }

        .tech-triangle__status {
          gap: 0.35rem;
        }

        .tech-triangle__status-pill {
          font-size: 0.6rem;
          padding: 0.28rem 0.55rem;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechStackTriangleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('arena', { static: true })
  private readonly arenaRef!: ElementRef<HTMLDivElement>;

  @ViewChildren('chipRef')
  private readonly chipRefs!: QueryList<ElementRef<HTMLDivElement>>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly stacks: StackLogo[] = [
    { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
    { name: 'C', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
    { name: 'Angular', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
    { name: 'Spring Boot', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
    { name: 'Hedera Hashgraph', logo: 'https://cdn.simpleicons.org/hedera' },
    { name: 'RxJS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rxjs/rxjs-original.svg' },
    { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    { name: 'Testing Frameworks', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg' },
    { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'Flutter', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' },
    { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    { name: 'OpenCV', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg' },
    { name: 'TensorFlow', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg' },
    { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
    { name: 'Linux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' }
  ];
  protected readonly sparks = Array.from({ length: 14 }, (_, index) => index);

  protected inverted = false;
  protected burstActive = false;

  private engine?: Engine;
  private runner?: Runner;
  private animationFrameId?: number;
  private resizeHandler?: () => void;
  private deviceOrientationHandler?: (event: DeviceOrientationEvent) => void;
  private deviceMotionHandler?: (event: DeviceMotionEvent) => void;
  private motionPermissionHandler?: () => void;
  private chipBodies: Body[] = [];
  private burstTimeoutId?: number;
  private lastShakeAt = 0;
  private readonly baseGravity = 0.24;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializePhysics();
        this.bindMobileMotion();
        this.resizeHandler = () => this.initializePhysics();
        window.addEventListener('resize', this.resizeHandler);
      }, 50);
    });
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    if (this.burstTimeoutId !== undefined) {
      window.clearTimeout(this.burstTimeoutId);
      this.burstTimeoutId = undefined;
    }

    if (this.deviceOrientationHandler) {
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler as EventListener, true);
    }

    if (this.deviceMotionHandler) {
      window.removeEventListener('devicemotion', this.deviceMotionHandler as EventListener, true);
    }

    if (this.motionPermissionHandler) {
      this.arenaRef.nativeElement.removeEventListener('pointerdown', this.motionPermissionHandler);
    }

    this.teardownPhysics();
  }

  toggleInvert(): void {
    this.inverted = !this.inverted;
    this.cdr.markForCheck();
    this.initializePhysics();
  }

  remixStack(): void {
    if (this.chipBodies.length === 0) {
      return;
    }

    const arena = this.arenaRef.nativeElement;
    const width = arena.clientWidth;
    const height = arena.clientHeight;
    const cx = width * 0.5;
    const remixOriginY = this.inverted ? height * 0.64 : height * 0.36;

    this.triggerBurst();

    this.chipBodies.forEach((body, index) => {
      const lane = (index / Math.max(this.chipBodies.length - 1, 1)) - 0.5;
      const startX = cx + lane * width * 0.44;
      const startY = remixOriginY + (Math.random() - 0.5) * 34;

      Body.setPosition(body, { x: startX, y: startY });
      Body.setVelocity(body, {
        x: lane * 4.2 + (Math.random() - 0.5) * 1.6,
        y: (this.inverted ? 1 : -1) * (3.6 + Math.random() * 2.4)
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.22);
      Body.applyForce(body, body.position, {
        x: lane * 0.0012,
        y: (this.inverted ? 1 : -1) * 0.0012
      });
    });
  }

  private initializePhysics(): void {
    this.teardownPhysics();

    const arena = this.arenaRef.nativeElement;
    const chips = this.chipRefs.toArray().map((ref) => ref.nativeElement);
    if (!chips.length) {
      return;
    }

    const width = arena.clientWidth;
    const height = arena.clientHeight;
    if (!width || !height) {
      return;
    }

    const gravityY = this.inverted ? -this.baseGravity : this.baseGravity;
    const engine = Engine.create({
      gravity: { x: 0, y: gravityY }
    });
    this.engine = engine;

    const cx = width * 0.5;
    const apexY = this.inverted ? height * 0.88 : height * 0.12;
    const baseY = this.inverted ? height * 0.12 : height * 0.88;
    const halfBase = width * 0.34;
    const wallThickness = 18;
    const radius = Math.max(20, Math.min(26, width * 0.045));

    const apex = Vector.create(cx, apexY);
    const leftBase = Vector.create(cx - halfBase, baseY);
    const rightBase = Vector.create(cx + halfBase, baseY);

    const createEdgeWall = (a: Vector, b: Vector) => {
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y) + wallThickness;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);

      return Bodies.rectangle(midX, midY, len, wallThickness, {
        isStatic: true,
        angle,
        restitution: 0.2,
        friction: 0.24
      });
    };

    // Extended base barrier to fully block icons from dropping below the triangle.
    const baseWall = Bodies.rectangle(cx, baseY, width + wallThickness * 2, wallThickness, {
      isStatic: true,
      restitution: 0.2,
      friction: 0.24
    });
    const leftWall = createEdgeWall(apex, leftBase);
    const rightWall = createEdgeWall(apex, rightBase);

    const mouse = Mouse.create(arena);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.12,
        render: { visible: false }
      }
    });

    const spawnCenterY = this.inverted ? apexY + 26 : apexY - 26;
    const bodies = chips.map((_, index) =>
      Bodies.circle(
        cx + (Math.random() - 0.5) * width * 0.08,
        spawnCenterY + (this.inverted ? 1 : -1) * index * 22,
        radius,
        {
          restitution: 0.24,
          friction: 0.06,
          frictionAir: 0.04,
          density: 0.0014
        }
      )
    );
    this.chipBodies = bodies;

    World.add(engine.world, [baseWall, leftWall, rightWall, mouseConstraint, ...bodies]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    this.runner = runner;

    const renderLoop = () => {
      this.animationFrameId = window.requestAnimationFrame(renderLoop);

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const chip = chips[i];
        if (!body || !chip) {
          continue;
        }

        const chipBody = chip.firstElementChild as HTMLDivElement | null;

        if (body.speed > 4) {
          Body.setVelocity(body, {
            x: body.velocity.x * 0.85,
            y: body.velocity.y * 0.85
          });
        }

        chip.style.transform = `translate3d(${body.position.x - radius}px, ${body.position.y - radius}px, 0)`;

        if (chipBody) {
          chipBody.style.transform = `rotate(${body.angle}rad)`;
        }
      }
    };

    renderLoop();
  }

  private bindMobileMotion(): void {
    if (!window.matchMedia('(pointer: coarse) and (max-width: 900px)').matches) {
      return;
    }

    const arena = this.arenaRef.nativeElement;
    const orientationApi = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    }) | undefined;
    const motionApi = window.DeviceMotionEvent as (typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    }) | undefined;

    const registerMotion = () => {
      if (!this.deviceOrientationHandler) {
        this.deviceOrientationHandler = (event: DeviceOrientationEvent) => this.applyTiltMotion(event);
        window.addEventListener('deviceorientation', this.deviceOrientationHandler as EventListener, true);
      }

      if (!this.deviceMotionHandler) {
        this.deviceMotionHandler = (event: DeviceMotionEvent) => this.handleShake(event);
        window.addEventListener('devicemotion', this.deviceMotionHandler as EventListener, true);
      }
    };

    const needsPermission = typeof orientationApi?.requestPermission === 'function' || typeof motionApi?.requestPermission === 'function';
    if (!needsPermission) {
      registerMotion();
      return;
    }

    this.motionPermissionHandler = () => {
      const requests: Promise<'granted' | 'denied'>[] = [];

      if (typeof orientationApi?.requestPermission === 'function') {
        requests.push(orientationApi.requestPermission());
      }

      if (typeof motionApi?.requestPermission === 'function') {
        requests.push(motionApi.requestPermission());
      }

      void Promise.allSettled(requests)
        .then((results) => {
          const granted = results.some((result) => result.status === 'fulfilled' && result.value === 'granted');
          if (granted) {
            registerMotion();
          }
        })
        .finally(() => {
          if (this.motionPermissionHandler) {
            arena.removeEventListener('pointerdown', this.motionPermissionHandler);
            this.motionPermissionHandler = undefined;
          }
        });
    };

    arena.addEventListener('pointerdown', this.motionPermissionHandler, { once: true });
  }

  private applyTiltMotion(event: DeviceOrientationEvent): void {
    if (!this.engine) {
      return;
    }

    const gamma = Math.max(-40, Math.min(40, event.gamma ?? 0));
    const beta = Math.max(10, Math.min(80, event.beta ?? 45));
    const nextGravityX = gamma / 40 * 0.22;
    const nextGravityY = (this.inverted ? -1 : 1) * (0.16 + Math.abs(beta - 45) / 35 * 0.12);

    this.engine.gravity.x += (nextGravityX - this.engine.gravity.x) * 0.18;
    this.engine.gravity.y += (nextGravityY - this.engine.gravity.y) * 0.18;

    this.arenaRef.nativeElement.style.setProperty('--triangle-tilt', `${gamma * 0.18}deg`);
  }

  private handleShake(event: DeviceMotionEvent): void {
    const acceleration = event.accelerationIncludingGravity ?? event.acceleration;
    if (!acceleration) {
      return;
    }

    const magnitude = Math.abs(acceleration.x ?? 0) + Math.abs(acceleration.y ?? 0) + Math.abs(acceleration.z ?? 0);
    const now = Date.now();
    if (magnitude < 28 || now - this.lastShakeAt < 900) {
      return;
    }

    this.lastShakeAt = now;
    this.triggerBurst();
    this.agitateStack(0.0028);
  }

  private agitateStack(force: number): void {
    this.chipBodies.forEach((body) => {
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * force,
        y: (Math.random() - 0.5) * force
      });
      Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.18);
    });
  }

  private triggerBurst(): void {
    this.burstActive = true;
    this.cdr.markForCheck();

    if (this.burstTimeoutId !== undefined) {
      window.clearTimeout(this.burstTimeoutId);
    }

    this.burstTimeoutId = window.setTimeout(() => {
      this.burstActive = false;
      this.cdr.markForCheck();
      this.burstTimeoutId = undefined;
    }, 580);
  }

  private teardownPhysics(): void {
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    if (this.runner) {
      Runner.stop(this.runner);
      this.runner = undefined;
    }

    if (this.engine) {
      Composite.clear(this.engine.world, false);
      Engine.clear(this.engine);
      this.engine = undefined;
    }

    if (this.burstTimeoutId !== undefined) {
      window.clearTimeout(this.burstTimeoutId);
      this.burstTimeoutId = undefined;
    }

    this.burstActive = false;

    this.chipBodies = [];
  }
}
