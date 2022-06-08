import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [UserService]
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'surname',
    'email',
    'userStatus',
    'applicationRole',
    'actions',
    'actions2'
  ];
  dataSource = new MatTableDataSource<User>();
  public whatuser!: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authenticationService: AuthService,
    private userService: UserService,
    private _snackbar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  public openDialog(row: any): void {
    let dialogRef = this.dialog.open(DialogElementsExampleDialog);
    dialogRef.componentInstance.globalID = row.id;
    dialogRef.componentInstance.globalDataSource = this.dataSource;
  }

  public openEmailDialog(email: string): void {
    let dialogRef = this.dialog.open(EditingEmailDialog);
    dialogRef.componentInstance.globalEmail = email;
  }

  ngOnInit() {
    this.whatuser = this.authenticationService.loginResponseValue;
    this.userService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  public send(email: string): void {
    this.openEmailDialog(email);
    /*f (
      confirm('Are you sure to send email with credentials to ' + email + '?')
    ) {
      this._snackbar.open('Trying to send email to ' + email, '', {
        duration: 1000
      });
      this.userService.sendEmail(email).subscribe(
        data => {
          this._snackbar.open('Email sent successfully to ' + email, '', {
            duration: 2000
          });
        },
        () => {
          this._snackbar.open('Email not sent', '', {
            duration: 2000
          });
        }
      );
    }*/
  }

  public deleteRow(row: any) {
    if (confirm('Are you sure to delete this record?')) {
      this.userService.delete(row.id).subscribe(data => {
        this.dataSource.data = this.dataSource.data.filter(u => u !== row);
      });
      this._snackbar.open('Record deleted successfully', '', {
        duration: 2000
      });
    }
  }
}

@Component({
  selector: 'dialog-elements',
  templateUrl: 'dialog-elements.html',
  providers: [UserService]
})
export class DialogElementsExampleDialog {
  public surname: FormControl = new FormControl();
  public name: FormControl = new FormControl();
  public email: FormControl = new FormControl();
  public applicationRole: FormControl = new FormControl();
  public password: FormControl = new FormControl();

  public globalID!: number;
  public globalDataSource = new MatTableDataSource<User>();

  private newUser: User = new User();

  approles: any[] = [
    { value: 'USER', viewValue: 'USER' },
    { value: 'MANAGER', viewValue: 'MANAGER' },
    { value: 'ADMINISTRATOR', viewValue: 'ADMINISTRATOR' }
  ];

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private _snackbar: MatSnackBar
  ) {}

  cancel() {
    this.dialog.closeAll();
  }

  onNoClick(event: any): void {
    if (confirm('Are you sure to update this record?')) {
      this.newUser.name = this.name.value;
      this.newUser.surname = this.surname.value;
      this.newUser.email = this.email.value;
      this.newUser.applicationRole = this.applicationRole.value;
      this.newUser.password = this.password.value;

      this.userService.update(this.newUser, this.globalID).subscribe(() => {
        this.userService.findAll().subscribe(data => {
          this.globalDataSource.data = data;
        });
        this.dialog.closeAll();
        this._snackbar.open(
          'Record with ID ' + this.globalID + ' updated successfully',
          '',
          { duration: 2000 }
        );
      });
    } else {
      this.dialog.closeAll();
    }
  }
}

@Component({
  selector: 'editing-email',
  templateUrl: 'editing-email.html',
  providers: [UserService]
})
export class EditingEmailDialog {
  public globalEmail!: string;

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private _snackbar: MatSnackBar
  ) {}

  public send(): void {
    this.dialog.closeAll();
    this._snackbar.open('Trying to send email to ' + this.globalEmail, '', {
      duration: 1000
    });
    this.userService.sendEmail(this.globalEmail).subscribe(
      data => {
        this._snackbar.open(
          'Email sent successfully to ' + this.globalEmail,
          '',
          {
            duration: 2000
          }
        );
      },
      () => {
        this._snackbar.open('Email not sent', '', {
          duration: 2000
        });
      }
    );
  }

  cancel() {
    this.dialog.closeAll();
  }
}