import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-community',
  standalone: true,
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
  imports: [CommonModule, FormsModule,RouterLink]
})
export class CommunityComponent implements OnInit {
  communities: any[] = [];
  name = '';
  description = '';
  message = '';
  error = '';

constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchCommunities();
  }

  fetchCommunities() {
    this.auth.getCommunities().subscribe({
      next: (data) => this.communities = data,
      error: (err) => this.error = err.error?.message || 'Failed to load communities'
    });
  }

  createCommunity() {
    if (!this.name.trim()) {
      this.error = 'Community name is required';
      return;
    }

    this.auth.createCommunity({ name: this.name, description: this.description }).subscribe({
      next: () => {
        this.message = 'Community created!';
        this.name = '';
        this.description = '';
        this.fetchCommunities();
      },
      error: (err) => this.error = err.error?.message || 'Error creating community'
    });
  }

  joinCommunity(id: string) {
    this.auth.joinCommunity(id).subscribe({
      next: () => {
        this.message = 'Joined successfully!';
        this.fetchCommunities();
      },
      error: (err) => this.error = err.error?.message || 'Join failed'
    });
  }
}
