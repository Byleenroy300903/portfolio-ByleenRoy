import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  template: `
    <div class="loading-screen" [class.loading-screen--hidden]="!visible">
      <canvas #rippleCanvas class="ripple-canvas"></canvas>

      <div class="loading-content">
        <div class="drop-point"></div>
        <p class="loading-title">Generating Experience</p>
        <div class="progress-track" aria-hidden="true">
          <div class="progress-bar"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-screen {
        position: fixed;
        inset: 0;
        z-index: 120;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #05030d 0%, #0a0520 50%, #050310 100%);
        transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s ease;
        overflow: hidden;
      }

      .loading-screen--hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .ripple-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }

      .loading-content {
        position: relative;
        z-index: 2;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
        width: min(360px, calc(100vw - 3rem));
      }

      .drop-point {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: radial-gradient(circle, #d8b4fe, #a855f7);
        box-shadow: 0 0 22px rgba(168, 85, 247, 0.65);
        animation: pulse-drop 1.2s ease-in-out infinite;
      }

      .loading-title {
        margin: 0;
        font-family: 'Space Grotesk', sans-serif;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(237, 233, 254, 0.92);
        font-size: 0.84rem;
      }

      .progress-track {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.15);
      }

      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #a855f7 0%, #7c3aed 50%, #3b82f6 100%);
        border-radius: inherit;
        width: 0%;
        animation: progress-fill 2s linear forwards;
        box-shadow: 0 0 22px rgba(168, 85, 247, 0.72);
      }

      .progress-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 0.78rem;
        color: rgba(196, 181, 253, 0.86);
        letter-spacing: 0.08em;
        font-weight: 600;
      }

      @keyframes pulse-drop {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.22);
        }
      }

      @keyframes progress-fill {
        from {
          width: 0%;
        }
        to {
          width: 100%;
        }
      }

    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingScreenComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rippleCanvas', { static: true })
  private readonly rippleCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) visible = true;
  protected progress = 0;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly durationMs = 2000;
  private animationFrameId: number | null = null;
  private startTime = 0;
  private resizeHandler: (() => void) | null = null;

  private ripples: Array<{ delayMs: number; amplitude: number; frequency: number; speed: number }> = [
    { delayMs: 0, amplitude: 1, frequency: 0.14, speed: 0.15 },
    { delayMs: 240, amplitude: 0.88, frequency: 0.155, speed: 0.17 },
    { delayMs: 520, amplitude: 0.78, frequency: 0.17, speed: 0.185 },
    { delayMs: 860, amplitude: 0.66, frequency: 0.19, speed: 0.205 }
  ];

  ngAfterViewInit(): void {
    this.initializeRippleEffect();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private initializeRippleEffect(): void {
    const canvas = this.rippleCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const syncCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncCanvasSize();
    this.resizeHandler = () => syncCanvasSize();
    window.addEventListener('resize', this.resizeHandler);

    this.startTime = performance.now();

    const drawBackground = (width: number, height: number): void => {
      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, '#04020b');
      base.addColorStop(0.46, '#0a0520');
      base.addColorStop(1, '#04020f');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      const bloom = ctx.createRadialGradient(width * 0.5, height * 0.52, 10, width * 0.5, height * 0.52, Math.max(width, height) * 0.42);
      bloom.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
      bloom.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
      bloom.addColorStop(1, 'rgba(34, 211, 238, 0.01)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);
    };

    const drawRippleRing = (
      centerX: number,
      centerY: number,
      progress: number,
      amplitude: number,
      frequency: number,
      speed: number,
      waveColor: string
    ): void => {
      const maxRadius = Math.max(canvas.clientWidth, canvas.clientHeight) * 0.58;
      const baseRadius = progress * maxRadius * speed * 6.4;
      const fade = Math.max(0, 1 - progress * 1.15);

      if (fade <= 0 || baseRadius < 4) return;

      for (let layer = 0; layer < 3; layer += 1) {
        const layerRadius = baseRadius - layer * 7;
        if (layerRadius <= 0) continue;

        ctx.beginPath();
        for (let a = 0; a <= 360; a += 2) {
          const rad = (a * Math.PI) / 180;
          const rippleOffset = Math.sin(rad * (8 + frequency * 40) + progress * 22) * amplitude * (5 - layer * 1.2) * (1 - progress * 0.8);
          const r = layerRadius + rippleOffset;
          const x = centerX + Math.cos(rad) * r;
          const y = centerY + Math.sin(rad) * r;
          if (a === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alpha = fade * (0.28 - layer * 0.06);
        ctx.strokeStyle = waveColor.replace('ALPHA', `${Math.max(alpha, 0.03)}`);
        ctx.lineWidth = 1.2 + (1 - layer) * 0.7;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.45)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
    };

    const animate = (now: number) => {
      const elapsed = now - this.startTime;
      const normalized = Math.min(elapsed / this.durationMs, 1);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width * 0.5;
      const centerY = height * 0.52;

      drawBackground(width, height);

      this.ripples.forEach((ripple, index) => {
        const rippleElapsed = elapsed - ripple.delayMs;
        if (rippleElapsed < 0) return;

        const rippleProgress = Math.min(rippleElapsed / (this.durationMs * 0.92), 1);
        const color = index % 2 === 0
          ? 'rgba(168, 85, 247, ALPHA)'
          : 'rgba(59, 130, 246, ALPHA)';

        drawRippleRing(centerX, centerY, rippleProgress, ripple.amplitude, ripple.frequency, ripple.speed, color);
      });

      const hotspot = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 90);
      hotspot.addColorStop(0, 'rgba(216, 180, 254, 0.95)');
      hotspot.addColorStop(0.35, 'rgba(168, 85, 247, 0.45)');
      hotspot.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = hotspot;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.fill();

      this.progress = Math.round(normalized * 100);
      this.cdr.markForCheck();

      if (normalized < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }
}

