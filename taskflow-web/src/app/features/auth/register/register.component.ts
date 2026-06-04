import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: [''],
    password: [''],
  });

  constructor() {
    this.form.controls.name.addValidators([Validators.required]);
    this.form.controls.email.addValidators([Validators.required, Validators.email]);
    this.form.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.pending.set(true);
    this.error.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (response: unknown) => {
        this.error.set(this.extractMessage(response));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }

  private extractMessage(response: unknown): string {
    const error = response as { error?: { message?: string }; message?: string };
    return error.error?.message ?? error.message ?? 'Unable to create your account right now.';
  }
}
