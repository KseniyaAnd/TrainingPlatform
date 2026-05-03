import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

import { Role } from '../../models/auth/user-registration.model';
import { UserRegistrationService } from '../../services/auth/user-registration.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ButtonModule,
  ],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly userRegistrationService = inject(UserRegistrationService);
  private readonly router = inject(Router);

  readonly roles: Array<{ label: string; value: Role }> = [
    { label: 'Преподаватель', value: 'TEACHER' },
    { label: 'Студент', value: 'STUDENT' },
  ];

  readonly loading = signal(false);
  readonly submitError = signal<string | null>(null);

  private readonly passwordsMatchValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  readonly form = this.fb.nonNullable.group(
    {
      username: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z0-9._-]+$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      role: this.fb.nonNullable.control<Role>('TEACHER', [Validators.required]),
    },
    { validators: this.passwordsMatchValidator },
  );

  readonly submitted = signal(false);

  submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);
    if (this.form.invalid) return;

    if (this.loading()) return;

    const payload = {
      username: this.form.controls.username.value,
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
      role: this.form.controls.role.value,
    };

    this.loading.set(true);
    this.userRegistrationService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        let message = 'Ошибка регистрации. Попробуйте еще раз.';

        if (err?.status === 400) {
          message = 'Неверные данные. Проверьте правильность заполнения полей.';
        } else if (err?.status === 409) {
          message = 'Пользователь с таким именем или email уже существует';
        } else if (err?.status === 500) {
          message = 'Ошибка сервера. Попробуйте позже.';
        } else if (err?.status === 0) {
          message = 'Не удается подключиться к серверу';
        } else if (err?.error?.message) {
          const serverMessage = err.error.message;
          if (/[а-яА-Я]/.test(serverMessage)) {
            message = serverMessage;
          } else {
            // Переводим типичные английские сообщения
            if (serverMessage.toLowerCase().includes('already exists')) {
              message = 'Пользователь с таким именем или email уже существует';
            } else if (serverMessage.toLowerCase().includes('invalid')) {
              message = 'Неверные данные';
            } else {
              message = serverMessage;
            }
          }
        } else if (err?.error?.error) {
          message = err.error.error;
        }

        this.submitError.set(message);
      },
    });
  }
}
