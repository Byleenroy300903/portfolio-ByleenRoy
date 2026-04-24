import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  ViewChildren,
  inject
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  achievements,
  contactLinks,
  experienceItems,
  leadershipItems,
  navItems,
  projects,
  roles,
  skillGroups,
  type ProjectItem
} from './portfolio.data';
import { ParticleBackgroundComponent } from './components/particle-background.component';
import { LoadingScreenComponent } from './components/loading-screen.component';
import { ProjectModalComponent } from './components/project-modal.component';
import { AnimatedBackgroundComponent } from './components/animated-background.component';
import { AnimatedDividerComponent } from './components/animated-divider.component';
import { HeroAvatar3dComponent } from './components/hero-avatar-3d.component';
import { TechStackTriangleComponent } from './components/tech-stack-triangle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ParticleBackgroundComponent, LoadingScreenComponent, ProjectModalComponent, AnimatedBackgroundComponent, AnimatedDividerComponent, HeroAvatar3dComponent, TechStackTriangleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('700ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('modalFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('220ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class App implements AfterViewInit {
  @ViewChildren('sectionRef')
  private readonly sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('projectCard')
  private readonly projectCardRefs!: QueryList<ElementRef<HTMLElement>>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly navItems = navItems;
  protected readonly skillGroups = skillGroups;
  protected readonly projects = projects;
  protected readonly experienceItems = experienceItems;
  protected readonly achievements = achievements;
  protected readonly leadershipItems = leadershipItems;
  protected readonly contactLinks = contactLinks;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly resumeUrl = '/Resume_Byleen_Janet_Roy.pdf';

  protected activeSection = 'hero';
  protected typedRole = roles[0];
  protected isLoading = true;
  protected selectedProject: ProjectItem | null = null;
  protected progress = 0;
  protected isAtTop = true;
  protected hasSpawnedResumeLaunchpad = false;

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.startLoadingSequence();
    this.initializeScrollObserver();
    this.initializeScrollAnimations();
    this.initializeTiltEffects();
    this.initializeCursorGlowEffects();
    this.initializeButtonEffects();
    this.bindScrollProgress();
    this.ensureVisibilityFallback();
  }

  protected scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected openProject(project: ProjectItem): void {
    this.selectedProject = project;
  }

  protected closeProject(): void {
    this.selectedProject = null;
  }

  protected copyToClipboard(text: string, message: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Create and show toast notification
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      document.body.appendChild(toast);

      gsap.from(toast, {
        duration: 0.3,
        opacity: 0,
        y: -20,
        ease: 'power2.out'
      });

      window.setTimeout(() => {
        gsap.to(toast, {
          duration: 0.3,
          opacity: 0,
          y: -20,
          ease: 'power2.in',
          onComplete: () => toast.remove()
        });
      }, 2500);
    });
  }

  private startLoadingSequence(): void {
    window.setTimeout(() => {
      this.isLoading = false;

      // Ensure hero core elements are always visible even if scroll triggers race on first paint.
      gsap.set('.hero__intro, .hero__headline-line, .hero__role, .hero__copy, .hero__actions', {
        opacity: 1,
        clearProps: 'transform,filter'
      });

      gsap.from('.hero__intro, .hero__headline-line, .hero__role, .hero__copy, .hero__actions', {
        opacity: 0,
        y: 18,
        duration: 1.05,
        stagger: 0.08,
        ease: 'power2.out'
      });
    }, 2000);
  }

  private initializeTyping(): void {
    let roleIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      characterIndex += isDeleting ? -1 : 1;
      this.typedRole = current.slice(0, characterIndex);

      let delay = isDeleting ? 45 : 95;

      if (!isDeleting && characterIndex === current.length) {
        delay = 1400;
        isDeleting = true;
      } else if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 260;
      }

      const timeout = window.setTimeout(tick, delay);
      this.destroyRef.onDestroy(() => window.clearTimeout(timeout));
    };

    const initialTimeout = window.setTimeout(tick, 600);
    this.destroyRef.onDestroy(() => window.clearTimeout(initialTimeout));
  }

  private initializeScrollObserver(): void {
    const sections = this.sectionRefs.toArray().map((section) => section.nativeElement);
    if (sections.length === 0) {
      return;
    }

    const header = document.querySelector('.site-header') as HTMLElement | null;
    let ticking = false;

    const updateActiveSection = () => {
      ticking = false;
      const nextIsAtTop = window.scrollY < 24;
      const shouldSpawnResumeLaunchpad = window.scrollY > 24;
      let didSpawnResumeLaunchpad = false;

      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const probeY = headerHeight + window.innerHeight * 0.28;

      let nextSection = sections[0]?.id ?? 'hero';

      for (const section of sections) {
        const rect = section.getBoundingClientRect();

        if (rect.top <= probeY && rect.bottom >= probeY) {
          nextSection = section.id;
          break;
        }

        if (rect.top <= probeY) {
          nextSection = section.id;
        }
      }

      if (shouldSpawnResumeLaunchpad && !this.hasSpawnedResumeLaunchpad) {
        this.hasSpawnedResumeLaunchpad = true;
        didSpawnResumeLaunchpad = true;
      }

      if (
        this.isAtTop !== nextIsAtTop ||
        this.activeSection !== nextSection ||
        didSpawnResumeLaunchpad
      ) {
        this.isAtTop = nextIsAtTop;
        this.activeSection = nextSection;
        this.cdr.markForCheck();
      }
    };

    const onViewportChange = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);
    updateActiveSection();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
    });
  }

  private initializeScrollAnimations(): void {
    // Create sophisticated parallax and reveal timeline for each section
    this.sectionRefs.forEach((section) => {
      const target = section.nativeElement;
      const triggerElement = target;

      // Main parallax layer with depth
      const parallaxLayers = target.querySelectorAll<HTMLElement>('.parallax-layer');
      parallaxLayers.forEach((layer, index) => {
        gsap.to(layer, {
          yPercent: -15 * (index + 1),
          ease: 'none',
          scrollTrigger: {
            trigger: triggerElement,
            scrub: 0.8,
            start: 'top center',
            end: 'bottom center'
          }
        });
      });

      // Hero is animated on load; avoid ScrollTrigger reveal conflicts there.
      if (target.id === 'hero') {
        return;
      }

      // Advanced reveal with stagger and scale
      const revealItems = target.querySelectorAll('.reveal-item:not(.hero__intro)');
      if (revealItems.length > 0) {
        gsap.from(revealItems, {
          scrollTrigger: {
            trigger: target,
            start: 'top 72%',
            markers: false
          },
          y: 28,
          opacity: 0,
          scale: 0.98,
          duration: 1.08,
          stagger: 0.11,
          ease: 'power2.out'
        });
      }
    });

    // Skill bars with advanced animation
    gsap.from('.skill-item__fill', {
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 78%'
      },
      width: '0%',
      duration: 1.75,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Achievement badges with bounce
    gsap.from('.achievement-marquee span', {
      scrollTrigger: {
        trigger: '#achievements',
        start: 'top 80%'
      },
      scale: 0.9,
      opacity: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power2.out'
    });

    // Timeline dots with elastic effect
    gsap.from('.timeline__dot', {
      scrollTrigger: {
        trigger: '#experience',
        start: 'top 72%'
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power2.out'
    });

    // Timeline content slide-in
    gsap.from('.timeline__content', {
      scrollTrigger: {
        trigger: '#experience',
        start: 'top 72%'
      },
      x: -30,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Leadership cards 3D rotation
    gsap.from('.leadership-card', {
      scrollTrigger: {
        trigger: '#leadership',
        start: 'top 75%'
      },
      rotationY: 18,
      opacity: 0,
      duration: 1.05,
      stagger: 0.08,
      ease: 'power2.out',
      transformOrigin: '50% 50% -100px'
    });

    // Contact form with advanced animation
    gsap.from('.contact-form label, .contact-panel', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 75%'
      },
      opacity: 0,
      x: (index: number) => index % 2 === 0 ? -22 : 22,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Add blur effect animation on scroll
    const blurElements = document.querySelectorAll('.glass-card, .skill-card, .project-card');
    blurElements.forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top center',
          end: 'center center'
        },
        backdropFilter: 'blur(20px)',
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }

  private initializeTiltEffects(): void {
    this.projectCardRefs.forEach((cardRef) => {
      const card = cardRef.nativeElement;

      const handleMove = (event: PointerEvent) => {
        const bounds = card.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;
        const rotateY = ((offsetX / bounds.width) - 0.5) * 16;
        const rotateX = (0.5 - (offsetY / bounds.height)) * 8;
        const softenedRotateY = rotateY * 0.55;

        gsap.to(card, {
          rotateX,
          rotateY: softenedRotateY,
          transformPerspective: 1000,
          duration: 0.45,
          ease: 'power2.out'
        });

        // Update glow position to follow cursor
        const glowEl = card.querySelector('.project-card__glow') as HTMLElement;
        if (glowEl) {
          gsap.to(glowEl, {
            left: offsetX - 60,
            top: offsetY - 60,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      };

      const handleLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.55,
          ease: 'power2.out'
        });

        const glowEl = card.querySelector('.project-card__glow') as HTMLElement;
        if (glowEl) {
          gsap.to(glowEl, {
            left: 'auto',
            right: '-20%',
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      };

      card.addEventListener('pointermove', handleMove);
      card.addEventListener('pointerleave', handleLeave);

      this.destroyRef.onDestroy(() => {
        card.removeEventListener('pointermove', handleMove);
        card.removeEventListener('pointerleave', handleLeave);
      });
    });
  }

  private initializeCursorGlowEffects(): void {
    // Add glow effect to skill cards on hover
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.01,
          boxShadow: '0 0 28px rgba(251, 191, 36, 0.22)',
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          boxShadow: 'var(--shadow)',
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      this.destroyRef.onDestroy(() => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    });

    // Glow effect on glass cards
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          borderColor: 'rgba(251, 191, 36, 0.45)',
          boxShadow: '0 0 24px rgba(251, 191, 36, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: 'var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      this.destroyRef.onDestroy(() => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    });
  }

  private initializeButtonEffects(): void {
    const buttons = document.querySelectorAll('.button, .project-card__button, .site-footer__top');
    buttons.forEach((button) => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mousedown', () => {
        gsap.to(button, {
          scale: 0.98,
          duration: 0.12,
          ease: 'power2.in'
        });
      });

      button.addEventListener('mouseup', () => {
        gsap.to(button, {
          scale: 1.02,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      this.destroyRef.onDestroy(() => {
        button.removeEventListener('mouseenter', () => {});
        button.removeEventListener('mouseleave', () => {});
        button.removeEventListener('mousedown', () => {});
        button.removeEventListener('mouseup', () => {});
      });
    });

    // Contact panel links glow
    const contactLinks = document.querySelectorAll('.contact-panel a');
    contactLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.45)',
          boxShadow: '0 0 18px rgba(245, 158, 11, 0.18)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'rgba(255, 255, 255, 0.07)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      this.destroyRef.onDestroy(() => {
        link.removeEventListener('mouseenter', () => {});
        link.removeEventListener('mouseleave', () => {});
      });
    });
  }

  private bindScrollProgress(): void {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.progress = docHeight > 0 ? scrollTop / docHeight : 0;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  private ensureVisibilityFallback(): void {
    // Fallback for cases where animation race conditions leave elements visually hidden.
    window.setTimeout(() => {
      gsap.set('.reveal-item, .hero__intro, .hero__headline-line, .hero__role, .hero__copy, .hero__actions', {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        clearProps: 'filter'
      });
    }, 3200);
  }
}
