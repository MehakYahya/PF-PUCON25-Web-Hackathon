import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}
togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.error = '';
        console.log('Login successful, token:', res.token); // Debug
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        console.error(err); // Debug
        this.error = err.error.message || 'Login failed';
      }
    });
  }
  
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
