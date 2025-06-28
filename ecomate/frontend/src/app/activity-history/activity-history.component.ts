import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.css'],
  imports: [CommonModule]
})
export class ActivityHistoryComponent implements OnInit {
  activities: any[] = [];
  error = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getActivityHistory().subscribe({
      next: (data) => {
        this.activities = data;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load activities';
      }
    });
  }
}
