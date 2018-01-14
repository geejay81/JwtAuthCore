import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ValuesService {

  constructor(
    private http: HttpClient
  ) { }

  get() {
    return this.http.get('/api/values');
  }

}
