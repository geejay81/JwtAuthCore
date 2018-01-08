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
