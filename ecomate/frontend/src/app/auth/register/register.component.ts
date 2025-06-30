import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  error = '';
  success = '';
redirecting = false;
  constructor(private auth: AuthService, private router: Router) {}
showPassword = false;
showConfirmPassword = false;
passwordMismatch = false;

 toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswords() {
    this.passwordMismatch = this.password !== this.confirmPassword;
  }
togglePassword() {
  this.showPassword = !this.showPassword;
}

  register() {
    if (this.passwordMismatch) {
      this.error = 'Passwords do not match';
      return;
    }
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.success = 'Registration successful!';
        this.error = '';
        this.redirecting = true;  // Show animation

        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Registration failed';
        this.success = '';
        this.redirecting = false;
      }
    });
  }
    goToLogin() {
    this.router.navigate(['/login']);
  }
} 