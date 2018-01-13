import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
  tokenEndpoint = 'http://localhost:5000/api/token';
  public token: string;
  public isAuthenticated: boolean;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.token = '';
    this.isAuthenticated = false;
  }

  login(username: string, password: string) {
    this.http.post(this.tokenEndpoint, { username: username, password: password })
      .subscribe(
        data => {
          this.token = data['token'];
          this.isAuthenticated = true;
          console.log(data);
          this.router.navigate(['/account']);
        }
      );
  }

  logout() {

  }
}
