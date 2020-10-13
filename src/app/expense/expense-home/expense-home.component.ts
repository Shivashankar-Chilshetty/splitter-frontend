import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ExpenseService } from 'src/app/services/expense.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-expense-home',
  templateUrl: './expense-home.component.html',
  styleUrls: ['./expense-home.component.css']
})
export class ExpenseHomeComponent implements OnInit {

  public groupId: any
  public expenses: any
  public firstName: any
  public userId: any
  public finalRes: any
  public splitRes: any

  public flag: boolean

  constructor(private route: ActivatedRoute, public socketService: SocketService, private router: Router, public eService: ExpenseService, public toastr: ToastrService) { }

  ngOnInit(): void {
    this.firstName = Cookie.get('firstName');
    this.userId = Cookie.get('userId');
    this.groupId = this.route.snapshot.paramMap.get('gid')
    this.expenses = []
    this.getAllExpensesByGroupId(this.groupId)
    this.getUpdatesFromOthers();
  }

  //updating the view, if some changes happened to expense
  public getUpdatesFromOthers = () => {
    this.socketService.getUpdatesFromOthers(this.userId).subscribe((data) => {
      this.toastr.info("Expense Upadtes!", data.message);
      this.getAllExpensesByGroupId(this.groupId)

    });
  }
  public getAllExpensesByGroupId: any = (gid) => {
    this.eService.getAllExpensesByGroupId(gid).subscribe(
      (data) => {
        this.flag = true
        //console.log(data)
        if (data.status === 200) {
          this.expenses = data.data;
          let paidArray = this.expenses.map((val) => val.paidArray).flat(1)
          let owedArray = this.expenses.map((val) => val.owedArray).flat(1)
          this.splitRes = this.eService.split(paidArray, owedArray)
          //console.log(this.splitRes)
          let nameAmountarr = []
          for (let i of this.splitRes) {
            for (let j of i) {
              var from = {
                name: i[0],
                amount: -(i[2])
              }
              var to = {
                name: i[1],
                amount: i[2]
              }
            }
            nameAmountarr.push(from, to)
          }
          //console.log(nameAmountarr)


          //performing sum operation on similar keys
          let netBal = {}
          nameAmountarr.forEach(function (d) {
            if (netBal.hasOwnProperty(d.name)) {
              netBal[d.name] = (netBal[d.name] + d.amount);
            } else {
              netBal[d.name] = d.amount;
            }
          });

          this.finalRes = netBal
        }
        else if (data.status == 404) {
          this.flag=true
          this.expenses = []
          this.toastr.warning('No expenses added yet', 'Warning')
        }
      },
      (error) => {
        console.log("Some error occured")
        console.log(error.errorMessage)
        if (error.status == 500) {
          this.toastr.error("failed to find expenses", 'Error')
          this.router.navigate(['/server-error'])
        }

      }
    )
  }

  public addExpense(): any {
    this.router.navigate(['/expense-create', this.groupId])
  }
}
