import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
  tokenEndpoint = 'http://localhost:5000/api/token';
  public token = '';
  public isAuthenticated: boolean;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const credentials = JSON.parse(localStorage.getItem('credentials'));
    this.token = credentials && credentials.token;
    this.isAuthenticated = this.token === '';
  }

  login(username: string, password: string) {
    this.http.post(this.tokenEndpoint, { username: username, password: password })
      .subscribe(
        data => {
          this.token = data['token'];
          this.isAuthenticated = true;
          localStorage.setItem('credentials', JSON.stringify({ token: this.token }));
          this.router.navigate(['/account']);
        }
      );
  }

  logout() {
    localStorage.removeItem('credentials');
    this.token = '';
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
