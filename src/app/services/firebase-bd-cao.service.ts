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

export interface BdCaoData {
  id?: string;
  masothe_bd_cao?: string;
  kyhieubangve: string;
  ngaygiacong: Date;
  nguoigiacong: string;
  quycachday: string;
  sosoiday: number;
  ngaysanxuat: Date;
  nhasanxuat: string;
  chieuquanday: boolean;
  mayquanday?: string;
  xungquanh: number;
  haidau: number;
  bd_tt?: string;
  chuvi_bd_tt?: number;
  dientroRa?: number;
  dientroRb?: number;
  dientroRc?: number;
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
export class FirebaseBdCaoService {
  private firestore: Firestore;
  private readonly COLLECTION_NAME = 'tbl_bd_cao';

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
   * Create a new bd_cao record in Firebase
   */
  async createBdCao(bdCaoData: Omit<BdCaoData, 'id'>): Promise<string> {
    try {
      console.log('Creating bd_cao with data:', bdCaoData);
      
      const now = new Date();
      const data = {
        ...bdCaoData,
        trang_thai_approve: bdCaoData.trang_thai_approve || 'pending', // Ensure trang_thai_approve is set to 'pending' if not provided
        created_at: Timestamp.fromDate(now),
        updated_at: Timestamp.fromDate(now)
      };
      
      // Remove undefined fields before saving to Firebase
      const cleanedData = this.removeUndefinedFields(data);
      
      console.log('Data to save to Firebase:', cleanedData);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), cleanedData);
      console.log('BdCao created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating bd_cao:', error);
      throw error;
    }
  }

  /**
   * Get all bd_cao documents from Firebase
   */
  async getAllBdCao(): Promise<BdCaoData[]> {
    try {
      console.log('Getting all bd_cao from Firebase...');
      
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTION_NAME));
      const bdCaoList: BdCaoData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bdCao: BdCaoData = {
          id: doc.id,
          masothe_bd_cao: data['masothe_bd_cao'] || '',
          kyhieubangve: data['kyhieubangve'] || '',
          ngaygiacong: data['ngaygiacong']?.toDate() || new Date(),
          nguoigiacong: data['nguoigiacong'] || '',
          quycachday: data['quycachday'] || '',
          sosoiday: data['sosoiday'] || 0,
          ngaysanxuat: data['ngaysanxuat']?.toDate() || new Date(),
          nhasanxuat: data['nhasanxuat'] || '',
          chieuquanday: data['chieuquanday'] || false,
          mayquanday: data['mayquanday'] || '',
          xungquanh: data['xungquanh'] || 0,
          haidau: data['haidau'] || 0,
          bd_tt: data['bd_tt'] || '',
          chuvi_bd_tt: data['chuvi_bd_tt'] || 0,
          dientroRa: data['dientroRa'] || 0,
          dientroRb: data['dientroRb'] || 0,
          dientroRc: data['dientroRc'] || 0,
          trang_thai: data['trang_thai'] || 0,
          trang_thai_approve: data['trang_thai_approve'] || 'pending', // Default to pending
          user_update: data['user_update'] || '',
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          khau_sx: data['khau_sx'] || ''
        };
        bdCaoList.push(bdCao);
      });
      
      console.log('Retrieved bd_cao records:', bdCaoList.length);
      return bdCaoList;
    } catch (error) {
      console.error('Error getting bd_cao from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get bd_cao by kyhieubangve
   */
  async getBdCaoByKyHieuBangVe(kyhieubangve: string): Promise<BdCaoData[]> {
    try {
      console.log('Getting bd_cao for kyhieubangve:', kyhieubangve);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('kyhieubangve', '==', kyhieubangve)
      );
      
      const querySnapshot = await getDocs(q);
      const bdCaoList: BdCaoData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bdCao: BdCaoData = {
          id: doc.id,
          masothe_bd_cao: data['masothe_bd_cao'] || '',
          kyhieubangve: data['kyhieubangve'] || '',
          ngaygiacong: data['ngaygiacong']?.toDate() || new Date(),
          nguoigiacong: data['nguoigiacong'] || '',
          quycachday: data['quycachday'] || '',
          sosoiday: data['sosoiday'] || 0,
          ngaysanxuat: data['ngaysanxuat']?.toDate() || new Date(),
          nhasanxuat: data['nhasanxuat'] || '',
          chieuquanday: data['chieuquanday'] || false,
          mayquanday: data['mayquanday'] || '',
          xungquanh: data['xungquanh'] || 0,
          haidau: data['haidau'] || 0,
          bd_tt: data['bd_tt'] || '',
          chuvi_bd_tt: data['chuvi_bd_tt'] || 0,
          dientroRa: data['dientroRa'] || 0,
          dientroRb: data['dientroRb'] || 0,
          dientroRc: data['dientroRc'] || 0,
          trang_thai: data['trang_thai'] || 0,
          trang_thai_approve: data['trang_thai_approve'] || 'pending', // Default to pending
          user_update: data['user_update'] || '',
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          khau_sx: data['khau_sx'] || ''
        };
        bdCaoList.push(bdCao);
      });
      
      console.log('Retrieved bd_cao records for kyhieubangve:', bdCaoList.length);
      return bdCaoList;
    } catch (error) {
      console.error('Error getting bd_cao by kyhieubangve from Firebase:', error);
      throw error;
    }
  }

  /**
   * Update bd_cao status
   */
  async updateBdCaoStatus(id: string, trangThai: number): Promise<void> {
    try {
      console.log('Updating bd_cao status for ID:', id, 'to status:', trangThai);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        trang_thai: trangThai,
        updated_at: Timestamp.fromDate(new Date())
      });
      
      console.log('BdCao status updated successfully');
    } catch (error) {
      console.error('Error updating bd_cao status:', error);
      throw error;
    }
  }

  /**
   * Update bd_cao approval status
   */
  async updateBdCaoApprovalStatus(id: string, trangThaiApprove: string): Promise<void> {
    try {
      console.log('Updating bd_cao approval status for ID:', id, 'to approval status:', trangThaiApprove);
      
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
      
      console.log('BdCao approval status updated successfully');
    } catch (error) {
      console.error('Error updating bd_cao approval status:', error);
      throw error;
    }
  }

  /**
   * Delete bd_cao record
   */
  async deleteBdCao(id: string): Promise<void> {
    try {
      console.log('Deleting bd_cao with ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('BdCao deleted successfully');
    } catch (error) {
      console.error('Error deleting bd_cao:', error);
      throw error;
    }
  }
}
