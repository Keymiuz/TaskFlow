import { Component, computed, signal } from '@angular/core';

import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { DASHBOARD_METRICS, PROJECT_CARDS, RECENT_ACTIVITY } from '../../core/data/taskflow-seed';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, MatButtonToggleModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly metrics = DASHBOARD_METRICS;
  protected readonly activity = RECENT_ACTIVITY;
  protected readonly projects = PROJECT_CARDS.slice(0, 2);

  readonly period = signal<'week' | 'month'>('week');

  readonly doughnutType = 'doughnut' as const;
  readonly barType = 'bar' as const;

  readonly statusChartData = computed<ChartData<'doughnut', number[], string>>(() => {
    const isWeek = this.period() === 'week';
    return {
      labels: ['Done', 'In progress', 'Blocked'],
      datasets: [
        {
          data: isWeek ? [42, 18, 3] : [172, 74, 9],
          backgroundColor: ['#0f766e', '#c2410c', '#e11d48'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  });

  readonly throughputChartData = computed<ChartData<'bar', number[], string>>(() => {
    const isWeek = this.period() === 'week';
    return {
      labels: isWeek ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['W1', 'W2', 'W3', 'W4'],
      datasets: [
        {
          label: 'Completed tasks',
          data: isWeek ? [8, 11, 7, 10, 12, 6, 9] : [28, 35, 31, 39],
          backgroundColor: '#0f766e',
          borderRadius: 12,
          maxBarThickness: 40,
        },
      ],
    };
  });

  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  setPeriod(value: string): void {
    if (value === 'week' || value === 'month') {
      this.period.set(value);
    }
  }
}
