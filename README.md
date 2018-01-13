# JWT Auth Core

## Description

A test project that adds JWT authentication to .NET Core API and uses it to secure an Angular CLI application.

## Status

Under construction. I will create a new branch at each stage.

* Step 1 - JWT added to .NET Core API and token endpoint created to return token with correct login credentials, e.g. username = admin, password = 1234

* Step 2:

    * Create the Angular CLI Project below the .NET Core application folder structure
    ```
    ng new AngularClient
    ```
    * Update .NET Core app to read static files from the Angular build folder "dist"
    ``` cs
    /* 
    
    In Program.cs ...

    */

    ...
    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseWebRoot("AngularClient/dist")
            .UseStartup<Startup>()
            .Build();
    ...

    ```
    * Test that the Angular app builds and runs in .NET Core application
    ```
    cd AngularClient

    npm install
    
    ng build --prod
    
    cd ..
    
    dotnet run

* Step 3 - Setup Routing in Angular app so that we have something to protect
    
    * All done in Angular so change directory to the AngularClient folder
    ```
    cd AngularClient
    ```
    * Use CLI to generate two components, login and account (which can be protected)
    ```
    ng generate component login
    
    ng generate component account
    ```
    * Add app.routing.ts to configure routes required (no guards at this time)
    ``` Javascript
    import { Routes, RouterModule } from '@angular/router';
    import { LoginComponent } from './login/login.component';
    import { AccountComponent } from './account/account.component';

    const appRoutes: Routes = [
        { path: 'login', component: LoginComponent },
        { path: '', component: AccountComponent },
        // Redirect to Account route when no route given
        { path: '**', redirectTo: '' }
    ];

    export const routing = RouterModule.forRoot(appRoutes);
    ```
    * Update app.module.ts to include routing from above
    ``` Javascript
    @NgModule({
        ...
        imports: [
            ...
            routing
        ],
        ...
    ```
    * Add the Router Outlet tag to the app.component.html file
    ``` html
    <router-outlet></router-outlet>
    ```
    * Check that it is working ...
    ```
    ng serve -o 
    ```
    * As described in the routing above, you should be presented with the contents of the Account route

* Step 4 - Adding a guard to secure the account component/route

    * Create the guard service using the Angular CLI
    ``` 
    ng generate service services/auth-guard
    ```
    * Create a canActivate function that can be called in the route config. This will be set to just return true for now
    ``` Javascript
    import { Injectable } from '@angular/core';
    import { CanActivate } from '@angular/router';

    @Injectable()
    export class AuthGuardService implements CanActivate {
        canActivate() {
            console.log('canActivate called');
            return true;
        }
    }
    ```
    * Add guard to account route in routing configuration, app.routing.ts
    ``` Javascript
    ...
    { path: '', component: AccountComponent, canActivate: [AuthGuardService] },
    ...
    ```
    * Add AuthGuardService to providers in app.module.ts
    ``` Javascript
    ...
    providers: [AuthGuardService],
    ...
    ```
    * Serve the Angular application and check that 'canActive called' appears in the console when the application starts up
    ``` 
    ng serve -o
    ```
    * Now update the AuthGuardService canActivate() method so that it returns false and redirects to the login component. We'll need to add a reference to the Router for this
    ``` Javascript
    import { Injectable } from '@angular/core';
    import { Router, CanActivate } from '@angular/router';

    @Injectable()
    export class AuthGuardService implements CanActivate {
        isLoggedIn = false;

        constructor(private router: Router) { }

        canActivate() {

            if (this.isLoggedIn) {
                return true;
            }

            this.router.navigate(['/login']);
            return false;
        }

    }
    ```
    * When we run the application now, we are instantly redirected to the /login route, and cannot get to the /account route

* Step 5 - Set up the Authentication Service

    * Use the Angular CLI to generate the Authentication Service
    ``` 
    ng g s services/authentication
    ```
    * Wire up the new authentication.service.ts with a login and logout method. We'll need to inject and instance of HttpClient to request the token. The login method will just write to the console for now
    ``` Javascript
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
    ```
    * Add service to app.module.ts providers so it can be used across the application
    ``` Javascript
    ...
    providers: [AuthGuardService, AuthenticationService],
    ...
    ```
    * Add a login form to the login component HTML file
    ``` html
   <form (ngSubmit)="login(f)" #f="ngForm" novalidate>
        <input
            type="text"
            id="username"
            name="username"
            password="username"
            placeholder="username"
            ngModel
            required>
        <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            ngModel
            required>
        <button type="submit">Login</button>
    </form>
    ```
    * Update the Login Component so that the Authentication Service is injected and the login method calls the Authentication Service login method
    ``` Javascript
    ...
    import { AuthenticationService } from '../services/authentication.service';
    ...
    constructor(private auth: AuthenticationService) { }
    ...
    login(f: NgForm) {
        this.auth.login(
            form.value.username,
            form.value.password
        );
    }
    ...
    ```
    * Add some necessary modules to app.module.ts - HttpClientModule as we are now using HttpClient, and FormsModule for our login form
    ``` Javascript
    ...
    import { FormsModule } from '@angular/forms';
    import { HttpClientModule } from '@angular/common/http';
    ...
    imports: [
        ...
        FormsModule,
        HttpClientModule,
        ...
    ```
    * Now we can amend the Auth Guard auth-guard.service.ts to check the AuthenticationService
    ``` Javascript
    import { Injectable } from '@angular/core';
    import { Router, CanActivate } from '@angular/router';
    import { AuthenticationService } from './authentication.service';

    @Injectable()
    export class AuthGuardService implements CanActivate {

        constructor(
            private router: Router,
            private authenticationService: AuthenticationService
        ) { }

        canActivate() {

            if (this.authenticationService.isAuthenticated) {
                return true;
            }

            this.router.navigate(['/login']);
            return false;
        }

    }

    ```
    * Now that the Authentication Service is referencing the .NET Core Web API, we will need to build the Angular App so that it can be read when running the .NET Core app...
    ```
    ng build
    
    dotnet run
    ```