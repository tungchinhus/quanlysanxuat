import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Firestore,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface ProcessedDrawingData {
  id: string;
  kyhieubangve?: string;
  kyhieuquanday: string;
  tenbangve: string;
  congsuat: string;
  tbkt: string;
  nhasanxuat: string;
  ngaysanxuat: Date;
  ngaygiacong: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
  nguoigiacong: string;
  loai_boi_day: 'ha' | 'cao' | 'ep';
  created_at?: Date;
  updated_at?: Date;
}

export interface ProcessedDrawingSearchCriteria {
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
  loai_boi_day?: 'ha' | 'cao' | 'ep';
  trang_thai?: 'pending' | 'approved' | 'rejected';
}

export interface ProcessedDrawingResponse {
  data: ProcessedDrawingData[];
  totalCount: number;
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseKcsManagerService {
  private firestore: Firestore;
  // Removed COLLECTION_NAME as we use original collections directly

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  // Convert Firestore Timestamp | string | number | Date | undefined to Date
  private toDateAny(value: any): Date {
    try {
      if (!value) return new Date();
      if (value instanceof Date) return value;
      if (typeof value?.toDate === 'function') return value.toDate();
      if (typeof value === 'number') return new Date(value);
      if (typeof value === 'string') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
      }
      return new Date();
    } catch {
      return new Date();
    }
  }

  // Map trang_thai from number to string
  private mapTrangThai(value: any): 'pending' | 'approved' | 'rejected' {
    if (typeof value === 'number') {
      switch (value) {
        case 1: return 'pending';
        case 2: return 'approved';
        case 3: return 'rejected';
        default: return 'pending';
      }
    }
    if (typeof value === 'string') {
      switch (value.toLowerCase()) {
        case 'pending': return 'pending';
        case 'approved': return 'approved';
        case 'rejected': return 'rejected';
        case '1': return 'pending';
        case '2': return 'approved';
        case '3': return 'rejected';
        default: return 'pending';
      }
    }
    return 'pending';
  }

  /**
   * Lấy danh sách bảng vẽ đã xử lý chờ kiểm duyệt
   * @deprecated Use getRealProcessedDrawings instead
   */
  getProcessedDrawings(criteria: ProcessedDrawingSearchCriteria): Observable<ProcessedDrawingResponse> {
    // Redirect to getRealProcessedDrawings to avoid duplication
    return this.getRealProcessedDrawings(criteria);
  }

