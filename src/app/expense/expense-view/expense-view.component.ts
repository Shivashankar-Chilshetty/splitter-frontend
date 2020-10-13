import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketService } from 'src/app/services/socket.service';


@Component({
  selector: 'app-expense-view',
  templateUrl: './expense-view.component.html',
  styleUrls: ['./expense-view.component.css'],
  providers: [Location]
})
export class ExpenseViewComponent implements OnInit {

  public expenseId: any
  public firstName: any


  public expenseName: any
  public createdBy: any
  public createdOn: any
  public updatedBy: any;
  public updatedOn: any
  public amount: any
  public paidArray: any
  public owedArray: any
  public users = []
  public eid: any
  public gid: any



  constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService, private location: Location, public expenseService: ExpenseService, public toastr: ToastrService) { }

  ngOnInit(): void {
    this.firstName = Cookie.get('firstName');
    this.expenseId = this.route.snapshot.paramMap.get('eid')
    this.getExpenseById(this.expenseId)
  }
  public getExpenseById: any = (eid) => {
    this.expenseService.getExpenseById(eid).subscribe(
      (data) => {
        if (data.status === 200) {
          let apiData = data.data
          this.expenseName = apiData.expenseName
          this.createdBy = apiData.createdBy.name
          this.createdOn = apiData.createdOn
          this.updatedBy = apiData.updatedBy.name
          this.updatedOn = apiData.updatedOn
          this.amount = apiData.expenseAmount
          this.paidArray = apiData.paidArray
          this.owedArray = apiData.owedArray
          this.eid = apiData._id
          this.gid = apiData.groupId
          for (let i of this.paidArray) {
            for (let j of this.owedArray) {
              if (i.userId == j.userId) {
                let data = {
                  userId: i.userId,
                  name: i.name,
                  paidShare: i.amount,
                  owedShare: j.amount
                }
                this.users.push(data)
              }
            }
          }
          //console.log(this.users)
          this.toastr.success("Expense details found", "Success")
        }
        else if (data.status == 404) {
          this.toastr.error('Failed to find expense details', "Error")
        }
        else if (data.status == 500) {
          this.toastr.error('Server error', 'Error')
          this.router.navigate(['/server-error'])
        }
      },
      (error) => {
        console.log("Some error occured")
        console.log(error.errorMessage)
        this.toastr.error("Failed to find expenses", "Error")
      }
    )
  }



  public deleteThisExpense: any = () => {
    this.expenseService.deleteThisExpense(this.eid).subscribe(
      (apiRes) => {
        this.toastr.success("Expense Deleted successsfully", "Success")
        let data = apiRes.data
        let history = {
          userId: data.createdBy['userId'],
          groupId: data.groupId,
          expenseId: data._id,
          message: `${data.deletedBy['name']} has deleted the expense:-'${data.expenseName}'`
        }
        //console.log(history)
        this.createHistory(history)

        //sorting the people who are involved in the expense
        let ar1 = data.paidArray.filter((val) => {
          return val.amount != 0
        })
        let ar2 = data.owedArray.filter((val) => {
          return val.amount != 0
        })
        let arr = ar1.concat(ar2)

        //sorted array for sending browser notification
        arr = Object.values(arr.reduce((acc, cur) => Object.assign(acc, { [cur.userId]: cur }), {}))

        //let usersArr = data.users
        for (let i of arr) {
          if (i.userId != data.deletedBy['userId']) {
            let dataForNotify = {
              message: `Hi ${i.name}, ${data.deletedBy['name']} has deleted the expense Which you are a part of. Please check your Dashboard/Email`,
              userId: i.userId
            }
            //console.log(dataForNotify)
            this.notifyUpdatesToUser(dataForNotify);
          }
        }
        setTimeout(() => {
          this.router.navigate(['/expense-home', this.gid])
        }, 2000)
      },
      (error) => {
        console.log(error)
        this.toastr.error('Some error occured', 'Error')
      }
    )
  }


  public notifyUpdatesToUser: any = (data) => {
    //data will be object with message and userId(recieverId)
    setTimeout(() => {
      this.socketService.notifyUpdates(data);
    }, 2000)
  }//end notifyUpdatesToUser

  public createHistory: any = (history) => {
    this.socketService.createHistory(history)
  }
  public goBack() {
    this.location.back()
  }
}
