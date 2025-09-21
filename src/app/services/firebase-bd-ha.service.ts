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
  xungquanh: number;
  haidau: number;
  kt_boiday_trong?: string;
  chuvi_bd_trong?: number;
  kt_bd_ngoai?: string;
  dientroRa?: number;
  dientroRb?: number;
  dientroRc?: number;
  dolechdientro?: number;
  trang_thai: number;
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
   * Create a new bd_ha record in Firebase
   */
  async createBdHa(bdHaData: Omit<BdHaData, 'id'>): Promise<string> {
    try {
      console.log('Creating bd_ha with data:', bdHaData);
      
      const now = new Date();
      const data = {
        ...bdHaData,
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
        const data = doc.data();
        const bdHa: BdHaData = {
          id: doc.id,
          masothe_bd_ha: data['masothe_bd_ha'] || '',
          kyhieubangve: data['kyhieubangve'] || '',
          ngaygiacong: data['ngaygiacong']?.toDate() || new Date(),
          nguoigiacong: data['nguoigiacong'] || '',
          quycachday: data['quycachday'] || '',
          sosoiday: data['sosoiday'] || 0,
          ngaysanxuat: data['ngaysanxuat']?.toDate() || new Date(),
          nhasanxuat: data['nhasanxuat'] || '',
          chuvikhuon: data['chuvikhuon'] || 0,
          kt_bung_bd: data['kt_bung_bd'] || 0,
          chieuquanday: data['chieuquanday'] || false,
          mayquanday: data['mayquanday'] || '',
          xungquanh: data['xungquanh'] || 0,
          haidau: data['haidau'] || 0,
          kt_boiday_trong: data['kt_boiday_trong'] || '',
          chuvi_bd_trong: data['chuvi_bd_trong'] || 0,
          kt_bd_ngoai: data['kt_bd_ngoai'] || '',
          dientroRa: data['dientroRa'] || 0,
          dientroRb: data['dientroRb'] || 0,
          dientroRc: data['dientroRc'] || 0,
          dolechdientro: data['dolechdientro'] || 0,
          trang_thai: data['trang_thai'] || 0,
          user_update: data['user_update'] || '',
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          khau_sx: data['khau_sx'] || ''
        };
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
        const data = doc.data();
        const bdHa: BdHaData = {
          id: doc.id,
          masothe_bd_ha: data['masothe_bd_ha'] || '',
          kyhieubangve: data['kyhieubangve'] || '',
          ngaygiacong: data['ngaygiacong']?.toDate() || new Date(),
          nguoigiacong: data['nguoigiacong'] || '',
          quycachday: data['quycachday'] || '',
          sosoiday: data['sosoiday'] || 0,
          ngaysanxuat: data['ngaysanxuat']?.toDate() || new Date(),
          nhasanxuat: data['nhasanxuat'] || '',
          chuvikhuon: data['chuvikhuon'] || 0,
          kt_bung_bd: data['kt_bung_bd'] || 0,
          chieuquanday: data['chieuquanday'] || false,
          mayquanday: data['mayquanday'] || '',
          xungquanh: data['xungquanh'] || 0,
          haidau: data['haidau'] || 0,
          kt_boiday_trong: data['kt_boiday_trong'] || '',
          chuvi_bd_trong: data['chuvi_bd_trong'] || 0,
          kt_bd_ngoai: data['kt_bd_ngoai'] || '',
          dientroRa: data['dientroRa'] || 0,
          dientroRb: data['dientroRb'] || 0,
          dientroRc: data['dientroRc'] || 0,
          dolechdientro: data['dolechdientro'] || 0,
          trang_thai: data['trang_thai'] || 0,
          user_update: data['user_update'] || '',
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          khau_sx: data['khau_sx'] || ''
        };
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
