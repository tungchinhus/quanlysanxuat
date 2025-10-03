import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  constructor(private datePipe: DatePipe) { }

  /**
   * Định dạng ngày tháng theo chuẩn Việt Nam (DD/MM/YYYY)
   * @param date - Ngày cần định dạng (Date, string, hoặc number)
   * @returns string - Ngày đã định dạng theo DD/MM/YYYY
   */
  formatVietnameseDate(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    try {
      const dateObj = new Date(date);
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      // Sử dụng DatePipe để định dạng theo chuẩn Việt Nam
      return this.datePipe.transform(dateObj, 'dd/MM/yyyy') || '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * Định dạng ngày giờ theo chuẩn Việt Nam (DD/MM/YYYY HH:mm:ss)
   * @param date - Ngày cần định dạng
   * @returns string - Ngày giờ đã định dạng
   */
  formatVietnameseDateTime(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm:ss') || '';
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  }

  /**
   * Định dạng ngày giờ ngắn theo chuẩn Việt Nam (DD/MM/YYYY HH:mm)
   * @param date - Ngày cần định dạng
   * @returns string - Ngày giờ đã định dạng
   */
  formatVietnameseDateTimeShort(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm') || '';
    } catch (error) {
      console.error('Error formatting datetime short:', error);
      return '';
    }
  }

  /**
   * Định dạng thời gian theo chuẩn Việt Nam (HH:mm:ss)
   * @param date - Ngày cần định dạng
   * @returns string - Thời gian đã định dạng
   */
  formatVietnameseTime(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return this.datePipe.transform(dateObj, 'HH:mm:ss') || '';
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  /**
   * Định dạng tháng năm theo chuẩn Việt Nam (MM/YYYY)
   * @param date - Ngày cần định dạng
   * @returns string - Tháng năm đã định dạng
   */
  formatVietnameseMonthYear(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return this.datePipe.transform(dateObj, 'MM/yyyy') || '';
    } catch (error) {
      console.error('Error formatting month year:', error);
      return '';
    }
  }

  /**
   * Lấy ngày hiện tại theo múi giờ Việt Nam
   * @returns Date - Ngày hiện tại theo múi giờ Việt Nam
   */
  getCurrentVietnamDate(): Date {
    const now = new Date();
    // Chuyển đổi sang múi giờ Việt Nam
    const vietnamDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    return vietnamDate;
  }

  /**
   * Định dạng ngày hiện tại theo chuẩn Việt Nam
   * @returns string - Ngày hiện tại đã định dạng
   */
  getCurrentVietnameseDate(): string {
    return this.formatVietnameseDate(this.getCurrentVietnamDate());
  }

  /**
   * Định dạng ngày giờ hiện tại theo chuẩn Việt Nam
   * @returns string - Ngày giờ hiện tại đã định dạng
   */
  getCurrentVietnameseDateTime(): string {
    return this.formatVietnameseDateTime(this.getCurrentVietnamDate());
  }

  /**
   * Chuyển đổi string ngày Việt Nam (DD/MM/YYYY) thành Date object
   * @param vietnameseDateString - Chuỗi ngày theo định dạng DD/MM/YYYY
   * @returns Date | null - Date object hoặc null nếu không hợp lệ
   */
  parseVietnameseDate(vietnameseDateString: string): Date | null {
    if (!vietnameseDateString || typeof vietnameseDateString !== 'string') {
      return null;
    }

    try {
      const parts = vietnameseDateString.split('/');
      if (parts.length !== 3) {
        return null;
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
      }

      const date = new Date(year, month, day);
      
      // Kiểm tra xem date có hợp lệ không
      if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
        return null;
      }

      return date;
    } catch (error) {
      console.error('Error parsing Vietnamese date:', error);
      return null;
    }
  }

  /**
   * So sánh hai ngày theo định dạng Việt Nam
   * @param date1 - Ngày thứ nhất
   * @param date2 - Ngày thứ hai
   * @returns number - -1 nếu date1 < date2, 0 nếu bằng nhau, 1 nếu date1 > date2
   */
  compareVietnameseDates(date1: Date | string | number | null | undefined, 
                         date2: Date | string | number | null | undefined): number {
    try {
      // Check if dates are null or undefined before creating Date objects
      if (!date1 || !date2) {
        return 0;
      }
      
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return 0;
      }
      
      return d1.getTime() - d2.getTime();
    } catch (error) {
      console.error('Error comparing dates:', error);
      return 0;
    }
  }
}

