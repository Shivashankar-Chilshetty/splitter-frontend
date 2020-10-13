import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/services/socket.service';



@Component({
  selector: 'app-expense-create',
  templateUrl: './expense-create.component.html',
  styleUrls: ['./expense-create.component.css']
})
export class ExpenseCreateComponent implements OnInit {

  public expenseName: any
  public expenseAmount
  public currentGroupMembers: any;
  public groupId: any;
  public paidBy: any;

  public notChecked: any
  public result: any


  public nameswithamount = [];
  public selectedUsers = [];
  public paidArray = [];
  public owedArray = [];

  public amountIsAddedAndValid: boolean = false;
  public isAmountNull: boolean = false;

  constructor(private route: ActivatedRoute, private socketService: SocketService, private router: Router, public groupService: GroupService, public expenseService: ExpenseService, public toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('gid')
    this.getSingleGroup(this.groupId);
  }

  public getSingleGroup: any = (gid) => {
    this.groupService.getSingleGroup(gid).subscribe(
      (data) => {
        //console.log(data)
        if (data.status === 200) {
          this.currentGroupMembers = data.data[0].groupMembers;
          //console.log(this.currentGroupMembers)

          for (let i of this.currentGroupMembers) {
            let data = {
              userId: i.userId,
              name: i.firstName + ' ' + i.lastName,
              email: i.email,
              amount: '',
              checked: true
            }
            this.nameswithamount.push(data)
          }
          //console.log(this.nameswithamount)
        }
        else if (data.status == 404) {
          this.toastr.error('No group found', 'Error')
        }

      },
      (error) => {
        if (error.status == 500) {
          console.log("Some error occured")
          console.log(error.errorMessage)
          this.toastr.error('Group details not found', 'Error')
          this.router.navigate(['/server-error'])
        }
      }
    )
  }

  private selectedLink: string;
  setradio(e: string): void {
    this.selectedLink = e;
    //console.log(this.selectedLink)
  }

  isSelected(selectType: string): boolean {
    if (!this.selectedLink) { // if no radio button is selected, always return false
      return false;
    }
    return (this.selectedLink === selectType); // if current radio button is selected, return true, else return false  
  }


