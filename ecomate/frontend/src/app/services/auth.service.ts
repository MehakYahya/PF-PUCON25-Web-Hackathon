import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: { email: string; name?: string; id: string };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/users';
  private activityUrl = 'http://localhost:5000/api/activities';

  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
    tap(res => {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem('user', JSON.stringify(res.user)); // ✅ Store full user with id
    })
  );
}

  register(name: string, email: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { name, email, password }).pipe(
    tap(res => {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem('user', JSON.stringify(res.user)); // ✅ Store full user with id
    })
  );
}

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Helper to add Authorization header
  private authHeader() {
  const token = this.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}` // ✅ Required for /me and /goal
    }
  };
}

  // ✅ Secure this request
  getUserProfile() {
    return this.http.get(`${this.baseUrl}/me`, this.authHeader());
  }

  // ✅ Secure this request
  updateCarbonGoal(goal: number) {
    return this.http.put(`${this.baseUrl}/goal`, { carbonGoal: goal }, this.authHeader());
  }

  // Activities --------------------------
  logActivity(activity: { type: string; amount: number; emission: number }) {
    return this.http.post(this.activityUrl, activity, this.authHeader());
  }

  getActivities(): Observable<any> {
    return this.http.get(this.activityUrl, this.authHeader());
  }

  deleteActivity(id: string): Observable<any> {
    return this.http.delete(`${this.activityUrl}/${id}`, this.authHeader());
  }

  // Activity History ------------------------------
  getActivityHistory() {
    return this.http.get<any[]>('http://localhost:5000/api/activities', this.authHeader());
  }

  // COMMUNITY API ------------------------------
  getCommunities() {
    return this.http.get<any[]>('http://localhost:5000/api/communities', this.authHeader());
  }

  createCommunity(data: { name: string; description?: string }) {
    return this.http.post('http://localhost:5000/api/communities', data, this.authHeader());
  }

  joinCommunity(id: string) {
    return this.http.post(`http://localhost:5000/api/communities/${id}/join`, {}, this.authHeader());
  }

  getCommunityById(id: string) {
    return this.http.get<any>(`http://localhost:5000/api/communities/${id}`, this.authHeader());
  }
}
