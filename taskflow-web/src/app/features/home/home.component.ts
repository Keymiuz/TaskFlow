import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { BOARD_STATE, DASHBOARD_METRICS, RECENT_ACTIVITY } from '../../core/data/taskflow-seed';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatDividerModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly metrics = DASHBOARD_METRICS;
  protected readonly activity = RECENT_ACTIVITY;
  protected readonly board = BOARD_STATE;
}
