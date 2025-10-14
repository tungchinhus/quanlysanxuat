import { Injectable } from '@angular/core';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface BdHaData {
  id?: string;
  masothe_bd_ha?: string;
  kyhieubangve: string;
  ngaygiacong: Date;
  nguoigiacong: string;
  quycachday: string;
  sosoiday: number;
  ngaysanxuat: Date;
  nhasanxuat: string;
  chuvikhuon: number;
  kt_bung_bd: number;
  chieuquanday: boolean;
  mayquanday?: string;
  // Xung quanh fields
  xungquanh_2?: number;
  xungquanh_3?: number;
  xungquanh_4?: number;
  xungquanh_6?: number;
  xungquanh_8?: number;
  // Hai đầu fields
  haidau_2?: number;
  haidau_3?: number;
  haidau_4?: number;
  haidau_6?: number;
  haidau_8?: number;
  // Một đầu fields
  mot_dau_2?: number;
  mot_dau_3?: number;
  mot_dau_4?: number;
  mot_dau_6?: number;
  mot_dau_8?: number;
  // QTD a12 fields
  qtda12_2?: number;
  qtda12_3?: number;
  qtda12_4?: number;
  qtda12_6?: number;
  qtda12_8?: number;
  // Chu vi bối dây hạ trong
  chuvi_bd_trong_1p?: number;
  chuvi_bd_trong_2p?: number;
  chuvi_bd_trong_3p?: number;
  // KT bối dây hạ trong
  kt_boiday_trong_1p?: number;
  kt_boiday_trong_2p?: number;
  kt_boiday_trong_3p?: number;
  // KT bối dây hạ ngoài
  kt_bd_ngoai_1p?: number;
  kt_bd_ngoai_2p?: number;
  kt_bd_ngoai_3p?: number;
  // Điện trở hạ
  dientroRa?: number;
  dientroRb?: number;
  dientroRc?: number;
  dolechdientro?: number;
  trang_thai: number;
  trang_thai_approve?: string; // 'pending', 'approved', 'rejected'
  user_update?: string;
  created_at: Date;
  updated_at?: Date;
  khau_sx?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseBdHaService {
  private firestore: Firestore;
  private readonly COLLECTION_NAME = 'tbl_bd_ha';

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Remove undefined fields from object to prevent Firebase errors
   */
  private removeUndefinedFields(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * Map Firestore data to BdHaData interface
   */
  private mapFirestoreDataToBdHaData(doc: DocumentSnapshot): BdHaData {
    const data = doc.data();
    return {
      id: doc.id,
      masothe_bd_ha: data?.['masothe_bd_ha'] || '',
      kyhieubangve: data?.['kyhieubangve'] || '',
      ngaygiacong: data?.['ngaygiacong']?.toDate() || new Date(),
      nguoigiacong: data?.['nguoigiacong'] || '',
      quycachday: data?.['quycachday'] || '',
      sosoiday: data?.['sosoiday'] || 0,
      ngaysanxuat: data?.['ngaysanxuat']?.toDate() || new Date(),
      nhasanxuat: data?.['nhasanxuat'] || '',
      chuvikhuon: data?.['chuvikhuon'] || 0,
      kt_bung_bd: data?.['kt_bung_bd'] || 0,
      chieuquanday: data?.['chieuquanday'] || false,
      mayquanday: data?.['mayquanday'] || '',
      // Xung quanh fields
      xungquanh_2: data?.['xungquanh_2'] || 0,
      xungquanh_3: data?.['xungquanh_3'] || 0,
      xungquanh_4: data?.['xungquanh_4'] || 0,
      xungquanh_6: data?.['xungquanh_6'] || 0,
      xungquanh_8: data?.['xungquanh_8'] || 0,
      // Hai đầu fields
      haidau_2: data?.['haidau_2'] || 0,
      haidau_3: data?.['haidau_3'] || 0,
      haidau_4: data?.['haidau_4'] || 0,
      haidau_6: data?.['haidau_6'] || 0,
      haidau_8: data?.['haidau_8'] || 0,
      // Một đầu fields
      mot_dau_2: data?.['mot_dau_2'] || 0,
      mot_dau_3: data?.['mot_dau_3'] || 0,
      mot_dau_4: data?.['mot_dau_4'] || 0,
      mot_dau_6: data?.['mot_dau_6'] || 0,
      mot_dau_8: data?.['mot_dau_8'] || 0,
      // QTD a12 fields
      qtda12_2: data?.['qtda12_2'] || 0,
      qtda12_3: data?.['qtda12_3'] || 0,
      qtda12_4: data?.['qtda12_4'] || 0,
      qtda12_6: data?.['qtda12_6'] || 0,
      qtda12_8: data?.['qtda12_8'] || 0,
      // Chu vi bối dây hạ trong
      chuvi_bd_trong_1p: data?.['chuvi_bd_trong_1p'] || 0,
      chuvi_bd_trong_2p: data?.['chuvi_bd_trong_2p'] || 0,
      chuvi_bd_trong_3p: data?.['chuvi_bd_trong_3p'] || 0,
      // KT bối dây hạ trong
      kt_boiday_trong_1p: data?.['kt_boiday_trong_1p'] || 0,
      kt_boiday_trong_2p: data?.['kt_boiday_trong_2p'] || 0,
      kt_boiday_trong_3p: data?.['kt_boiday_trong_3p'] || 0,
      // KT bối dây hạ ngoài
      kt_bd_ngoai_1p: data?.['kt_bd_ngoai_1p'] || 0,
      kt_bd_ngoai_2p: data?.['kt_bd_ngoai_2p'] || 0,
      kt_bd_ngoai_3p: data?.['kt_bd_ngoai_3p'] || 0,
      // Điện trở hạ
      dientroRa: data?.['dientroRa'] || 0,
      dientroRb: data?.['dientroRb'] || 0,
      dientroRc: data?.['dientroRc'] || 0,
      dolechdientro: data?.['dolechdientro'] || 0,
      trang_thai: data?.['trang_thai'] || 0,
      trang_thai_approve: data?.['trang_thai_approve'] || 'pending',
      user_update: data?.['user_update'] || '',
      created_at: data?.['created_at']?.toDate() || new Date(),
      updated_at: data?.['updated_at']?.toDate() || new Date(),
      khau_sx: data?.['khau_sx'] || ''
    };
  }

  /**
   * Create a new bd_ha record in Firebase
   */
  async createBdHa(bdHaData: Omit<BdHaData, 'id'>): Promise<string> {
    try {
      console.log('Creating bd_ha with data:', bdHaData);
      
      const now = new Date();
      const data = {
        ...bdHaData,
        trang_thai_approve: bdHaData.trang_thai_approve || 'pending', // Ensure trang_thai_approve is set to 'pending' if not provided
        created_at: Timestamp.fromDate(now),
        updated_at: Timestamp.fromDate(now)
      };
      
      // Remove undefined fields before saving to Firebase
      const cleanedData = this.removeUndefinedFields(data);
      
      console.log('Data to save to Firebase:', cleanedData);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), cleanedData);
      console.log('BdHa created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating bd_ha:', error);
      throw error;
    }
  }

  /**
   * Get all bd_ha documents from Firebase
   */
  async getAllBdHa(): Promise<BdHaData[]> {
    try {
      console.log('Getting all bd_ha from Firebase...');
      
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTION_NAME));
      const bdHaList: BdHaData[] = [];
      
      querySnapshot.forEach((doc) => {
        const bdHa = this.mapFirestoreDataToBdHaData(doc);
        bdHaList.push(bdHa);
      });
      
      console.log('Retrieved bd_ha records:', bdHaList.length);
      return bdHaList;
    } catch (error) {
      console.error('Error getting bd_ha from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get bd_ha by multiple IDs
   */
  async getBdHaByIds(ids: string[]): Promise<BdHaData[]> {
    try {
      console.log('Getting bd_ha by IDs:', ids);
      
      if (ids.length === 0) {
        return [];
      }
      
      const bdHaList: BdHaData[] = [];
      
      // Firestore 'in' queries are limited to 10 items, so we need to batch them
      const batchSize = 10;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        
        const q = query(
          collection(this.firestore, this.COLLECTION_NAME),
          where('__name__', 'in', batch)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const bdHa = this.mapFirestoreDataToBdHaData(doc);
          bdHaList.push(bdHa);
        });
      }
      
      console.log('Retrieved bd_ha records by IDs:', bdHaList.length);
      return bdHaList;
    } catch (error) {
      console.error('Error getting bd_ha by IDs from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get bd_ha by kyhieubangve
   */
  async getBdHaByKyHieuBangVe(kyhieubangve: string): Promise<BdHaData[]> {
    try {
      console.log('Getting bd_ha for kyhieubangve:', kyhieubangve);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('kyhieubangve', '==', kyhieubangve)
      );
      
      const querySnapshot = await getDocs(q);
      const bdHaList: BdHaData[] = [];
      
      querySnapshot.forEach((doc) => {
        const bdHa = this.mapFirestoreDataToBdHaData(doc);
        bdHaList.push(bdHa);
      });
      
      console.log('Retrieved bd_ha records for kyhieubangve:', bdHaList.length);
      return bdHaList;
    } catch (error) {
      console.error('Error getting bd_ha by kyhieubangve from Firebase:', error);
      throw error;
    }
  }

  /**
   * Update bd_ha status
   */
  async updateBdHaStatus(id: string, trangThai: number): Promise<void> {
    try {
      console.log('Updating bd_ha status for ID:', id, 'to status:', trangThai);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        trang_thai: trangThai,
        updated_at: Timestamp.fromDate(new Date())
      });
      
      console.log('BdHa status updated successfully');
    } catch (error) {
      console.error('Error updating bd_ha status:', error);
      throw error;
    }
  }

  /**
   * Update bd_ha approval status
   */
  async updateBdHaApprovalStatus(id: string, trangThaiApprove: string): Promise<void> {
    try {
      console.log('Updating bd_ha approval status for ID:', id, 'to approval status:', trangThaiApprove);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      
      // Prepare update data
      const updateData: any = {
        trang_thai_approve: trangThaiApprove,
        updated_at: Timestamp.fromDate(new Date())
      };
      
      // If approved, also update trang_thai from 1 to 2
      if (trangThaiApprove === 'approved') {
        updateData.trang_thai = 2;
        console.log('Also updating trang_thai to 2 for approved status');
      }
      
      await updateDoc(docRef, updateData);
      
      console.log('BdHa approval status updated successfully');
    } catch (error) {
      console.error('Error updating bd_ha approval status:', error);
      throw error;
    }
  }

  /**
   * Delete bd_ha record
   */
  async deleteBdHa(id: string): Promise<void> {
    try {
      console.log('Deleting bd_ha with ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('BdHa deleted successfully');
    } catch (error) {
      console.error('Error deleting bd_ha:', error);
      throw error;
    }
  }
}