import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KcsQualityCheckFailure {
  kyhieubangve: string;
  user_kcs_approve: string;
  id_khau_sanxuat: string;
  ghi_chu: string;
  check_type: string;
  bd_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class KcsQualityService {
  constructor(private http: HttpClient) {}

  submitQualityCheckFailure(data: KcsQualityCheckFailure): Observable<any> {
    // This is a placeholder implementation
    // You should implement the actual API call here
    return this.http.post('/api/kcs-quality-check-failure', data);
  }
}
