import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-community-create-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-create-challenge.component.html',
  styleUrls: ['./community-create-challenge.component.css']
})
export class CommunityCreateChallengeComponent implements OnInit {
  communityId!: string;
  title = '';
  description = '';
  reward: number | null = null;
  deadline = '';
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.communityId = this.route.snapshot.paramMap.get('id')!;
  }

  createChallenge() {
    if (!this.title || !this.description || !this.reward || !this.deadline) {
      this.error = 'All fields are required';
      return;
    }

    const token = localStorage.getItem('token');
    this.http.post(
      `http://localhost:5000/api/communities/${this.communityId}/challenges`,
      {
        title: this.title,
        description: this.description,
        reward: this.reward,
        deadline: this.deadline,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).subscribe({
      next: () => {
        this.message = 'Challenge created successfully!';
        this.clearForm();
        setTimeout(() => {
          this.router.navigate([`/community/${this.communityId}/challenges`]);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create challenge.';
      },
    });
  }

  clearForm() {
    this.title = '';
    this.description = '';
    this.reward = null;
    this.deadline = '';
    this.error = '';
  }

  goBack() {
    this.router.navigate([`/community/${this.communityId}/challenges`]);
  }
}
