import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { QuanDayComponent } from './quan-day.component';
import { EpBoiDayComponent } from './ep-boi-day/ep-boi-day.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { BoiDayHaComponent } from './boi-day-ha/boi-day-ha.component';
import { BoiDayCaoComponent } from './boi-day-cao/boi-day-cao.component';

const routes: Routes = [
  { path: '', component: QuanDayComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatChipsModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatCardModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    QuanDayComponent,
    EpBoiDayComponent,
    BoiDayHaComponent,
    BoiDayCaoComponent,
    RouterModule.forChild(routes)
  ]
})
export class QuanDayModule {}
