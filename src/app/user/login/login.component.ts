import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: any;
  public password: any;
  public message: any;

  constructor(public appService: UserService, public toastr: ToastrService, public router: Router) { }

  ngOnInit(): void {
  }
  public goToSignUp = () => {
    this.router.navigate(['/signup'])
  }

  public signinFunction: any = () => {
    if (!this.email) {
      this.toastr.warning('Enter email', 'Warning!');
    }
    else if (!this.password) {
      this.toastr.warning('Enter password', 'Warning!')
    }
    else {
      let userData = {
        email: this.email,
        password: this.password
      }
      this.appService.signinFunction(userData).subscribe(
        (apiResponse) => {
          if (apiResponse.status === 200) {
            //console.log(apiResponse);
            Cookie.set('authToken', apiResponse.data.authToken)
            Cookie.set('userId', apiResponse.data.userDetails.userId)
            Cookie.set('email', apiResponse.data.userDetails.email)
            Cookie.set('firstName', apiResponse.data.userDetails.firstName)
            Cookie.set('lastName', apiResponse.data.userDetails.lastName)
            //this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)

            this.toastr.success('Login Successful', 'Welcome to Splitwise')
            setTimeout(() => {
              this.router.navigate(['/group-home'])
            }, 1000)

          }
          else {
            this.toastr.error(apiResponse.message, 'Error')
          }
        },
        (error) => {
          if (error.status == 404) {
            this.toastr.warning("Login Failed", "User Not Found,Kindly register!");
          }
          else if (error.status == 400) {
            this.toastr.warning("Login Failed", "Wrong Password!");
          }
          else if (error.status == 500) {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/server-error']);
          }
        }
      )
    }
  }
}
