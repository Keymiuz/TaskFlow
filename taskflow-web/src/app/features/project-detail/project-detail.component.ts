import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PROJECT_CARDS } from '../../core/data/taskflow-seed';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, MatProgressBarModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly project = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return PROJECT_CARDS.find((project) => project.id === id) ?? PROJECT_CARDS[0];
  });

  readonly milestones = [
    'JWT login, register, refresh, and logout',
    'PostgreSQL-backed audit trail',
    'Board sync and movement history',
    'Docker compose bootstrap and nginx proxy',
  ];
}
