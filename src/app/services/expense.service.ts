import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private url = 'http://api.shivashankarchillshetty.com';
  //private url = 'http://localhost:3000';


  constructor(public http: HttpClient) { }

  public createExpense(data): Observable<any> {
    let authToken = Cookie.get('authToken')
    return this.http.post(`${this.url}/api/v1/users/createexpense/` + authToken, data);
  }

  public getAllExpensesByGroupId(groupId): Observable<any> {
    let authToken = Cookie.get('authToken')
    return this.http.get(`${this.url}/api/v1/users/` + groupId + '/getAllExpenseByGroupId/' + authToken)
  }
  public getExpenseById(_id): Observable<any> {
    let authToken = Cookie.get('authToken')
    return this.http.get(`${this.url}/api/v1/users/` + _id + '/getExpenseById/' + authToken)
  }

  public deleteThisExpense(_id): Observable<any> {
    let data = {}
    let authToken = Cookie.get('authToken')
    return this.http.post(`${this.url}/api/v1/users/` + _id + '/expenseDelete/' + authToken, data)
  }
  public editExpense(data): Observable<any> {
    let authToken = Cookie.get('authToken')
    return this.http.put(`${this.url}/api/v1/users/editExpense/` + data._id + '/' + authToken, data)
  }

  public getAllExpensesByGroupArr(groupArr): Observable<any> {
    let authToken = Cookie.get('authToken')
    return this.http.get(`${this.url}/api/v1/users/getAllExpensesByGroupIdsArray/query?groupArray=` + groupArr + '&authToken=' + authToken)
  }

  public split(paid, owed) {
    let finalArr = []
    let sum = (arr) => {
      let netBal = {}
      arr.forEach(function (d) {
        if (netBal.hasOwnProperty(d.name)) {
          netBal[d.name] = (netBal[d.name] + d.amount);
        } else {
          netBal[d.name] = d.amount;
        }
      });
      //console.log(netBal)
      return netBal
    }
    let netPaidArray = sum(paid)
    let netOwedArray = sum(owed)
    //console.log(netPaidArray)
    //console.log(netOwedArray)
    //performing minus operations on similar keys
    let minus = (paid, owed) => {
      let newObj = Object.keys(netPaidArray).reduce((a, k) => {
        a[k] = paid[k] - owed[k];
        return a;
      }, {});
      //console.log(newObj)
      return newObj
    }
    let netBal = minus(netPaidArray, netOwedArray)
    //console.log(netBal)
    let sortedNames = Object.keys(netBal).sort(function (a, b) { return netBal[a] - netBal[b] })
    let sortedValues = Object.keys(netBal).sort(function (a, b) { return netBal[a] - netBal[b] }).map(key => netBal[key])
    let i = 0;
    let j = sortedNames.length - 1
    let dept;
    while (i < j) {
      dept = Math.min(-(sortedValues[i]), sortedValues[j])
      sortedValues[i] += dept;
      sortedValues[j] -= dept;
      if (i < j) {
        let arr1 = [sortedNames[i], sortedNames[j], dept]
        finalArr.push(arr1)
      }
      if (sortedValues[i] === 0) {
        i++;
      }
      if (sortedValues[j] === 0) {
        j--;
      }
    }
   // console.log(finalArr)
    return finalArr
  }


  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }

}