  /**
   * Lấy dữ liệu từ collection thực tế (bangve hoặc quan_day)
   */
  getRealProcessedDrawings(criteria: ProcessedDrawingSearchCriteria): Observable<ProcessedDrawingResponse> {
    return from(this.fetchRealProcessedDrawings(criteria)).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching real processed drawings:', error);
        return of({
          data: [],
          totalCount: 0,
          hasMore: false
        } as ProcessedDrawingResponse);
      })
    );
  }

  /**
   * Tìm kiếm bảng vẽ theo từ khóa
   */
  searchProcessedDrawings(criteria: ProcessedDrawingSearchCriteria): Observable<ProcessedDrawingResponse> {
    return this.getRealProcessedDrawings(criteria);
  }

  /**
   * Lấy chi tiết một bảng vẽ theo ID từ các collection gốc
   */
  getProcessedDrawingById(id: string): Observable<ProcessedDrawingData | null> {
    return from(this.fetchProcessedDrawingByIdFromOriginalCollections(id)).pipe(
      map(drawing => drawing),
      catchError(error => {
        console.error('Error fetching processed drawing by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Cập nhật trạng thái bảng vẽ trong collection gốc
   */
  updateDrawingStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Observable<boolean> {
    return from(this.updateStatusInOriginalCollection(id, status)).pipe(
      map(success => success),
      catchError(error => {
        console.error('Error updating drawing status:', error);
        return of(false);
      })
    );
  }

  private async fetchRealProcessedDrawings(criteria: ProcessedDrawingSearchCriteria): Promise<ProcessedDrawingResponse> {
    try {
      console.log('Fetching real processed drawings with criteria:', criteria);

      // Try to get data from the actual collections that might contain processed drawings
      const possibleCollections = ['bangve', 'quan_day', 'boi_day_ha', 'boi_day_cao', 'ep_boi_day'];
      const allDrawings: ProcessedDrawingData[] = [];

      for (const collectionName of possibleCollections) {
        try {
          let q = query(collection(this.firestore, collectionName));
          
          // Try to filter by status if the field exists (trang_thai = 1 means pending)
          if (criteria.trang_thai === 'pending') {
            try {
              q = query(q, where('trang_thai', '==', 1));
              console.log(`Filtering ${collectionName} by trang_thai=1 (pending)`);
            } catch (error) {
              console.log(`Collection ${collectionName} doesn't have trang_thai field or can't filter by trang_thai=1, getting all documents`);
            }
          }

          const snapshot = await getDocs(q);
          console.log(`Found ${snapshot.size} documents in ${collectionName}`);

          snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Document from ${collectionName}:`, doc.id, data);
            
            // Convert to ProcessedDrawingData format
            const drawing: ProcessedDrawingData = {
              id: doc.id,
              kyhieubangve: data['kyhieubangve'] || data['ky_hieu_bang_ve'] || data['kh_bv'] || '',
              kyhieuquanday: data['kyhieuquanday'] || data['ky_hieu_quan_day'] || data['kyhieu'] || data['ky_hieu'] || '',
              tenbangve: data['tenbangve'] || data['ten_bang_ve'] || data['ten'] || data['ten_bv'] || '',
              congsuat: data['congsuat'] || data['cong_suat'] || data['congSuat'] || '',
              tbkt: data['tbkt'] || data['tb_kt'] || data['TBKT'] || '',
              nhasanxuat: data['nhasanxuat'] || data['nha_san_xuat'] || data['nhaSX'] || '',
              ngaysanxuat: this.toDateAny(data['ngaysanxuat'] || data['ngay_san_xuat'] || data['ngaySX']),
              ngaygiacong: this.toDateAny(data['ngaygiacong'] || data['ngay_gia_cong'] || data['ngayGiaCong']),
              trang_thai: this.mapTrangThai(data['trang_thai'] || data['status'] || 1),
              nguoigiacong: data['nguoigiacong'] || data['nguoi_gia_cong'] || data['nguoiGiaCong'] || '',
              loai_boi_day: (data['loai_boi_day'] || data['loai'] || 'ha') as 'ha' | 'cao' | 'ep',
              created_at: this.toDateAny(data['created_at']),
              updated_at: this.toDateAny(data['updated_at'])
            };

            // Always push to visualize raw data rows during debugging
            allDrawings.push(drawing);
          });
        } catch (error) {
          console.log(`Error fetching from ${collectionName}:`, error);
        }
      }

      // Apply search filter
      let filteredDrawings = allDrawings;
      if (criteria.searchTerm && criteria.searchTerm.trim()) {
        const searchLower = criteria.searchTerm.toLowerCase();
        filteredDrawings = allDrawings.filter(drawing =>
          drawing.kyhieuquanday.toLowerCase().includes(searchLower) ||
          drawing.tenbangve.toLowerCase().includes(searchLower) ||
          drawing.congsuat.toLowerCase().includes(searchLower) ||
          drawing.tbkt.toLowerCase().includes(searchLower) ||
          drawing.nhasanxuat.toLowerCase().includes(searchLower) ||
          drawing.nguoigiacong.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (criteria.pageNumber - 1) * criteria.pageSize;
      const endIndex = startIndex + criteria.pageSize;
      const paginatedDrawings = filteredDrawings.slice(startIndex, endIndex);

      console.log(`Returning ${paginatedDrawings.length} real processed drawings`);

      return {
        data: paginatedDrawings,
        totalCount: filteredDrawings.length,
        hasMore: endIndex < filteredDrawings.length
      };

    } catch (error) {
      console.error('Error in fetchRealProcessedDrawings:', error);
      throw error;
    }
  }

  // Removed fetchProcessedDrawings method as it's no longer needed

  private async fetchProcessedDrawingByIdFromOriginalCollections(id: string): Promise<ProcessedDrawingData | null> {
    try {
      const possibleCollections = ['bangve', 'quan_day', 'boi_day_ha', 'boi_day_cao', 'ep_boi_day'];

      for (const collectionName of possibleCollections) {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          const docSnap = await getDocs(query(collection(this.firestore, collectionName), where('__name__', '==', id)));

          if (!docSnap.empty) {
            const docSnapshot = docSnap.docs[0];
            const data = docSnapshot.data();

            return {
              id: docSnapshot.id,
              kyhieubangve: data['kyhieubangve'] || data['ky_hieu_bang_ve'] || data['kh_bv'] || '',
              kyhieuquanday: data['kyhieuquanday'] || data['ky_hieu_quan_day'] || data['kyhieu'] || data['ky_hieu'] || '',
              tenbangve: data['tenbangve'] || data['ten_bang_ve'] || data['ten'] || data['ten_bv'] || '',
              congsuat: data['congsuat'] || data['cong_suat'] || data['congSuat'] || '',
              tbkt: data['tbkt'] || data['tb_kt'] || data['TBKT'] || '',
              nhasanxuat: data['nhasanxuat'] || data['nha_san_xuat'] || data['nhaSX'] || '',
              ngaysanxuat: this.toDateAny(data['ngaysanxuat'] || data['ngay_san_xuat'] || data['ngaySX']),
              ngaygiacong: this.toDateAny(data['ngaygiacong'] || data['ngay_gia_cong'] || data['ngayGiaCong']),
              trang_thai: this.mapTrangThai(data['trang_thai'] || data['status'] || 1),
              nguoigiacong: data['nguoigiacong'] || data['nguoi_gia_cong'] || data['nguoiGiaCong'] || '',
              loai_boi_day: (data['loai_boi_day'] || data['loai'] || 'ha') as 'ha' | 'cao' | 'ep',
              created_at: this.toDateAny(data['created_at']),
              updated_at: this.toDateAny(data['updated_at'])
            };
          }
        } catch (error) {
          console.log(`Error checking collection ${collectionName} for ID ${id}:`, error);
        }
      }

      return null;

    } catch (error) {
      console.error('Error fetching processed drawing by ID from original collections:', error);
      throw error;
    }
  }

  private async updateStatusInOriginalCollection(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
    try {
      const possibleCollections = ['bangve', 'quan_day', 'boi_day_ha', 'boi_day_cao', 'ep_boi_day'];

      for (const collectionName of possibleCollections) {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          await updateDoc(docRef, {
            trang_thai: status,
            updated_at: Timestamp.fromDate(new Date())
          });

          console.log(`Updated drawing ${id} status to ${status} in collection ${collectionName}`);
          return true;
        } catch (error) {
          // Document not found in this collection, try next one
          console.log(`Document ${id} not found in collection ${collectionName}, trying next...`);
        }
      }

      console.error(`Document ${id} not found in any collection`);
      return false;

    } catch (error) {
      console.error('Error updating drawing status in original collection:', error);
      throw error;
    }
  }

  /**
   * Debug method để kiểm tra dữ liệu trong database
   */
  async debugDatabaseData(): Promise<void> {
    try {
      console.log('=== DEBUG: Checking database data ===');
      console.log('Firestore instance:', this.firestore);
      
      // Test Firebase connection first
      try {
        const testQuery = query(collection(this.firestore, 'test'));
        await getDocs(testQuery);
        console.log('✅ Firebase connection is working');
      } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return;
      }
      
      // Check original collections that contain processed drawings
      const possibleCollections = [
        'bangve', // Most likely collection
        'quan_day',
        'boi_day_ha',
        'boi_day_cao',
        'ep_boi_day'
      ];
      
      let totalFound = 0;
      
      for (const collectionName of possibleCollections) {
        try {
          console.log(`🔍 Checking collection: ${collectionName}`);
          const allDocsQuery = query(collection(this.firestore, collectionName));
          const allSnapshot = await getDocs(allDocsQuery);
          
          console.log(`📊 Collection '${collectionName}': ${allSnapshot.size} documents`);
          
          if (allSnapshot.size > 0) {
            totalFound += allSnapshot.size;
            console.log(`  📄 First few documents in '${collectionName}':`);
            allSnapshot.docs.slice(0, 2).forEach((doc, index) => {
              const data = doc.data();
              console.log(`    Document ${index + 1} (ID: ${doc.id}):`, data);
              console.log('    Available fields:', Object.keys(data));
              
              // Check if this looks like a processed drawing
              const hasDrawingFields = data['kyhieuquanday'] || data['tenbangve'] || data['congsuat'] || data['tbkt'] || 
                                     data['ky_hieu_quan_day'] || data['ten_bang_ve'] || data['cong_suat'] || data['tb_kt'];
              if (hasDrawingFields) {
                console.log(`    ✅ This looks like a processed drawing!`);
              } else {
                console.log(`    ⚠️  This doesn't look like a processed drawing`);
              }
            });
          }
        } catch (error) {
          console.log(`❌ Collection '${collectionName}' error:`, error instanceof Error ? error.message : String(error));
        }
      }
      
      console.log(`📈 Total documents found across all collections: ${totalFound}`);
      console.log('=== END DEBUG ===');
      
    } catch (error) {
      console.error('❌ Error debugging database data:', error);
    }
  }

  /**
   * Test Firebase connection và tạo dữ liệu mẫu nếu cần
   */
  async testAndCreateSampleData(): Promise<void> {
    try {
      console.log('🧪 Testing Firebase connection and creating sample data...');
      
      // Test connection
      try {
        const testQuery = query(collection(this.firestore, 'test'));
        await getDocs(testQuery);
        console.log('✅ Firebase connection is working');
      } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return;
      }

      // Check if we already have data in original collections
      const possibleCollections = ['bangve', 'quan_day', 'boi_day_ha', 'boi_day_cao', 'ep_boi_day'];
      let totalExisting = 0;
      
      for (const collectionName of possibleCollections) {
        try {
          const existingQuery = query(collection(this.firestore, collectionName));
          const existingSnapshot = await getDocs(existingQuery);
          totalExisting += existingSnapshot.size;
        } catch (error) {
          console.log(`Error checking collection ${collectionName}:`, error);
        }
      }
      
      if (totalExisting > 0) {
        console.log(`✅ Found ${totalExisting} existing documents in original collections`);
        return;
      }

      console.log('⚠️ No existing data found in original collections. Sample data should be created in the appropriate collection based on business logic.');

    } catch (error) {
      console.error('❌ Error testing and creating sample data:', error);
      throw error;
    }
  }

  /**
   * Tạo dữ liệu mẫu để test (chỉ dùng trong development)
   * @deprecated Sample data should be created in appropriate original collections
   */
  async createSampleData(): Promise<void> {
    console.log('⚠️ createSampleData is deprecated. Sample data should be created in appropriate original collections based on business logic.');
    return this.testAndCreateSampleData();
  }
}
