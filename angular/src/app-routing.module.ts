import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './app/auth/auth.guard';
import { LoginComponent } from './app/auth/login.component';
import { LogoutComponent } from './app/auth/logout.component';
import { UserFormComponent } from './app/user-form/user-form.component';
import { MainComponent } from './app/main/main.component';
import { UserListComponent } from './app/user-list/user-list.component';
import { AdminAuthGuard } from './app/auth/admin.auth.guard';
import { StreetviewComponent } from './app/streetview/streetview.component';

const routes: Routes = [
  { 
    path: '', 
    component: MainComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'logout', 
    component: LogoutComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'main', 
    component: MainComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'adduser', 
    component: UserFormComponent, 
    canActivate: [AuthGuard] 
  },
  {
    path: 'listuser',
    component: UserListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'streetview',
    component: StreetviewComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}