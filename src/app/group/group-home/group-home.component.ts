import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { GroupService } from 'src/app/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { SocketService } from '../../services/socket.service'
import { ExpenseService } from 'src/app/services/expense.service'


@Component({
  selector: 'app-group-home',
  templateUrl: './group-home.component.html',
  styleUrls: ['./group-home.component.css']
})
export class GroupHomeComponent implements OnInit {

  public authToken: any;
  public userId: any;
  public groups: any;
  public groupIdArr: any;
  public allExpenses: any

  isOwed: boolean
  isOwe: boolean



  flag: boolean


  public firstName: any;
  public lastName: any
  public fullName: any

 

  public res: any;

  


  public youOwe: any
  public youOwed: any
  public totalBal: any


  constructor(public userService: UserService, public expenseService: ExpenseService, public socketService: SocketService, public groupService: GroupService, public toastr: ToastrService, public router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken')
    this.userId = Cookie.get('userId')
    this.firstName = Cookie.get('firstName')
    this.lastName = Cookie.get('lastName')
    this.fullName = this.firstName + ' ' + this.lastName
    this.checkStatus()
    this.verifyUserConfirmation()
    this.authError()
    this.getAllGroups()
    this.getUpdatesFromOthers()
  }

  public checkStatus: any = () => {
    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null) {
      this.router.navigate(['/'])
      return false;
    }
    else {
      return true
    }
  }
  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe((data) => {
      this.socketService.setUser(this.authToken);
    })
  }
  public authError: any = () => {
    this.socketService.authError()
      .subscribe((data) => {
        this.toastr.info("Authorization Key is missing/incorrect", "Please login again");
        this.router.navigate(['/login']);
      });
  }//end authErrorFunction

  public getUpdatesFromOthers = () => {
    this.socketService.getUpdatesFromOthers(this.userId).subscribe((data) => {//getting updated.
      this.toastr.info("Expense Upadtes!", data.message);
      this.getAllGroups()
    });
  }

  //get all the groups which logged in user is a part of
  public getAllGroups: any = () => {
    this.isOwe = false;
    this.isOwed = false
    this.groupIdArr = []
    this.groups = []
    this.groupService.getAllGroupsByUserId().subscribe(
      (data) => {
        //console.log(data)
        this.flag = true
        if (data.status === 200) {
          this.groups = data.data
          this.groupIdArr = this.groups.map((id) => id._id)
          this.getAllExpensesByGroupArr()
        }
        else if (data.status == 404) {
          this.groups = []
          setTimeout(() => {
            this.toastr.warning('No Group added yet', 'Warning')
          }, 3000)

        }
        else if (data.status == 500) {
          this.toastr.error(data.message, 'Error')
          this.router.navigate(['/server-error'])
        }
      },
      (error) => {
        this.flag = true
        console.log(error)
        console.log("Some error occured in finding group details")
        console.log(error.errorMessage)
        this.toastr.error(error.errorMessage, 'Error')
      }
    )
  }
  



  public getAllExpensesByGroupArr(): any {
    this.res = []
    this.youOwe = 0;
    this.youOwed = 0;
    this.totalBal = 0;
    this.expenseService.getAllExpensesByGroupArr(this.groupIdArr).subscribe(
      (apiRes) => {
        //console.log(apiRes)
        if (apiRes.status == 200) {
          this.allExpenses = apiRes.data
          //grouping by groupId
          function groupBy(objArr, prop) {
            return objArr.reduce(function (acc, obj) {
              let key = obj[prop]
              if (!acc[key]) {
                acc[key] = []
              }
              acc[key].push(obj)
              return acc
            }, {})
          }

          let mergedObj = groupBy(this.allExpenses, 'groupId')
          //console.log(mergedObj)

          //getting all paid & owed array from mergerObj
          let output = []
          for (let i in mergedObj) {
            let data = {
              paidArr: mergedObj[i].map((id) => id.paidArray).flat(1),
              owedArr: mergedObj[i].map((id) => id.owedArray).flat(1)
            }
            output.push(data)
          }
          //console.log(output)


          let splitRes = []
          for (let i of output) {
            let arr = this.expenseService.split(i.paidArr, i.owedArr) //calling split() to calculate the result
            splitRes.push(arr)
          }
          //console.log(splitRes.flat(1))

          //sorting only those expense result which logged-in user is involved
          let result = splitRes.flat(1).filter((val) => {
            if (val.includes(this.fullName)) {
              return val
            }
          })
          //console.log(result)

          //if repeated combination of payments occured from different groups, then add the payments, if reverse of match is found then minus the payments & reverse the order of payments
          this.res = Object.values(result.reduce((r, [a, b, v]) => {
            const key = [a, b].sort().join('|');
            if (r[key]) {
              r[key][2] += a === r[key][0] ? v : -v;
              if (r[key][2] < 0) r[key] = [r[key][1], r[key][0], -r[key][2]];
            } else {
              r[key] = [a, b, v];
            }
            return r;
          }, {}));
          //console.log(this.res)
          let owe = 0
          let owed = 0
          for (let i of this.res) {
            if (i[1] == this.fullName) {
              owed += i[2]
              this.isOwed = true
            }
            else if (i[0] == this.fullName) {
              owe += i[2]
              this.isOwe = true
            }
          }
          this.youOwe = owe
          this.youOwed = owed
          this.totalBal = this.youOwed - this.youOwe
        }

        else if (apiRes.status == 404) {
          this.allExpenses = '';
          this.toastr.error('Expense not added yet', 'Error')
        }


      },
      (error) => {
        if (error.status == 500) {
          console.log("Some error occured in finding expenses")
          console.log(error.errorMessage)
          this.router.navigate(['server-error'])
        }
      }
    )
  }

  public createGroup(): any {
    this.router.navigate(['/group-create'])

  }

  public deleteThisGroup: any = (gid) => {
    if(confirm("Are you sure you want to delete this Group? This will completely remove this Group & all the expenses involved in it!")) {
      console.log("deleting" +'  '+gid);
      this.groupService.deleteThisGroup(gid).subscribe(
        (data) => {
          //console.log(data)
          this.toastr.success("Group Deleted successsfully", "Success")
          setTimeout(() => {
            this.getAllGroups()
          }, 1000)
        },
        (error) => {
          console.log(error)
          this.toastr.error(error.errorMessage, "Error")
        }
      )
    }
    
  }


  public logout(): any {
    this.userService.logout().subscribe(
      data => {
        //console.log(data)
        if (data.status == 200) {
          Cookie.delete('authToken')
          Cookie.delete('email')
          Cookie.delete('firstName')
          Cookie.delete('lastName')
          Cookie.delete('userId')
          this.socketService.exitSocket()
          this.toastr.success('Logout Successful', 'Success')
          this.router.navigate(['/login'])
        }
        else if (data.status == 404) {
          this.toastr.error(data.message)
          this.router.navigate(['/'])
        }
      },
      error => {
        console.log(error)
        this.toastr.error('some error')
      }
    )
  }
}