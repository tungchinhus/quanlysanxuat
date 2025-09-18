// src/app/pages/landing/quan-day/quan-day.component.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { EpBoiDayComponent } from "./ep-boi-day/ep-boi-day.component";
import { BoiDayHaComponent } from "../boi-day-ha/boi-day-ha.component";
import { BoiDayCaoComponent } from "../boi-day-cao/boi-day-cao.component";

@Component({
  selector: 'app-quan-day',
  templateUrl: './quan-day.component.html',
  styleUrls: ['./quan-day.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    EpBoiDayComponent,
    BoiDayHaComponent,
    BoiDayCaoComponent
  ]
})
export class QuanDayComponent implements AfterViewInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  selectedIndex: number = 0;
  tabValidity: boolean[] = [false, false, false];

  ngAfterViewInit() {
    if (this.tabGroup) {
      this.tabGroup.selectedIndexChange.subscribe(newIndex => {
        setTimeout(() => {
          return this.onTabChange(newIndex);
        });
      });
    }
  }

  onTabValidityChange(index: number, isValid: boolean) {
    this.tabValidity[index] = isValid;
    console.log(`DEBUG: Tab ${index} validity changed to: ${isValid}. All valid:`, this.tabValidity);
  }

  // Hàm xử lý việc thay đổi tab khi người dùng click vào header tab HOẶC từ ngAfterViewInit
  onTabChange(newIndex: number) { // Đổi kiểu tham số từ event: { index: number } sang newIndex: number
    const previousIndex = this.selectedIndex;

    console.log(`DEBUG: Attempting to change tab from ${previousIndex} to ${newIndex}`);
    console.log(`DEBUG: Current tab (${previousIndex}) validity: ${this.tabValidity[previousIndex]}`);

    if (newIndex > previousIndex && !this.tabValidity[previousIndex]) {
      this.tabGroup.selectedIndex = previousIndex;
      console.warn('ACTION: Current tab is invalid. Keeping selection on tab:', previousIndex);
    } else {
      this.selectedIndex = newIndex;
      this.tabGroup.selectedIndex = newIndex;
      console.log('ACTION: Successfully changed tab to:', this.selectedIndex);
    }
  }

  goToNextTab() {
    console.log(`DEBUG: Go to Next Tab clicked. Current index: ${this.selectedIndex}, validity: ${this.tabValidity[this.selectedIndex]}`);
    if (this.selectedIndex < this.tabValidity.length - 1 && this.tabValidity[this.selectedIndex]) {
      this.selectedIndex++;
      this.tabGroup.selectedIndex = this.selectedIndex;
      console.log(`ACTION: Moved to next tab: ${this.selectedIndex}`);
    } else if (!this.tabValidity[this.selectedIndex]) {
      console.warn('ACTION: Cannot go to next tab: Current tab is invalid.');
      alert('Vui lòng nhập đầy đủ dữ liệu ở tab hiện tại trước khi chuyển sang tab tiếp theo!');
    } else {
      console.log('ACTION: Already on the last tab.');
    }
  }

  goToPreviousTab() {
    console.log(`DEBUG: Go to Previous Tab clicked. Current index: ${this.selectedIndex}`);
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.tabGroup.selectedIndex = this.selectedIndex;
      console.log(`ACTION: Moved to previous tab: ${this.selectedIndex}`);
    } else {
      console.log('ACTION: Already on the first tab.');
    }
  }

  canComplete(): boolean {
    const allValid = this.tabValidity.every(isValid => isValid);
    console.log(`DEBUG: Can Complete: ${allValid}. Validity states:`, this.tabValidity);
    return allValid;
  }

  onComplete() {
    if (this.canComplete()) {
      alert('Tất cả dữ liệu đã được nhập đầy đủ! Đã hoàn thành.');
      console.log('Form completed:', this.tabValidity);
    } else {
      alert('Vui lòng nhập đầy đủ dữ liệu ở tất cả các tab trước khi hoàn thành!');
    }
  }

  onReset() {
    this.selectedIndex = 0;
    this.tabValidity = [false, false, false];
    this.tabGroup.selectedIndex = this.selectedIndex;
    console.log('ACTION: Form reset to initial state.');
  }
}