import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public validationToken: any;
  public password: any;
  public confirmPassword: any;

  constructor(public userService: UserService, public toastr: ToastrService, public router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.validationToken = this.route.snapshot.paramMap.get('validationToken')
    //console.log(this.validationToken)
  }

  public savePassword: any = () => {
    if (!this.password) {
      this.toastr.warning('Please enter the new password', 'Warning!')
    }
    else if (!this.confirmPassword) {
      this.toastr.warning('Confirm Password is required', 'Warning!');
    }
    else if (this.password != this.confirmPassword) {
      this.toastr.warning('Confirm password is not same as entered password', 'Warning!');
    }
    else {
      let data = {
        validationToken: this.validationToken,
        password: this.password
      }
      this.userService.saveNewPass(data).subscribe(
        (apiResponse) => {
          //console.log(apiResponse)
          if (apiResponse.status === 200) {
            this.toastr.success('New Password saved successfully', 'Login now!')
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000)

          }
        },
        (err) => {
          console.log(err)
          if (err.status == 404) {
            this.toastr.warning("Password reset failed", "Please request another password reset!");
            setTimeout(() => {
              this.router.navigate(['/forgot-password'])
            }, 2000)
          }
          else if (err.status == 500) {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/server-error'])
          }
        }
      )
    }
  }
}
