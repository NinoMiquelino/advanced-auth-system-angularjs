import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  webauthnForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.webauthnForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.error = error.error?.error || 'Login failed';
        }
      });
    }
  }

  onWebAuthnLogin(): void {
    if (this.webauthnForm.valid) {
      const { email } = this.webauthnForm.value;
      
      this.authService.webauthnLogin(email).subscribe({
        next: () => {
          // Login is handled in the service via tap operator
        },
        error: (error) => {
          this.error = error.error?.error || 'WebAuthn login failed';
        }
      });
    }
  }
}