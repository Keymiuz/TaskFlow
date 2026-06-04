import { Component, computed, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { BOARD_STATE } from '../../core/data/taskflow-seed';
import { BoardColumn, BoardState, TaskCard } from '../../core/models/taskflow.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [DragDropModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly board = signal<BoardState>(BOARD_STATE);
  readonly totalTasks = computed(() => this.board().columns.reduce((sum, column) => sum + column.tasks.length, 0));

  constructor() {
    const projectId = this.activatedRoute.snapshot.paramMap.get('id');
    if (projectId) {
      this.board.update((current) => ({
        ...current,
        projectId,
      }));
    }
  }

  drop(event: CdkDragDrop<TaskCard[]>, targetColumnId: string): void {
    this.board.update((current) => {
      const columns = current.columns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const sourceColumn = columns.find((column) => column.id === event.previousContainer.id);
      const targetColumn = columns.find((column) => column.id === targetColumnId);

      if (!sourceColumn || !targetColumn) {
        return current;
      }

      if (event.previousContainer.id === event.container.id) {
        moveItemInArray(sourceColumn.tasks, event.previousIndex, event.currentIndex);
        return { ...current, columns };
      }

      transferArrayItem(sourceColumn.tasks, targetColumn.tasks, event.previousIndex, event.currentIndex);
      return { ...current, columns };
    });
  }

  columnTasks(column: BoardColumn): TaskCard[] {
    return column.tasks;
  }
}
