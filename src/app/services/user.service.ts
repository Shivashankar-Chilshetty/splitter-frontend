import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = 'http://api.shivashankarchillshetty.com';
  //private url = 'http://localhost:3000'

  constructor(public http: HttpClient) {
   }

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public signupFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('countryCode', data.countryCode)
    return this.http.post(`${this.url}/api/v1/users/signup`, params);
  }


  public signinFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/login`, params);
  }


  public forgotPassword(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
    return this.http.put(`${this.url}/api/v1/users/forgotpassword`, params);
  }


  public saveNewPass(data): Observable<any> {
    const params = new HttpParams()
      .set('validationToken', data.validationToken)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/savepassword`, params)
  }


  public logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
    return this.http.post(`${this.url}/api/v1/users/logout`, params);
  } 


  public getAllUsers(token): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/view/all/query?authToken=` + token);
  }


  public getSingleUser(token, userId): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/` + userId + '/details/query?authToken=' + token)
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
  }  // END handleError
}

