import { ValuesService } from './../services/values.service';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  providers: [
    ValuesService
  ]
})
export class AccountComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private valuesService: ValuesService
  ) { }

  ngOnInit() {
    this.valuesService.get().subscribe(
      data => {
        console.table(data);
      }
    );
  }

  onLogout() {
    this.authenticationService.logout();
  }

}
