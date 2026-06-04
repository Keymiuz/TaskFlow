import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProjectCard } from '../../core/models/taskflow.model';
import { PROJECT_CARDS } from '../../core/data/taskflow-seed';

type ProjectFilter = 'all' | 'On track' | 'At risk' | 'Stable';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressBarModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  protected readonly filter = signal<ProjectFilter>('all');
  protected readonly projects = PROJECT_CARDS;

  protected readonly filteredProjects = computed<ProjectCard[]>(() => {
    const filter = this.filter();
    return filter === 'all' ? this.projects : this.projects.filter((project) => project.status === filter);
  });

  setFilter(value: string): void {
    if (value === 'all' || value === 'On track' || value === 'At risk' || value === 'Stable') {
      this.filter.set(value);
    }
  }
}
