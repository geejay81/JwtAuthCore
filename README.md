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
* Step 6 - Handling page refreshes, and logging out
    * In the Authentication Service, when we have received the token we will add it to local storage for later reference
    ``` Javascript
    login(username: string, password: string) {
        ...
        this.token = data['token'];
        this.isAuthenticated = true;
        localStorage.setItem('credentials', JSON.stringify({ token: this.token }));
        ...
    }
    ```
    * Update the Authentication Service constructor to check the localStorage for an existing token, then use this to authenticate the user so they can refresh the page and not have to log in again
    ``` Javascript
    {
        const credentials = JSON.parse(localStorage.getItem('credentials'));
        this.token = credentials && credentials.token;
        this.isAuthenticated = this.token === '';
    }
    ```
    * Add logic to the logout method. We will need to remove the token, set isAuthenticated to false, clear the localStorage and navigate to the login screen
    ``` Javascript
    logout() {
        localStorage.removeItem('credentials');
        this.token = '';
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
    }
    ```
    * Let's add a call to logout in the Account Component TS file
    ``` Javascript
    import { AuthenticationService } from '../services/authentication.service';
    ...
    constructor (
        private authenticationService: AuthenticationService
    ) { }
    ...
    onLogout() {
        this.authenticationService.logout();
    }
    ```
    * Add a button in the Account Component HTML that calls onLogout() method
    ``` html
    <button (click)="onLogout()" type="button">Logout</button>
    ```
    * Finally, to test, we need to build the Angular app and run the .NET project
    ```
    ng build

    dotnet run
    ```
* Step 7 - Adding token to all http requests
    * Generate the Interceptor file - token.interceptor.ts - in the services folder (makes sense to keep it here as will intercept requests from services)
    ``` Javascript
    import { Injectable } from '@angular/core';
    import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
    import { AuthenticationService } from './authentication.service';
    import { Observable } from 'rxjs/Observable';

    @Injectable()
    export class TokenInterceptor implements HttpInterceptor {

        constructor(
            private authenticationService: AuthenticationService
        ) {}

        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authenticationService.token}`
                }
            });
            return next.handle(request);
        }
    }
    ```
    * Reference the Interceptor file in app.module.ts
    ``` Javascript
    ...
    import { HTTP_INTERCEPTORS } from '@angular/common/http';
    import { TokenInterceptor } from './services/token.interceptor';
    ...
    providers: [
        ...
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
        ...
    ```
    * We'll test it out by making a call to the Values enpoint in the .NET Web API
    * Add Values Service in Angular Client
    ```
    ng g s services/values
    ```
    * Add get() method to Values Service to get data from the Values API endpoint
    ``` Javascript
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
    ```
    * Add the ValuesService to the providers on the AccountComponent ts file as this is the only place that we will use it (you could also add it globally to the app.module.ts file)
    ``` Javascript
    import { } from '../services/values.service';
    ...
    providers: [
        ValuesComponent
    ]
    ...
    ```
    * To check it is working, we will log to the console the values received from the service on ngInit. Don't forget, we would not be able to retrieve these values from the API without sending the token in the headers of our request
    ``` Javascript
    constructor(
        ...,
        private valuesService: ValuesService
    ) { }

    ngOnInit() {
        this.valuesService.get().subscribe(
            data => {
                console.table(data);
            }
        );
    }
    ```
    * When we run now we will find that we have a dependency cycle as the TokenInterceptor requires AuthenticationService and also the AuthenticationService is sending HTTP requests. To prevent this, we will split part of AuthenticationService in to a separate TokenService and use this in the TokenInterceptor
    ```
    ng g s services/token
    ```
    * We will now split out all references to token from AuthenticationService to the separate TokenService
    ``` Javascript
    // token.service.ts
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
            return this.token !== '';
        }

        setToken(token): void {
            this.token = token;
            localStorage.setItem('credentials', JSON.stringify({ token: this.token }));
        }
    }

    // authentication.service.ts
    import { TokenService } from './token.service';
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Router } from '@angular/router';

    @Injectable()
    export class AuthenticationService {
        tokenEndpoint = 'http://localhost:5000/api/token';
        public isAuthenticated: boolean;

        constructor(
            private http: HttpClient,
            private router: Router,
            private tokenService: TokenService
        ) {
            this.isAuthenticated = this.tokenService.isSet();
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
    ```
    * Reference TokenService in app.module.ts providers
    ``` Javascript
    providers: [
        ...,
        TokenService
    ]
    ```
    * Update TokenInterceptor to fetch token from TokenService instead of AuthenticationService
    ``` Javascript
    // token.interceptor.ts

    import { Injectable } from '@angular/core';
    import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
    import { TokenService } from './token.service';
    import { Observable } from 'rxjs/Observable';

    @Injectable()
    export class TokenInterceptor implements HttpInterceptor {

        constructor(
            private tokenService: TokenService
        ) {}

        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.tokenService.getToken()}`
            }
            });
            return next.handle(request);
        }
    }
    ```