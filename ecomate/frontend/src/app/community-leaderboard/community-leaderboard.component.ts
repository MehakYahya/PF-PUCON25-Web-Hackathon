import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-leaderboard.component.html',
  styleUrls: ['./community-leaderboard.component.css'],
})
export class CommunityLeaderboardComponent implements OnInit {
  communityId!: string;
  leaderboard: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.communityId = this.route.snapshot.paramMap.get('id')!;
    this.fetchLeaderboard();
  }

  fetchLeaderboard() {
    this.loading = true;
    this.error = null;
    const token = localStorage.getItem('token');

    this.http
      .get<any[]>(`http://localhost:5000/api/communities/${this.communityId}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (data) => {
          this.leaderboard = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load leaderboard.';
          this.loading = false;
          console.error(err);
        },
      });
  }

  goBack() {
    this.router.navigate([`/community/${this.communityId}`]);
  }
}
