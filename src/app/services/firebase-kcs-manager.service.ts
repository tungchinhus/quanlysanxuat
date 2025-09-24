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
  trang_thai_approve?: string; // KCS approval status: 'pending', 'approved', 'rejected'
  nguoigiacong: string;
  loai_boi_day: 'ha' | 'cao' | 'ep' | 'both';
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

  // Get bangve data by kyhieubangve
  private async getBangveDataByKyHieu(kyhieubangve: string): Promise<any> {
    try {
      if (!kyhieubangve) return null;
      
      // Try to find in bangve collection first
      const bangveQuery = query(
        collection(this.firestore, 'bangve'),
        where('kyhieubangve', '==', kyhieubangve)
      );
      const bangveSnapshot = await getDocs(bangveQuery);
      
      if (!bangveSnapshot.empty) {
        const data = bangveSnapshot.docs[0].data();
        return {
          kyhieuquanday: data['kyhieuquanday'] || data['ky_hieu_quan_day'] || '',
          tenbangve: data['tenbangve'] || data['ten_bang_ve'] || '',
          congsuat: data['congsuat'] || data['cong_suat'] || '',
          tbkt: data['tbkt'] || data['tb_kt'] || '',
          nhasanxuat: data['nhasanxuat'] || data['nha_san_xuat'] || '',
          ngaysanxuat: data['ngaysanxuat'] || data['ngay_san_xuat']
        };
      }
      
      // Try to find in quan_day collection
      const quanDayQuery = query(
        collection(this.firestore, 'quan_day'),
        where('kyhieubangve', '==', kyhieubangve)
      );
      const quanDaySnapshot = await getDocs(quanDayQuery);
      
      if (!quanDaySnapshot.empty) {
        const data = quanDaySnapshot.docs[0].data();
        return {
          kyhieuquanday: data['kyhieuquanday'] || data['ky_hieu_quan_day'] || '',
          tenbangve: data['tenbangve'] || data['ten_bang_ve'] || '',
          congsuat: data['congsuat'] || data['cong_suat'] || '',
          tbkt: data['tbkt'] || data['tb_kt'] || '',
          nhasanxuat: data['nhasanxuat'] || data['nha_san_xuat'] || '',
          ngaysanxuat: data['ngaysanxuat'] || data['ngay_san_xuat']
        };
      }
      
      return null;
    } catch (error) {
      console.log(`Error getting bangve data for ${kyhieubangve}:`, error);
      return null;
    }
  }

  // Map trang_thai_approve from string to string (for KCS approval status)
  private mapTrangThaiApprove(value: any): 'pending' | 'approved' | 'rejected' {
    if (!value) {
      return 'pending';
    }
    
    if (typeof value === 'string') {
      switch (value.toLowerCase()) {
        case 'pending': return 'pending';
        case 'approved': return 'approved';
        case 'rejected': return 'rejected';
        default: return 'pending';
      }
    }
    
    // Fallback for number values (legacy support)
    if (typeof value === 'number') {
      switch (value) {
        case 0: return 'pending';
        case 1: return 'approved';
        case 2: return 'rejected';
        default: return 'pending';
      }
    }
    
    return 'pending';
  }

  // Determine overall status when both bd_ha and bd_cao exist
  private determineOverallStatus(bdHaStatus: string, bdCaoStatus: string): 'pending' | 'approved' | 'rejected' {
    // If either is rejected, overall status is rejected
    if (bdHaStatus === 'rejected' || bdCaoStatus === 'rejected') {
      return 'rejected';
    }
    
    // If both are approved, overall status is approved
    if (bdHaStatus === 'approved' && bdCaoStatus === 'approved') {
      return 'approved';
    }
    
    // If any is pending, overall status is pending
    if (bdHaStatus === 'pending' || bdCaoStatus === 'pending') {
      return 'pending';
    }
    
    // Default to pending
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

      // Get data from tbl_bd_ha and tbl_bd_cao which contain the actual approval status
      const drawingsMap = new Map<string, ProcessedDrawingData>();
      
      // Fetch from tbl_bd_ha
      try {
        console.log('Getting documents from tbl_bd_ha for KCS Manager');
        const bdHaQuery = query(collection(this.firestore, 'tbl_bd_ha'));
        const bdHaSnapshot = await getDocs(bdHaQuery);
        console.log(`Found ${bdHaSnapshot.size} documents in tbl_bd_ha`);

        for (const doc of bdHaSnapshot.docs) {
          const data = doc.data();
          console.log(`BdHa document:`, doc.id, data);
          
          // Get corresponding bangve data
          const bangveData = await this.getBangveDataByKyHieu(data['kyhieubangve']);
          
          const drawing: ProcessedDrawingData = {
            id: doc.id,
            kyhieubangve: data['kyhieubangve'] || '',
            kyhieuquanday: bangveData?.kyhieuquanday || data['kyhieubangve'] || '',
            tenbangve: bangveData?.tenbangve || data['kyhieubangve'] || '',
            congsuat: bangveData?.congsuat || '',
            tbkt: bangveData?.tbkt || '',
            nhasanxuat: data['nhasanxuat'] || bangveData?.nhasanxuat || '',
            ngaysanxuat: this.toDateAny(data['ngaysanxuat'] || bangveData?.ngaysanxuat),
            ngaygiacong: this.toDateAny(data['ngaygiacong']),
            trang_thai: this.mapTrangThaiApprove(data['trang_thai_approve']),
            trang_thai_approve: data['trang_thai_approve'] || 'pending',
            nguoigiacong: data['nguoigiacong'] || '',
            loai_boi_day: 'ha' as 'ha' | 'cao' | 'ep',
            created_at: this.toDateAny(data['created_at']),
            updated_at: this.toDateAny(data['updated_at'])
          };

          // Use kyhieubangve as key to avoid duplicates
          drawingsMap.set(data['kyhieubangve'], drawing);
        }
      } catch (error) {
        console.log(`Error fetching from tbl_bd_ha:`, error);
      }

      // Fetch from tbl_bd_cao
      try {
        console.log('Getting documents from tbl_bd_cao for KCS Manager');
        const bdCaoQuery = query(collection(this.firestore, 'tbl_bd_cao'));
        const bdCaoSnapshot = await getDocs(bdCaoQuery);
        console.log(`Found ${bdCaoSnapshot.size} documents in tbl_bd_cao`);

        for (const doc of bdCaoSnapshot.docs) {
          const data = doc.data();
          console.log(`BdCao document:`, doc.id, data);
          
          // Get corresponding bangve data
          const bangveData = await this.getBangveDataByKyHieu(data['kyhieubangve']);
          
          const drawing: ProcessedDrawingData = {
            id: doc.id,
            kyhieubangve: data['kyhieubangve'] || '',
            kyhieuquanday: bangveData?.kyhieuquanday || data['kyhieubangve'] || '',
            tenbangve: bangveData?.tenbangve || data['kyhieubangve'] || '',
            congsuat: bangveData?.congsuat || '',
            tbkt: bangveData?.tbkt || '',
            nhasanxuat: data['nhasanxuat'] || bangveData?.nhasanxuat || '',
            ngaysanxuat: this.toDateAny(data['ngaysanxuat'] || bangveData?.ngaysanxuat),
            ngaygiacong: this.toDateAny(data['ngaygiacong']),
            trang_thai: this.mapTrangThaiApprove(data['trang_thai_approve']),
            trang_thai_approve: data['trang_thai_approve'] || 'pending',
            nguoigiacong: data['nguoigiacong'] || '',
            loai_boi_day: 'cao' as 'ha' | 'cao' | 'ep',
            created_at: this.toDateAny(data['created_at']),
            updated_at: this.toDateAny(data['updated_at'])
          };

          // Check if this kyhieubangve already exists
          if (drawingsMap.has(data['kyhieubangve'])) {
            // If exists, determine the overall status based on both bd_ha and bd_cao
            const existingDrawing = drawingsMap.get(data['kyhieubangve'])!;
            const overallStatus = this.determineOverallStatus(existingDrawing.trang_thai_approve || 'pending', data['trang_thai_approve'] || 'pending');
            
            // Update the existing drawing with overall status
            existingDrawing.trang_thai = overallStatus;
            existingDrawing.trang_thai_approve = overallStatus;
            existingDrawing.loai_boi_day = 'both'; // Indicate both types exist
          } else {
            // If not exists, add new drawing
            drawingsMap.set(data['kyhieubangve'], drawing);
          }
        }
      } catch (error) {
        console.log(`Error fetching from tbl_bd_cao:`, error);
      }

      // Convert map to array
      const allDrawings = Array.from(drawingsMap.values());

      // Apply search filter
      let filteredDrawings = allDrawings;
      if (criteria.searchTerm && criteria.searchTerm.trim()) {
        const searchLower = criteria.searchTerm.toLowerCase();
        filteredDrawings = allDrawings.filter(drawing =>
          (drawing.kyhieuquanday || '').toLowerCase().includes(searchLower) ||
          (drawing.tenbangve || '').toLowerCase().includes(searchLower) ||
          (drawing.congsuat || '').toLowerCase().includes(searchLower) ||
          (drawing.tbkt || '').toLowerCase().includes(searchLower) ||
          (drawing.nhasanxuat || '').toLowerCase().includes(searchLower) ||
          (drawing.nguoigiacong || '').toLowerCase().includes(searchLower)
        );
      }

      // Apply filtering for KCS Manager based on trang_thai_approve from tbl_bd_ha and tbl_bd_cao
      if (criteria.trang_thai === 'pending') {
        // Show drawings that have trang_thai_approve = 'pending' (not yet KCS checked)
        filteredDrawings = filteredDrawings.filter(drawing => {
          return drawing.trang_thai_approve === 'pending';
        });
        console.log(`After filtering for KCS Manager (pending approval): ${filteredDrawings.length} items remain`);
      } else if (criteria.trang_thai === 'approved') {
        // Show drawings that have trang_thai_approve = 'approved'
        filteredDrawings = filteredDrawings.filter(drawing => {
          return drawing.trang_thai_approve === 'approved';
        });
        console.log(`After filtering for KCS Manager (approved): ${filteredDrawings.length} items remain`);
      } else if (criteria.trang_thai === 'rejected') {
        // Show drawings that have trang_thai_approve = 'rejected'
        filteredDrawings = filteredDrawings.filter(drawing => {
          return drawing.trang_thai_approve === 'rejected';
        });
        console.log(`After filtering for KCS Manager (rejected): ${filteredDrawings.length} items remain`);
      }

      // Apply pagination
      const startIndex = (criteria.pageNumber - 1) * criteria.pageSize;
      const endIndex = startIndex + criteria.pageSize;
      const paginatedDrawings = filteredDrawings.slice(startIndex, endIndex);

      console.log(`Returning ${paginatedDrawings.length} real processed drawings`);

      // Debug logging
      console.log('=== KCS Manager Debug Info ===');
      console.log('Total drawings found:', allDrawings.length);
      console.log('After search filter:', filteredDrawings.length);
      console.log('After approval filter:', filteredDrawings.length);
      console.log('Final paginated results:', paginatedDrawings.length);
      
      // Log some sample data
      if (paginatedDrawings.length > 0) {
        console.log('Sample drawing data:');
        paginatedDrawings.slice(0, 3).forEach((drawing, index) => {
          console.log(`  ${index + 1}. ${drawing.kyhieubangve} - trang_thai: ${drawing.trang_thai}, trang_thai_approve: ${drawing.trang_thai_approve}`);
        });
      }
      console.log('=== End Debug Info ===');

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

  /**
   * Debug method để kiểm tra data trong các collection
   */
  public async debugCollectionData(): Promise<void> {
    console.log('=== DEBUG: Checking Collection Data ===');
    
    const collections = ['bangve', 'quan_day', 'boi_day_ha', 'boi_day_cao', 'ep_boi_day'];
    
    for (const collectionName of collections) {
      try {
        const q = query(collection(this.firestore, collectionName));
        const snapshot = await getDocs(q);
        console.log(`\n📁 Collection: ${collectionName}`);
        console.log(`   Total documents: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
          console.log('   Sample documents:');
          let index = 0;
          snapshot.forEach((doc) => {
            if (index < 3) { // Only show first 3 documents
              const data = doc.data();
              console.log(`     ${index + 1}. ID: ${doc.id}`);
              console.log(`        kyhieubangve: ${data['kyhieubangve'] || data['ky_hieu_bang_ve'] || 'N/A'}`);
              console.log(`        trang_thai: ${data['trang_thai'] || 'N/A'}`);
              console.log(`        trang_thai_approve: ${data['trang_thai_approve'] || 'N/A'}`);
              console.log(`        created_at: ${data['created_at'] || 'N/A'}`);
              index++;
            }
          });
        }
      } catch (error) {
        console.error(`Error checking collection ${collectionName}:`, error);
      }
    }
    
    console.log('\n=== END DEBUG ===');
  }

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
              trang_thai: this.mapTrangThaiApprove(data['trang_thai_approve'] || data['trang_thai'] || 'pending'),
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
      // Find the drawing by kyhieubangve first
      let kyhieubangve = '';
      
      // Try to find in tbl_bd_ha first
      try {
        const bdHaDoc = doc(this.firestore, 'tbl_bd_ha', id);
        const bdHaSnap = await getDocs(query(collection(this.firestore, 'tbl_bd_ha'), where('__name__', '==', id)));
        if (!bdHaSnap.empty) {
          kyhieubangve = bdHaSnap.docs[0].data()['kyhieubangve'];
        }
      } catch (error) {
        // Try tbl_bd_cao
        try {
          const bdCaoSnap = await getDocs(query(collection(this.firestore, 'tbl_bd_cao'), where('__name__', '==', id)));
          if (!bdCaoSnap.empty) {
            kyhieubangve = bdCaoSnap.docs[0].data()['kyhieubangve'];
          }
        } catch (error2) {
          console.log('Could not find document in either collection');
        }
      }

      if (!kyhieubangve) {
        console.error(`Could not find kyhieubangve for document ${id}`);
        return false;
      }

      // Update all documents with the same kyhieubangve
      const collections = ['tbl_bd_ha', 'tbl_bd_cao'];
      let updatedCount = 0;

      for (const collectionName of collections) {
        try {
          const q = query(
            collection(this.firestore, collectionName),
            where('kyhieubangve', '==', kyhieubangve)
          );
          const snapshot = await getDocs(q);
          
          for (const docSnapshot of snapshot.docs) {
            await updateDoc(doc(this.firestore, collectionName, docSnapshot.id), {
              trang_thai_approve: status,
              updated_at: Timestamp.fromDate(new Date())
            });
            updatedCount++;
            console.log(`Updated document ${docSnapshot.id} in ${collectionName} to status ${status}`);
          }
        } catch (error) {
          console.log(`Error updating collection ${collectionName}:`, error);
        }
      }

      if (updatedCount > 0) {
        console.log(`Successfully updated ${updatedCount} documents with kyhieubangve ${kyhieubangve}`);
        return true;
      } else {
        console.error(`No documents found with kyhieubangve ${kyhieubangve}`);
        return false;
      }

    } catch (error) {
      console.error('Error updating drawing approval status in original collection:', error);
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
