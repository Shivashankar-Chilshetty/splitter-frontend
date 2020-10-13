import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private url = 'http://api.shivashankarchillshetty.com';
  //private url = 'http://localhost:3000'

  constructor(public http: HttpClient) { }

  public createGroup(data): Observable<any> {
    const params = new HttpParams()
      .set('groupName', data.groupName)
      .set('members', data.members)
      .set('authToken', data.authToken)
    return this.http.post(`${this.url}/api/v1/users/creategroup`, params)
  }


  public deleteThisGroup(gid): Observable<any> {
    let authToken = Cookie.get('authToken')
    let data = {}
    return this.http.post(`${this.url}/api/v1/users/` + gid + '/groupDelete/' + authToken, data)
  }


  //paginated API
  public getHistoryByGroupId(groupId, skip): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/` + groupId + '/getHistory/' + skip + '/' + Cookie.get('authToken'))
  }



  public getAllGroupsByUserId(): Observable<any> {
    let authToken = Cookie.get('authToken')
    //console.log(authToken)
    return this.http.get(`${this.url}/api/v1/users/getAllGroupsByUserId/` + authToken)
  }


  public getSingleGroup(_id): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/` + _id + '/getSingleGroup/query?authToken=' + Cookie.get('authToken'))
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
