import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-challenges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-challenges.component.html',
  styleUrls: ['./community-challenges.component.css'],
})
export class CommunityChallengesComponent implements OnInit {
  communityId!: string;
  challenges: any[] = [];
  loading = false;
  error: string | null = null;
  userId: string = ''; // 🔹 Needed for checking participation

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.communityId = this.route.snapshot.paramMap.get('id')!;
    this.loadCurrentUserId();
    this.fetchChallenges();
  }

  loadCurrentUserId() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.userId = parsed.id || parsed._id;
      } catch (err) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }

  fetchChallenges() {
  this.loading = true;
  const token = localStorage.getItem('token');

  this.http
    .get<any[]>(`http://localhost:5000/api/communities/${this.communityId}/challenges`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .subscribe({
      next: (challenges) => {
        const contributionRequests = challenges.map(challenge =>
          this.http
            .get<any[]>(`http://localhost:5000/api/communities/${this.communityId}/challenges/${challenge._id}/contributions`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .toPromise()
            .then(contributions => ({
              ...challenge,
              contributions
            }))
        );

        Promise.all(contributionRequests).then((combined) => {
          this.challenges = combined;
          this.loading = false;
        });
      },
      
      error: (err) => {
        this.error = 'Failed to load challenges.';
        this.loading = false;
      },
    });
}

goBack() {
  this.router.navigate([`/community/${this.communityId}`]);
}


  goToCreateChallenge() {
    this.router.navigate(['/community', this.communityId, 'create-challenge']);
  }

hasJoined(challenge: any): boolean {
  return challenge.participants?.includes(this.userId);
}


  joinChallenge(challengeId: string) {
    const token = localStorage.getItem('token');

    this.http
      .post(
        `http://localhost:5000/api/communities/${this.communityId}/challenges/${challengeId}/participate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: () => {
          alert('You successfully joined the challenge!');
          this.fetchChallenges();
        },
        error: (err) => {
          alert(err.error.message || 'Failed to join challenge.');
        },
      });
  }
  submitContribution(challengeId: string) {
  const description = prompt('Describe your contribution (e.g., "Biked to work today")');
  const pointsInput = prompt('How many EcoPoints should this be worth?');
  const points = Number(pointsInput);

  if (!description || isNaN(points) || points <= 0) {
    alert('Invalid input. Please enter valid contribution details.');
    return;
  }

  const token = localStorage.getItem('token');

  this.http
    .post(
      `http://localhost:5000/api/communities/${this.communityId}/challenges/${challengeId}/contribute`,
      { description, points },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .subscribe({
      next: () => {
        alert('🎉 Contribution submitted successfully!');
        this.fetchChallenges(); // optional refresh
      },
      error: (err) => {
        alert(err.error.message || 'Failed to submit contribution.');
      },
    });
}
goToContribute(challengeId: string) {
  this.router.navigate(['/community', this.communityId, 'challenges', challengeId, 'contribute']);
}
//contributions
showAllContributions: { [key: string]: boolean } = {};
toggleSeeMore(challengeId: string) {
  this.showAllContributions[challengeId] = !this.showAllContributions[challengeId];
}

getVisibleContributions(challenge: any) {
  const contributions = challenge.contributions || [];
  return this.showAllContributions[challenge._id] ? contributions : contributions.slice(0, 5);
}

}
