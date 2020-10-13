import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { GroupService } from 'src/app/services/group.service';


@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.css']
})
export class GroupCreateComponent implements OnInit {

  public users: any;
  public authToken: any;
  public firstName
  public userId: any;
  public groupName: any;
  public selected = [];

  constructor(public appService: UserService, public groupService: GroupService, public toastr: ToastrService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken')
    this.userId = Cookie.get('userId')
    this.firstName = Cookie.get('firstName')
    this.selected.push(this.userId)
    this.getAllUsers(this.authToken);
  }
  public getAllUsers: any = (token) => {
    this.appService.getAllUsers(token).subscribe(
      (data) => {
        this.users = data.data;
        //console.log(this.users)
      },
      (err) => {
        console.log("Some error occured")
        console.log(err.errorMessage)
        this.toastr.error(err.errorMessage, 'Error')
      }
    )
  }


  public saveGroup(): any {
    let data = {
      groupName: this.groupName,
      members: this.selected,
      authToken: this.authToken
    }
    this.groupService.createGroup(data).subscribe(
      data => {
        if (data.status === 200) {
          //console.log(data)
          this.toastr.success("Group created successfully", "Success")
          setTimeout(() => {
            this.router.navigate(['/expense-home', data.data._id]) //navigate to expense home page
          }, 2000)
        }
        else {
          this.toastr.error('Error')
        }
      },
      error => {
        console.log("Some error occured")
        console.log(error.errorMessage)
        this.toastr.error(error.errorMessage, "Error")
        this.router.navigate(['/server-error'])
      }
    )
  }
}
