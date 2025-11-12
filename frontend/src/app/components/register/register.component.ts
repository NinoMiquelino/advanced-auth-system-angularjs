import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register(email, password, name).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.error = error.error?.error || 'Registration failed';
        }
      });
    }
  }
}