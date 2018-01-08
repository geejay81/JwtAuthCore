import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { AuthGuardService } from './services/auth-guard.service';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: AccountComponent, canActivate: [AuthGuardService] },
    // Redirect to Account route when no route given
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
