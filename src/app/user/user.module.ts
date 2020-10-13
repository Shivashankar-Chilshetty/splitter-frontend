import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AppRoutingModule } from '../app-routing.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';



@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgotPasswordComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    AppRoutingModule

  ]
})
export class UserModule { }
