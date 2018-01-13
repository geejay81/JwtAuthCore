import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NgForm } from '@angular/forms/src/directives/ng_form';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {
  }

  login(form: NgForm) {
    this.auth.login(
      form.value.username,
      form.value.password
    );
    // console.log(form);
    // console.log(form.value.username);
    // console.log(form.value.password);
  }
}
