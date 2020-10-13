import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { GroupHomeComponent } from './group/group-home/group-home.component';
import { GroupCreateComponent } from './group/group-create/group-create.component';
import { ExpenseHomeComponent } from './expense/expense-home/expense-home.component';
import { ExpenseCreateComponent } from './expense/expense-create/expense-create.component';
import { ExpenseViewComponent } from './expense/expense-view/expense-view.component';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { ExpenseEditComponent } from './expense/expense-edit/expense-edit.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { HistoryComponent } from './expense/history/history.component';
import { ServerErrorComponent } from './server-error/server-error.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:validationToken', component: ResetPasswordComponent },


  { path: 'group-home', component: GroupHomeComponent },
  { path: 'group-create', component: GroupCreateComponent },


  { path: 'expense-home/:gid', component: ExpenseHomeComponent },
  { path: 'expense-create/:gid', component: ExpenseCreateComponent },
  { path: 'expense-view/:eid', component: ExpenseViewComponent },
  { path: 'expense-edit/:eid', component: ExpenseEditComponent },
  { path: 'history/:gid', component: HistoryComponent },


  { path: 'server-error', component: ServerErrorComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '*', component: LoginComponent },
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
