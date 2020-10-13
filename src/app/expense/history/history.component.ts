import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, ChangeDetectorRef, AfterContentChecked, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, AfterContentChecked {

  @ViewChild('scrollMe', { read: ElementRef })
  public scrollMe: ElementRef;

  public groupId: any
  public firstName: any
  public historyList = []
  public pageValue: number = 0
  public loadingPreviousHistory: boolean = false;
  public flag: boolean
  public scrollToTop: boolean = true;

  constructor(private route: ActivatedRoute, public router: Router, private groupService: GroupService, public toastr: ToastrService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('gid')
    this.firstName = Cookie.get('firstName')
    this.getPreviousHistoryOfGroup()
  }
  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }


  public loadEarlierHistory: any = () => {
    this.loadingPreviousHistory = true;
    this.pageValue++;
    this.scrollToTop = false;
    this.getPreviousHistoryOfGroup()

  }//end loadEarlierHistory


  public getPreviousHistoryOfGroup: any = () => {
    let previousData = (this.historyList.length > 0 ? this.historyList.slice() : [])
    this.groupService.getHistoryByGroupId(this.groupId, this.pageValue * 10).subscribe(
      (apiRes) => {
        this.flag = true
        //console.log(apiRes)
        if (apiRes.status == 200) {
          this.historyList = previousData.concat(apiRes.data) //concationating previous history data with newly fetch history
          //console.log(this.historyList)
        }
        this.loadingPreviousHistory = false;
      },
      (err) => {
        this.flag = true
        if (err.status == 404) {
          this.historyList = previousData;
          this.toastr.warning('No activities available', 'Warning!')
        }
        else if (err.status == 500) {
          this.toastr.error('Some error occured', 'Error')
          setTimeout(() => {
            this.router.navigate(['/server-error'])
          }, 2000)
        }
        this.loadingPreviousHistory = false;
      }
    )

  }
}
