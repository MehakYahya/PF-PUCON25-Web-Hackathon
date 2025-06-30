import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'log-activity', loadComponent: () => import('./log-activity/log-activity.component').then(m => m.LogActivityComponent) },
  { path: 'activity-history', loadComponent: () => import('./activity-history/activity-history.component').then(m => m.ActivityHistoryComponent) },
 {
  path: 'community/:id/create-challenge',
  loadComponent: () =>
    import('./community-create-challenge/community-create-challenge.component').then(
      (m) => m.CommunityCreateChallengeComponent
    ),
},
{
  path: 'community/:id/challenges/:challengeId/contribute',
  loadComponent: () =>
    import('./challenge-contribution/challenge-contribution.component').then(
      m => m.ChallengeContributionComponent
    )
},

{
  path: 'community/:id',
  loadComponent: () =>
    import('./community-dashboard/community-dashboard.component').then(m => m.CommunityDashboardComponent),
 
},
{
  path: 'community/:id/leaderboard',
  loadComponent: () =>
    import('./community-leaderboard/community-leaderboard.component').then(
      (m) => m.CommunityLeaderboardComponent
    ),
},

{
  path: 'eco-feed',
  loadComponent: () => import('./eco-feed/eco-feed.component').then(m => m.EcoFeedComponent)
},

{
  path: 'community/:id/challenges',
  loadComponent: () =>
    import('./community-challenges/community-challenges.component').then(
      (m) => m.CommunityChallengesComponent
    ),
},
  // ✅ Move this UP before '**'
  {
    path: 'communities',
    loadComponent: () => import('./community/community.component').then(m => m.CommunityComponent)
  },

  // Redirect root to register
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  // Wildcard last!
  { path: '**', redirectTo: 'register' }
];
