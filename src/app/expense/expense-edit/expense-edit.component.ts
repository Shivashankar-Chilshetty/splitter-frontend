import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { GroupService } from 'src/app/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketService } from 'src/app/services/socket.service';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-expense-edit',
  templateUrl: './expense-edit.component.html',
  styleUrls: ['./expense-edit.component.css']
})
export class ExpenseEditComponent implements OnInit {

  public expenseId: any
  public currentExpense: any = ''
  public expenseName: any
  public expenseAmount: any
  public paidArray: any
  public owedArray: any

  public updatedPaidArray: any
  public updatedOwedArray: any

  public groupMembers = []
  public selectedUsers = []
  public result = []
  public users = []
  public groupId: any
  public groupDetails: any
  public notChecked: any

  public userId: any
  public firstName: any


  public paidBy: any;

  public amountIsAddedAndValid: boolean = false;
  public isAmountNull: boolean = false;


  constructor(private route: ActivatedRoute, private expenseService: ExpenseService, private groupService: GroupService, private socketService: SocketService, private router: Router, public toastr: ToastrService) { }

  ngOnInit(): void {
    this.userId = Cookie.get('userId')
    this.firstName = Cookie.get('firstName')
    this.expenseId = this.route.snapshot.paramMap.get('eid')
    this.getExpenseByEid(this.expenseId)
  }


  private selectedLink: string;
  setradio(e: string): void {
    this.selectedLink = e;
    //console.log(this.selectedLink)
  }

  isSelected(selectType: string): boolean {
    if (!this.selectedLink) { // if no radio button is selected, always return false so every nothing is shown  
      return false;
    }
    return (this.selectedLink === selectType); // if current radio button is selected, return true, else return false  
  }

  public getExpenseByEid(eid): any {
    this.expenseService.getExpenseById(eid).subscribe(
      (data) => {
        if (data.status === 200) {
          this.currentExpense = data.data
          //console.log(this.currentExpense)
          this.paidArray = this.currentExpense.paidArray
          this.owedArray = this.currentExpense.owedArray
          this.expenseName = this.currentExpense.expenseName
          this.expenseAmount = this.currentExpense.expenseAmount
          this.groupId = this.currentExpense.groupId

          let len = this.paidArray.filter((val) => {
            if (val.amount != 0) {
              return val;
            }
          })
          //console.log(len)
          if (len.length == 1) {
            this.paidBy = len[0].userId
            this.selectedLink = 'single'
          }
          else if (len.length > 1) {
            this.selectedLink = 'multi'
          }
          this.getGroupInfo(this.groupId)
        }
        else if (data.status == 404) {
          this.toastr.error('failed to find expenses', 'Error')
        }
      },
      (error) => {
        if (error.status == 500) {
          console.log("Some error occured")
          console.log(error.errorMessage)
          this.toastr.error("failed to find expenses", 'Error')
          setTimeout(() => {
            this.router.navigate(['/server-error'])
          }, 2000)
        }
      }
    )
  }


  public getGroupInfo(gid): any {
    this.groupService.getSingleGroup(gid).subscribe(
      (data) => {
        if (data.status == 200) {
          //console.log(data)
          this.groupDetails = data.data[0]
          let owed = this.owedArray.filter((val) => val.amount != 0)
          this.groupMembers.push(owed)
          //console.log(this.groupMembers.flat(1))

          let userDetails = this.groupDetails.groupMembers
          //console.log(userDetails)
          let group = this.groupMembers.flat(1).map(id => id.userId) //owed array containing userId's
          //console.log(group)

          for (let i of userDetails) {
            if (group.includes(i.userId)) {
              let data = {
                userId: i.userId,
                name: i.firstName + ' ' + i.lastName,
                email: i.email,
                amount: '',
                checked: true
              }
              this.users.push(data)
            }
            else {
              let data = {
                userId: i.userId,
                name: i.firstName + ' ' + i.lastName,
                email: i.email,
                amount: '',
                checked: false
              }
              this.users.push(data)
            }
          }
          //console.log(this.users)
          if (this.selectedLink == 'multi') {
            for (let i of this.users) {
              for (let j of this.paidArray) {
                if (i.userId == j.userId) {
                  i.amount = j.amount
                }
              }
            }
          }
        }
        else {
          this.toastr.error('failed to find group details ')
        }
      },
      (error) => {
        if (error.status == 404) {
          console.log("Some error occured")
          console.log(error.errorMessage)
          this.toastr.error("failed to find group", 'Error')
        }
        else if (error.status == 500) {
          this.toastr.error(error.errorMessage, 'Error')
          this.router.navigate(['/server-error'])
        }
      }
    )
  }

