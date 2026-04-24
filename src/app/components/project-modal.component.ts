import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectItem } from '../portfolio.data';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [],
  template: `
    @if (project; as currentProject) {
      <div class="project-modal" (click)="close.emit()">
        <article class="project-modal__panel" (click)="$event.stopPropagation()">
          <button class="project-modal__close" type="button" (click)="close.emit()">Close</button>
          <p class="project-modal__eyebrow">Selected project</p>
          <h3>{{ currentProject.title }}</h3>
          <h4>{{ currentProject.subtitle }}</h4>
          <p class="project-modal__description">{{ currentProject.description }}</p>
          <p class="project-modal__impact">{{ currentProject.impact }}</p>
          <div class="project-modal__stack">
            @for (item of currentProject.stack; track item) {
              <span>{{ item }}</span>
            }
          </div>
        </article>
      </div>
    }
  `,
  styles: [
    `
      .project-modal {
        position: fixed;
        inset: 0;
        z-index: 90;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: rgba(5, 4, 16, 0.72);
        backdrop-filter: blur(18px);
      }

      .project-modal__panel {
        width: min(680px, 100%);
        padding: 2rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background:
          linear-gradient(180deg, rgba(18, 18, 36, 0.96), rgba(8, 10, 23, 0.92)),
          rgba(255, 255, 255, 0.03);
        box-shadow:
          0 30px 120px rgba(0, 0, 0, 0.45),
          0 0 50px rgba(168, 85, 247, 0.18);
      }

      .project-modal__close {
        margin-left: auto;
        display: block;
        padding: 0.7rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.05);
        color: white;
        cursor: pointer;
      }

      .project-modal__eyebrow,
      h4 {
        color: rgba(196, 181, 253, 0.8);
      }

      h3 {
        margin: 0.45rem 0 0.6rem;
        font-size: clamp(2rem, 4vw, 3rem);
        color: white;
      }

      h4,
      .project-modal__description,
      .project-modal__impact {
        margin: 0;
      }

      .project-modal__description,
      .project-modal__impact {
        margin-top: 1rem;
        color: rgba(226, 232, 240, 0.82);
        line-height: 1.7;
      }

      .project-modal__stack {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .project-modal__stack span {
        padding: 0.7rem 0.9rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(240, 244, 255, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      @media (max-width: 480px) {
        .project-modal {
          padding: 0.85rem;
        }

        .project-modal__panel {
          padding: 1rem;
          border-radius: 22px;
        }

        .project-modal__close {
          padding: 0.6rem 0.85rem;
        }

        .project-modal__stack {
          gap: 0.5rem;
        }

        .project-modal__stack span {
          padding: 0.55rem 0.72rem;
          font-size: 0.82rem;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectModalComponent {
  @Input() project: ProjectItem | null = null;
  @Output() readonly close = new EventEmitter<void>();
}