  public createExpense: any = () => {
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
        this.paidArray = []
        this.owedArray = []
        let len = this.selectedUsers.length
        let amountPerPerson = (this.expenseAmount / len).toFixed(2) //rounding off the number to 2 decimal points
        let selUsers = this.selectedUsers.map((id) => id.userId)
        for (let i of this.nameswithamount) {
          //if person x is not present in selectedUsers array(i,e not involved in expense) and that person is the payer then store his details in the paidArray with amount=expenseAmount
          if (!selUsers.includes(i.userId) && (this.paidBy == i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: this.expenseAmount
            }
            this.paidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.owedArray.push(owedData)

          }
          //else if person x is present in selectedUsers array(i,e involved in expense) & that person is the payer then store his data in paidArray with amount=expenseAmount & in owedArray with amount=amountPerPerson
          else if ((selUsers.includes(i.userId)) && (this.paidBy == i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: this.expenseAmount
            }
            this.paidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: amountPerPerson
            }
            this.owedArray.push(owedData)

          }

          //else if person is present in selectedUsers array(i,e involved in expense), but didn't contributed anything(i,e didn't paid anything), then add him in owedArray with amount=amountPerPerson
          else if ((selUsers.includes(i.userId)) && (this.paidBy != i.userId)) {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.paidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: amountPerPerson
            }
            this.owedArray.push(owedData)
          }
          //if a person neither pays nor owes, then his paid & owed amount will be 0 
          else {
            let paidData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.paidArray.push(paidData)
            let owedData = {
              userId: i.userId,
              name: i.name,
              email: i.email,
              amount: 0
            }
            this.owedArray.push(owedData)
          }
        }

        let final = {
          groupId: this.groupId,
          expenseName: this.expenseName,
          expenseAmount: this.expenseAmount,
          paidArray: this.paidArray,
          owedArray: this.owedArray
        }
        //console.log(final)

        this.expenseService.createExpense(final).subscribe(
          (apiRes) => {
            if (apiRes.status === 200) {
              //console.log(apiRes)
              this.toastr.success("Expense created successfully", "Successs")
              let data = apiRes.data
              //create history object
              let history = {
                userId: data.createdBy['userId'],
                groupId: data.groupId,
                expenseId: data._id,
                message: `${data.createdBy['name']} has created the expense:-'${data.expenseName}'`
              }
              //console.log(history)
              this.createHistory(history)

              let ar1 = data.paidArray.filter((val) => {
                return val.amount != 0
              })
              let ar2 = data.owedArray.filter((val) => {
                return val.amount != 0
              })
              let arr = ar1.concat(ar2)

              arr = Object.values(arr.reduce((acc, cur) => Object.assign(acc, { [cur.userId]: cur }), {}))
              //let usersArr = data.users
              for (let i of arr) {
                if (i.userId != data.createdBy['userId']) {
                  let dataForNotify = {
                    message: `Hi ${i.name}, ${data.createdBy['name']} has added an expense With You. Please check your Dashboard/Email`,
                    userId: i.userId
                  }
                  //console.log(dataForNotify)
                  this.notifyUpdatesToUser(dataForNotify)
                }
              }
              setTimeout(() => {
                this.router.navigate(['/expense-home', this.groupId])
              }, 2000)
            }
            else {
              this.toastr.error('Error')
            }
          },
          (error) => {
            if (error.status == 500) {
              console.log("Some error occured")
              console.log(error.errorMessage)
              this.toastr.error("Error", error.errorMessage)
              this.router.navigate(['/server-error'])
            }
            else {
              console.log(error)
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
        for (let i of this.nameswithamount) {
          fsum += parseInt(i.amount);
        }
        //console.log(fsum)
        if (fsum == this.expenseAmount) {
          this.paidArray = []
          this.owedArray = []
          let len = this.selectedUsers.length
          let amountPerPerson = (this.expenseAmount / len).toFixed(2)
          let selUsers = this.selectedUsers.map((id) => id.userId)
          for (let i of this.nameswithamount) {
            if (selUsers.includes(i.userId)) {
              let paidData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: i.amount
              }
              this.paidArray.push(paidData)
              let owedData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: amountPerPerson
              }
              this.owedArray.push(owedData)
            }
            else {
              let paidData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: i.amount
              }
              this.paidArray.push(paidData)
              let owedData = {
                userId: i.userId,
                name: i.name,
                email: i.email,
                amount: 0
              }
              this.owedArray.push(owedData)
            }
          }

          let final = {
            groupId: this.groupId,
            expenseName: this.expenseName,
            expenseAmount: this.expenseAmount,
            paidArray: this.paidArray,
            owedArray: this.owedArray
          }
          //console.log(final)
          this.expenseService.createExpense(final).subscribe(
            (apiRes) => {
              if (apiRes.status === 200) {
                this.toastr.success("Expense created successfully", "Success")
                let data = apiRes.data
                //create history object
                let history = {
                  userId: data.createdBy['userId'],
                  groupId: data.groupId,
                  expenseId: data._id,
                  message: `${data.createdBy['name']} has created the expense:-'${data.expenseName}'`
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
                for (let i of arr) {
                  if (i.userId != data.createdBy['userId']) {
                    let dataForNotify = {
                      message: `Hi ${i.name}, ${data.createdBy['name']} has added an expense With You. Please check your Dashboard/Email`,
                      userId: i.userId
                    }
                    //console.log(dataForNotify)
                    this.notifyUpdatesToUser(dataForNotify)
                  }
                }
                setTimeout(() => {
                  this.router.navigate(['/expense-home', this.groupId])
                }, 2000)
              }
              else {
                this.toastr.error('error')
              }
            },
            error => {
              if (error.status == 500) {
                console.log("Some error occured")
                console.log(error.errorMessage)
                this.toastr.error(error.errorMessage, "Error")
                this.router.navigate(['/server-error'])
              }
              else {
                console.log(error)
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





  //below method executes on change event(modal 2), & this function extracts only checked/selected users i,e user who is selected/involved in expense(checked=true)
  public getVal() {
    this.selectedUsers = []
    this.result = this.nameswithamount.filter((item) => item.checked == true)
    if (this.result.length > 0) {
      this.notChecked = false;
    }
    //if no user is selected, then set notChecked=true, as this alerts warning statements in the view
    else {
      this.notChecked = true;
    }
    //console.log(this.result);
  }

  //below method calls on the click on modal 2 submit button
  public saveDetails(f: NgForm) {
    //console.log(f.touched)
    //if form is touched i,e some users uncheked/checked
    if (f.touched) {
      this.selectedUsers = this.result
    }
    //if form is not touched (note-by default in namewithamount array all users checked statues is set true)
    else {
      this.selectedUsers = this.nameswithamount
    }
  }




  //below function triggers on (change) event of modal 1 , setting the valiable isAmountNull to true if one/more amount input filed is null
  public isAmountPresent() {
    let sum = 0;
    for (let i of this.nameswithamount) {
      sum += parseInt(i.amount);
    }
    if (this.expenseAmount == sum) {
      this.amountIsAddedAndValid = true
    }
    else {
      this.amountIsAddedAndValid = false
    }
    for (let i of this.nameswithamount) {
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
      for (let i of this.nameswithamount) {
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







  /* Events based Functions */

  //emitted 

  public notifyUpdatesToUser: any = (data) => {
    setTimeout(() => {
      this.socketService.notifyUpdates(data);
    }, 1000)
    //data will be object with message and userId(recieverId)

  }//end notifyUpdatesToUser

  //function to create a history
  public createHistory: any = (history) => {
    this.socketService.createHistory(history)
  }

}