  public editExpense(): any {

    if (!this.expenseName) {
      this.toastr.warning("Enter the Expense Name", "Warning!")
    }
    else if (!this.expenseAmount) {
      this.toastr.warning("Enter Expense Amount", "Warning!")
    }
    else if (isNaN(this.expenseAmount)) {
      this.toastr.warning("Amount should be a number", "Warning!")
    }
    else if (!this.selectedLink) {
      this.toastr.warning("Please Choose who paid the amount", "Warning!")
    }
    else if (this.selectedLink == 'single') {
      if (!this.paidBy) {
        this.toastr.warning("Choose who paid the expense", "Warning!")
      }
      else if (this.selectedUsers.length == 0) {
        this.toastr.warning("Please choose whom to involve in the expense", "Warning!")
      }
      else {

        this.updatedPaidArray = []
        this.updatedOwedArray = []

        let selUsers = this.selectedUsers.filter((id) => id.checked == true).map((val) => val.userId)
        let len = selUsers.length
        let amountPerPerson = (this.expenseAmount / len).toFixed(2)


        for (let i of this.users) {
          //if person x is not present in selectedUsers array(i,e not involved in expense) and that person is the payer then store his details in the paidArray with amount=expenseAmount
          if (!selUsers.includes(i.userId) && (this.paidBy == i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: this.expenseAmount
            }
            this.updatedPaidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.updatedOwedArray.push(owedData)
          }

          //else if person x is present in selectedUsers array(i,e involved in expense) & that person is the payer then store his data in paidArray with amount=expenseAmount & in owedArray with amount=amountPerPerson
          else if ((selUsers.includes(i.userId)) && (this.paidBy == i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: this.expenseAmount
            }
            this.updatedPaidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: amountPerPerson
            }
            this.updatedOwedArray.push(owedData)
          }

          //else if person is present in selectedUsers array(i,e involved in expense), but didn't contributed anything(i,e didn't paid anything), then add him in owedArray with amount=amountPerPerson
          else if ((selUsers.includes(i.userId)) && (this.paidBy != i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.updatedPaidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: amountPerPerson
            }
            this.updatedOwedArray.push(owedData)
          }

          //if a person neither pays nor owes, then his paid & owed amount will be 0 
          else {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.updatedPaidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.updatedOwedArray.push(owedData)
          }
        }
        let final = {
          _id: this.expenseId,
          groupId: this.groupId,
          expenseName: this.expenseName,
          expenseAmount: this.expenseAmount,
          paidArray: this.updatedPaidArray,
          owedArray: this.updatedOwedArray
        }

        //console.log(final)

        this.expenseService.editExpense(final).subscribe(
          (apiRes) => {
            if (apiRes.status == 200) {
              this.toastr.success("Expense edited successfully", 'Success')
              let oldData = apiRes.data;
              this.checkBeforeAndAfterValues(oldData)//for creating edit history

              let ar1 = this.updatedPaidArray.filter((val) => {
                return val.amount != 0
              })
              let ar2 = this.updatedOwedArray.filter((val) => {
                return val.amount != 0
              })
              let arr = ar1.concat(ar2)

              arr = Object.values(arr.reduce((acc, cur) => Object.assign(acc, { [cur.userId]: cur }), {}))

              for (let i of arr) {
                if (i.userId != this.userId) {
                  let dataForNotify = {
                    message: `Hi ${i.name}, ${this.firstName} has updated an expense. Please check your Dashboard/Email`,
                    userId: i.userId
                  }
                  //console.log(dataForNotify)
                  this.notifyUpdatesToUser(dataForNotify)
                }
              }

              setTimeout(() => {
                this.router.navigate(['/expense-home', oldData.groupId])
              }, 2000)
            }
            else {
              this.toastr.success(apiRes.message, 'Error')
            }

          },
          (error) => {
            if (error.status == 500) {
              console.log(error)
              this.toastr.error(error.errorMessage, 'Error')
              this.router.navigate(['/server-error'])
            }
            else {
              console.log(error)
              this.toastr.error("Error")
            }

          }
        )
      }

    }
    else if (this.selectedLink == 'multi') {
      if (!this.amountIsAddedAndValid) {
        this.toastr.warning('Please add the valid expense amount for each user', 'Warning!')
      }
      else if (this.selectedUsers.length == 0) {
        this.toastr.warning('Please choose whom to involve in the expense', 'Warning!')
      }
      else if (this.isAmountNull) {
        this.toastr.warning('One or more amount input feild is missing', 'Warning!')
      }
      else {
        let fsum = 0;
        for (let i of this.users) {
          fsum += parseInt(i.amount);
        }
        if (fsum == this.expenseAmount) {
          this.updatedPaidArray = []
          this.updatedOwedArray = []
          let selUsers = this.selectedUsers.filter((id) => id.checked == true).map((val) => val.userId)
          let len = selUsers.length
          let amountPerPerson = (this.expenseAmount / len).toFixed(2)
          for (let i of this.users) {
            if (selUsers.includes(i.userId)) {
              let paidData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: i.amount
              }
              this.updatedPaidArray.push(paidData)
              let owedData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: amountPerPerson
              }
              this.updatedOwedArray.push(owedData)
            }
            else {
              let paidData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: i.amount
              }
              this.updatedPaidArray.push(paidData)
              let owedData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: 0
              }
              this.updatedOwedArray.push(owedData)
            }
          }
          let final = {
            _id: this.expenseId,
            groupId: this.groupId,
            expenseName: this.expenseName,
            expenseAmount: this.expenseAmount,
            paidArray: this.updatedPaidArray,
            owedArray: this.updatedOwedArray
          }

          //console.log(final)
          this.expenseService.editExpense(final).subscribe(
            (apiRes) => {
              if (apiRes.status == 200) {
                this.toastr.success("Expense edited successfully", 'Success')
                let oldData = apiRes.data;
                this.checkBeforeAndAfterValues(oldData)//for creating edit history

                for (let i of this.updatedPaidArray) {
                  if (i.userId != this.userId) {
                    let dataForNotify = {
                      message: `Hi ${i.name}, ${this.firstName} has updated an expense. Please check your Dashboard/Email`,
                      userId: i.userId
                    }
                    //console.log(dataForNotify)
                    this.notifyUpdatesToUser(dataForNotify)
                  }
                }
                setTimeout(() => {
                  this.router.navigate(['/expense-home', oldData.groupId])
                }, 2000)
              }
            },
            (error) => {
              if (error.status == 500) {
                console.log(error)
                this.toastr.error(error.errorMessage, 'Error')
                this.router.navigate(['/server-error'])
              }
              else {
                console.log(error)
                this.toastr.error("Error")
              }

            }
          )
        }
        else {
          this.toastr.warning(`the total of everyone's paid shares (${fsum}) is different then the total cost(${this.expenseAmount})`, "Warning!")
        }

      }
    }

  }



  //below method executes on change event(modal 2), & this function extracts only checked/selected users i,e user who is selected(checked=true)
  public getVal() {
    this.selectedUsers = []
    this.result = this.users.filter((item) => item.checked == true)
    if (this.result.length > 0) {
      this.notChecked = false;
    }
    //if no user is selected, then set notChecked=true, as this alerts warning statements in the view
    else {
      this.notChecked = true;
    }
  }


  //calls on the click on modal 2 submit button
  public saveDetails(f: NgForm) {
    //console.log(f.touched)
    //if form is touched i,e some users uncheked/checked
    if (f.touched) {
      this.selectedUsers = this.result
    }
    //if form is not touched (note-by default in namewithamount array all users checked statues is set true)
    else {
      this.selectedUsers = this.users
    }
  }




  //below function triggers on (change) event of modal 1 , setting the valiable isAmountNull to true if one/more amount imput filed is null
  public isAmountPresent() {
    let sum = 0;
    for (let i of this.users) {
      sum += parseInt(i.amount);
    }
    if (this.expenseAmount == sum) {
      this.amountIsAddedAndValid = true
    }
    else {
      this.amountIsAddedAndValid = false
    }
    for (let i of this.users) {
      if (i.amount == null) {
        this.isAmountNull = true
        return this.isAmountNull
      }
    }
    this.isAmountNull = false
    return this.isAmountNull;
  }


  //below function triggers when clicked on save changes button(modal 1)
  public multiDetails() {
    if (this.expenseAmount) {
      let sum = 0;
      for (let i of this.users) {
        sum += parseInt(i.amount);
      }
      if (this.expenseAmount == sum) {
        this.amountIsAddedAndValid = true
      }
      else {
        this.amountIsAddedAndValid = false
        this.toastr.warning(`the total of everyone's paid shares (${sum}) is different then the total cost(${this.expenseAmount})`, "Warning!")
      }
    }
    else {
      this.toastr.warning("Enter Expense Amount", "Warning!")
    }
  }


  public checkBeforeAndAfterValues(data) {

    if (this.expenseName != data.expenseName) {
      let history = {
        userId: this.userId,
        groupId: data.groupId,
        expenseId: data._id,
        message: `${this.firstName} has changed the expense title from:-'${data.expenseName}' to ${this.expenseName}`
      }
      //console.log(history)
      this.createHistory(history)
    }
    if (this.expenseAmount != data.expenseAmount) {
      let history = {
        userId: this.userId,
        groupId: data.groupId,
        expenseId: data._id,
        message: `${this.firstName} updated the amount from ${data.expenseAmount} to ${this.expenseAmount} in expense:-'${this.expenseName}'`
      }
      //console.log(history)
      this.createHistory(history)
    }
    let history = {
      userId: this.userId,
      groupId: data.groupId,
      expenseId: data._id,
      message: `${this.firstName} updated the expense:-'${data.expenseName}'`
    }
    //console.log(history)
    this.createHistory(history)
    let newPaid = this.updatedPaidArray.filter(val => val.amount != 0).map((id) => id.userId)
    for (let i of this.updatedOwedArray) {
      for (let j of data.owedArray) {
        //in updatedOwedArray, if amount is 0 for any particular user & previously that user's amount is not 0 & that person is not in updatedPaid array, then that person is removed from the expense
        if ((i.userId == j.userId) && (i.amount == 0 && j.amount != 0)) {
          if (!newPaid.includes(i.userId)) {
            let history = {
              userId: this.userId,
              groupId: data.groupId,
              expenseId: data._id,
              message: `${this.firstName} removed ${i.name} from the expense:-'${this.expenseName}'`
            }
            //console.log(history)
            this.createHistory(history)
          }

        }
        //in updatedOwedArray, if amount is not zero for any particular user & previously that user amount is 0 & that person is not in updatedPaidArray, then that person is added to the expense
        else if ((i.userId == j.userId) && (i.amount != 0 && j.amount == 0)) {
          if (!newPaid.includes(i.userId)) {
            let history = {
              userId: this.userId,
              groupId: data.groupId,
              expenseId: data._id,
              message: `${this.firstName} added ${i.name} to the expense:-'${this.expenseName}'`
            }
            //console.log(history)
            this.createHistory(history)
          }
        }
      }
    }
  }

  public notifyUpdatesToUser: any = (data) => {
    setTimeout(() => {
      this.socketService.notifyUpdates(data);
    }, 1000)
    //data will be object with message and userId(recieverId)
  }//end notifyUpdatesToUser

  public createHistory: any = (history) => {
    this.socketService.createHistory(history)
  }
}
