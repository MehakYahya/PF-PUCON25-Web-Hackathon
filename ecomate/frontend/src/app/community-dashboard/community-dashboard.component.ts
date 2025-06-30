import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-community-dashboard',
  templateUrl: './community-dashboard.component.html',
  styleUrls: ['./community-dashboard.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
  standalone: true,
})
export class CommunityDashboardComponent implements OnInit {
  communityId!: string;
  communityData: any;
  loading = true;
  error: string | null = null;

  userId = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.communityId = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.getCurrentUserId();
    this.fetchCommunityData();
  }

  fetchCommunityData() {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem('token');

    this.http
      .get(`http://localhost:5000/api/communities/${this.communityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (data) => {
          this.communityData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load community data.';
          this.loading = false;
          console.error(err);
        },
      });
  }

  goBack() {
    this.router.navigate(['/communities']);
  }

 isMember(): boolean {
  if (!this.communityData?.members) return false;
  return this.communityData.members.some((m: any) => m.id === this.userId);
}

  confirmJoin() {
    if (confirm('Are you sure you want to join this community?')) {
      this.joinCommunity();
    }
  }

  confirmLeave() {
    if (confirm('Are you sure you want to leave this community?')) {
      this.leaveCommunity();
    }
  }

  joinCommunity() {
    const token = localStorage.getItem('token');
    this.http
      .post(
        `http://localhost:5000/api/communities/${this.communityId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: () => 
          this.router.navigate([`/community/${this.communityId}/challenges`])
          .then(() => this.fetchCommunityData()),

        error: (err) => alert('Failed to join community.'),
      });
  }

  leaveCommunity() {
    const token = localStorage.getItem('token');
    this.http
      .post(
        `http://localhost:5000/api/communities/${this.communityId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: () => this.fetchCommunityData(),
        error: (err) => alert('Failed to leave community.'),
      });
  }

  getCurrentUserId(): string {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.id;
      } catch {
        return '';
      }
    }
    return '';
  }
  viewChallenges() {
  this.router.navigate([`/community/${this.communityId}/challenges`]);
}

goToLeaderboard() {
  this.router.navigate([`/community/${this.communityId}/leaderboard`]);
}

}

