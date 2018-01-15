import { TokenService } from './token.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
  tokenEndpoint = '/api/token';
  public isAuthenticated = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.isAuthenticated = this.tokenService.isSet();
    console.log(`Authenticated: ${this.isAuthenticated}`);
  }

  login(username: string, password: string) {
    this.http.post(this.tokenEndpoint, { username: username, password: password })
      .subscribe(
        data => {
          this.tokenService.setToken(data['token']);
          this.isAuthenticated = true;
          this.router.navigate(['/account']);
        }
      );
  }

  logout() {
    this.tokenService.clearToken();
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
