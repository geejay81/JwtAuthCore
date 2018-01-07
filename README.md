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