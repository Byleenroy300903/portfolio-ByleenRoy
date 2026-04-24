import { Component, OnInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  template: `
    <div class="animated-bg-wrapper">
      <svg class="mesh-grid" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <filter id="blur-mesh">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: rgba(168, 85, 247, 0.15); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgba(34, 211, 238, 0.1); stop-opacity: 1" />
          </linearGradient>
        </defs>
        <g class="mesh-layer">
          <path d="M0,0 Q360,150 720,100 T1440,0 L1440,200 Q720,150 0,180 Z" fill="url(#grad1)" filter="url(#blur-mesh)" />
          <path d="M0,180 Q360,350 720,300 T1440,200 L1440,400 Q720,350 0,380 Z" fill="rgba(59, 130, 246, 0.08)" filter="url(#blur-mesh)" />
          <path d="M0,380 Q360,550 720,500 T1440,400 L1440,600 Q720,550 0,580 Z" fill="rgba(168, 85, 247, 0.1)" filter="url(#blur-mesh)" />
        </g>
      </svg>

      <div class="floating-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <canvas #glowCanvas class="glow-canvas"></canvas>
    </div>
  `,
  styles: [`
    .animated-bg-wrapper {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 1;
    }

    .mesh-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0.6;
    }

    .mesh-layer {
      filter: drop-shadow(0 20px 50px rgba(168, 85, 247, 0.15));
    }

    .floating-orbs {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      mix-blend-mode: screen;
    }

    .orb-1 {
      width: clamp(180px, 30vw, 400px);
      height: clamp(180px, 30vw, 400px);
      background: radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent 70%);
      top: clamp(-80px, -8vw, -20px);
      left: clamp(-90px, -10vw, -16px);
      animation: float-slow 25s ease-in-out infinite;
    }

    .orb-2 {
      width: clamp(220px, 34vw, 500px);
      height: clamp(220px, 34vw, 500px);
      background: radial-gradient(circle, rgba(34, 211, 238, 0.3), transparent 70%);
      top: 50%;
      right: clamp(-120px, -12vw, -24px);
      animation: float-medium 20s ease-in-out infinite reverse;
    }

    .orb-3 {
      width: clamp(170px, 24vw, 350px);
      height: clamp(170px, 24vw, 350px);
      background: radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%);
      bottom: clamp(-30px, -6vw, -10px);
      left: clamp(18%, 30%, 36%);
      animation: float-slow 28s ease-in-out infinite;
    }

    .glow-canvas {
      position: absolute;
      inset: 0;
      opacity: 0.5;
    }

    @keyframes float-slow {
      0%, 100% {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(50px, -50px);
      }
      50% {
        transform: translate(-30px, 30px);
      }
      75% {
        transform: translate(40px, 50px);
      }
    }

    @keyframes float-medium {
      0%, 100% {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(-40px, 40px);
      }
      50% {
        transform: translate(30px, -30px);
      }
      75% {
        transform: translate(-50px, -40px);
      }
    }

    @media (max-width: 720px) {
      .orb {
        filter: blur(38px);
      }

      .mesh-grid {
        opacity: 0.42;
      }
    }

    @media (max-width: 480px) {
      .orb {
        filter: blur(28px);
      }

      .orb-2 {
        top: 56%;
      }

      .orb-3 {
        left: 12%;
      }
    }
  `]
})
export class AnimatedBackgroundComponent implements OnInit, OnDestroy {
  private animationFrameId: number | null = null;

  ngOnInit(): void {
    this.animateMeshLayer();
    this.initializeGlowCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private animateMeshLayer(): void {
    gsap.to('.mesh-layer', {
      y: 30,
      duration: 8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    gsap.to('.mesh-grid', {
      opacity: 0.4,
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }

  private initializeGlowCanvas(): void {
    const canvas = document.querySelector('canvas.glow-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random()
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.005;

        if (p.life > 1) {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 30);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.3 * (1 - p.life)})`);
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - 30, p.y - 30, 60, 60);

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
  }
}
