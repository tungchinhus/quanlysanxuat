import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ep-boi-day',
  templateUrl: './ep-boi-day.component.html',
  styleUrls: ['./ep-boi-day.component.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  standalone: true
})
export class EpBoiDayComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Output() isValid = new EventEmitter<boolean>();

  epBoiDayControl = new FormControl('', [Validators.required]);

  ngOnInit() {
    this.epBoiDayControl.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Phát sự kiện isValid ban đầu
    this.isValid.emit(this.epBoiDayControl.valid);
  }
}
