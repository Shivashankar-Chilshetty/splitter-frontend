import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { ExpenseModule } from './expense/expense.module';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { GroupService } from './services/group.service';
import { ExpenseService } from './services/expense.service';
import { ServerErrorComponent } from './server-error/server-error.component';
import { SocketService } from './services/socket.service';


@NgModule({
  declarations: [
    AppComponent,
    ServerErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserModule,
    GroupModule,
    ExpenseModule,
    ToastrModule.forRoot({
      timeOut: 8000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [UserService, GroupService, ExpenseService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
