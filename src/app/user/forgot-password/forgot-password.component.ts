import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public email: any
  constructor(public userService: UserService, public toastr: ToastrService, public router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  public forgotPassword(): any {
    if (!this.email) {
      this.toastr.warning("Email is required", "Warning!");
    }
    else {
      let data = {
        email: this.email,
      }
      this.userService.forgotPassword(data).subscribe(
        (apiResponse) => {
          if (apiResponse.status == 200) {
            this.toastr.success("Reset Password", "Password reset instructions sent successfully");
            setTimeout(() => {
              this.router.navigate(['/login'])
            }, 8000)
          }
          else {
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
        (error) => {
          if (error.status == 404) {
            this.toastr.warning("Reset Password Failed", "Email Not Found!");
          }
          else if (error.status == 500) {
            this.toastr.error("Some Error Occurred", "Error!")
            this.router.navigate(['/server-error'])
          }
        }
      )
    }
  }
}
