import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsQuanDayComponent } from './ds-quan-day.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BoiDayHaPopupModule } from './boi-day-ha-popup/boi-day-ha-popup.module';
import { BoiDayCaoPopupModule } from './boi-day-cao-popup/boi-day-cao-popup.module';
import { EpBoiDayPopupModule } from './ep-boi-day-popup/ep-boi-day-popup.module';

const routes: Routes = [
  { path: '', component: DsQuanDayComponent }
];

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    BoiDayHaPopupModule,
    BoiDayCaoPopupModule,
    EpBoiDayPopupModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    
  ]
})
export class DSQuanDayModule { }
