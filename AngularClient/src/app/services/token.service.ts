import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  public token = '';

  constructor() {
    const credentials = JSON.parse(localStorage.getItem('credentials'));
    this.token = credentials && credentials.token;
  }

  clearToken(): void {
    localStorage.removeItem('credentials');
    this.token = '';
  }

  getToken(): string {
    return this.token;
  }

  isSet(): boolean {
    return this.token !== '' && this.token != null;
  }

  setToken(token): void {
    this.token = token;
    localStorage.setItem('credentials', JSON.stringify({ token: this.token }));
  }
}
