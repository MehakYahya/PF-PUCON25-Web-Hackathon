import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-challenge-contribution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-contribution.component.html',
  styleUrls: ['./challenge-contribution.component.css'],
})
export class ChallengeContributionComponent implements OnInit {
  communityId!: string;
  challengeId!: string;
  description = '';
  points!: number;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.communityId = this.route.snapshot.paramMap.get('id')!;
    this.challengeId = this.route.snapshot.paramMap.get('challengeId')!;
  }

  submitContribution() {
    const token = localStorage.getItem('token');
    this.http.post(
      `http://localhost:5000/api/communities/${this.communityId}/challenges/${this.challengeId}/contribute`,
      {
        description: this.description,
        points: this.points
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).subscribe({
      next: () => {
        alert('Contribution submitted successfully!');
        this.router.navigate(['/community', this.communityId, 'challenges']);
      },
      error: (err) => {
        alert(err.error.message || 'Failed to submit contribution');
      }
    });
  }

  goBack() {
    this.router.navigate(['/community', this.communityId, 'challenges']);
  }
}
