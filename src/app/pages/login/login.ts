import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services/auth/auth.service';
import { FormFieldComponent } from '../../shared/components/ui';
import { ButtonComponent } from '../../shared/components/ui/button/button';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    FormFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly submitted = signal(false);

  submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);
    if (this.form.invalid) return;

    if (this.loading()) return;

    const username = this.form.controls.username.value;
    const password = this.form.controls.password.value;

    this.loading.set(true);
    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirect to returnUrl if present, otherwise to home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        void this.router.navigateByUrl(returnUrl ? `/${returnUrl}` : '/');
      },
      error: (err) => {
        this.loading.set(false);
        let message = 'Ошибка входа. Попробуйте еще раз.';

        if (err?.status === 401 || err?.status === 400) {
          message = 'Неверное имя пользователя или пароль';
        } else if (err?.status === 403) {
          message = 'Доступ запрещен';
        } else if (err?.status === 404) {
          message = 'Пользователь не найден';
        } else if (err?.status === 500) {
          message = 'Ошибка сервера. Попробуйте позже.';
        } else if (err?.status === 0) {
          message = 'Не удается подключиться к серверу';
        } else if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.error?.error) {
          message = err.error.error;
        }

        this.submitError.set(message);
      },
    });
  }
}
