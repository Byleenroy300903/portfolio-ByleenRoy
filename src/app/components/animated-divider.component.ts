import { Component } from '@angular/core';

@Component({
  selector: 'app-animated-divider',
  standalone: true,
  template: `
    <div class="divider-wrapper">
      <svg class="wave-divider" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="wave-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: rgba(168, 85, 247, 0.3); stop-opacity: 1" />
            <stop offset="50%" style="stop-color: rgba(34, 211, 238, 0.25); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgba(59, 130, 246, 0.3); stop-opacity: 1" />
          </linearGradient>
        </defs>
        
        <path class="wave" d="M0,50 Q360,20 720,50 T1440,50 L1440,200 L0,200 Z" fill="url(#wave-gradient)" filter="url(#wave-blur)" />
        <path class="wave wave-offset" d="M0,70 Q360,40 720,70 T1440,70 L1440,200 L0,200 Z" fill="rgba(168, 85, 247, 0.15)" filter="url(#wave-blur)" />
        <path class="wave wave-offset-2" d="M0,90 Q360,60 720,90 T1440,90 L1440,200 L0,200 Z" fill="rgba(34, 211, 238, 0.1)" filter="url(#wave-blur)" />
      </svg>

      <div class="divider-accent accent-1"></div>
      <div class="divider-accent accent-2"></div>
    </div>
  `,
  styles: [`
    .divider-wrapper {
      position: relative;
      width: 100%;
      height: 140px;
      margin-top: -2px;
      overflow: hidden;
      z-index: 5;
    }

    .wave-divider {
      width: 100%;
      height: 100%;
      display: block;
    }

    .wave {
      animation: wave-animation 10s ease-in-out infinite;
    }

    .wave-offset {
      animation: wave-animation 12s ease-in-out infinite;
      animation-delay: -2s;
    }

    .wave-offset-2 {
      animation: wave-animation 14s ease-in-out infinite;
      animation-delay: -4s;
    }

    .divider-accent {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      mix-blend-mode: screen;
    }

    .accent-1 {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent);
      top: -50px;
      left: 15%;
      animation: float-accent 15s ease-in-out infinite;
    }

    .accent-2 {
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.15), transparent);
      top: -30px;
      right: 20%;
      animation: float-accent 18s ease-in-out infinite reverse;
    }

    @keyframes wave-animation {
      0%, 100% {
        d: path("M0,50 Q360,20 720,50 T1440,50 L1440,200 L0,200 Z");
      }
      25% {
        d: path("M0,35 Q360,5 720,35 T1440,35 L1440,200 L0,200 Z");
      }
      50% {
        d: path("M0,65 Q360,35 720,65 T1440,65 L1440,200 L0,200 Z");
      }
      75% {
        d: path("M0,40 Q360,10 720,40 T1440,40 L1440,200 L0,200 Z");
      }
    }

    @keyframes float-accent {
      0%, 100% {
        transform: translate(0, 0);
      }
      50% {
        transform: translate(30px, 20px);
      }
    }
  `]
})
export class AnimatedDividerComponent {}
