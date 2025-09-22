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
import { KcsApproveData, KcsApproveCreateData, KcsApproveUpdateData } from '../models/kcs-approve.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseKcsApproveService {
  private firestore: Firestore;

  // Collection name for KCS approval data
  private readonly COLLECTION_NAME = 'kcs_approve';

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Remove undefined fields from object before saving to Firebase
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
   * Create a new KCS approval record in Firebase
   * @param kcsApproveData - The KCS approval data to save
   * @returns Promise<string> - The document ID of the created KCS approval record
   */
  async createKcsApprove(kcsApproveData: KcsApproveCreateData): Promise<string> {
    try {
      console.log('Creating KCS approval with data:', kcsApproveData);
      
      const now = new Date();
      const data = {
        ...kcsApproveData,
        created_at: Timestamp.fromDate(now),
        updated_at: Timestamp.fromDate(now)
      };
      
      // Remove undefined fields before saving to Firebase
      const cleanedData = this.removeUndefinedFields(data);
      
      console.log('Data to save to Firebase:', cleanedData);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), cleanedData);
      console.log('KCS approval created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating KCS approval:', error);
      throw error;
    }
  }

  /**
   * Get all KCS approval documents from Firebase
   * @returns Promise<KcsApproveData[]> - Array of KCS approval data
   */
  async getAllKcsApprove(): Promise<KcsApproveData[]> {
    try {
      console.log('Fetching all KCS approvals from Firebase');
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const kcsApproves: KcsApproveData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const kcsApprove: KcsApproveData = {
          id: doc.id,
          kyhieubangve: data['kyhieubangve'],
          id_boiday: data['id_boiday'],
          masothe_bd: data['masothe_bd'],
          user_kcs_approve: data['user_kcs_approve'],
          kcs_approve_status: data['kcs_approve_status'],
          ghi_chu: data['ghi_chu'],
          ngay_approve: data['ngay_approve']?.toDate(),
          created_at: data['created_at']?.toDate(),
          updated_at: data['updated_at']?.toDate()
        };
        kcsApproves.push(kcsApprove);
      });
      
      console.log(`Fetched ${kcsApproves.length} KCS approvals`);
      return kcsApproves;
    } catch (error) {
      console.error('Error fetching KCS approvals:', error);
      throw error;
    }
  }

  /**
   * Get KCS approval by document ID
   * @param id - Document ID
   * @returns Promise<KcsApproveData | null> - KCS approval data or null if not found
   */
  async getKcsApproveById(id: string): Promise<KcsApproveData | null> {
    try {
      console.log('Fetching KCS approval by ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const kcsApprove: KcsApproveData = {
          id: docSnap.id,
          kyhieubangve: data['kyhieubangve'],
          id_boiday: data['id_boiday'],
          masothe_bd: data['masothe_bd'],
          user_kcs_approve: data['user_kcs_approve'],
          kcs_approve_status: data['kcs_approve_status'],
          ghi_chu: data['ghi_chu'],
          ngay_approve: data['ngay_approve']?.toDate(),
          created_at: data['created_at']?.toDate(),
          updated_at: data['updated_at']?.toDate()
        };
        return kcsApprove;
      } else {
        console.log('No KCS approval found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('Error fetching KCS approval by ID:', error);
      throw error;
    }
  }

  /**
   * Get KCS approvals by bối dây ID
   * @param idBoiday - Bối dây ID
   * @returns Promise<KcsApproveData[]> - Array of KCS approval data
   */
  async getKcsApproveByBoidayId(idBoiday: string): Promise<KcsApproveData[]> {
    try {
      console.log('Fetching KCS approvals by bối dây ID:', idBoiday);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('id_boiday', '==', idBoiday),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const kcsApproves: KcsApproveData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const kcsApprove: KcsApproveData = {
          id: doc.id,
          kyhieubangve: data['kyhieubangve'],
          id_boiday: data['id_boiday'],
          masothe_bd: data['masothe_bd'],
          user_kcs_approve: data['user_kcs_approve'],
          kcs_approve_status: data['kcs_approve_status'],
          ghi_chu: data['ghi_chu'],
          ngay_approve: data['ngay_approve']?.toDate(),
          created_at: data['created_at']?.toDate(),
          updated_at: data['updated_at']?.toDate()
        };
        kcsApproves.push(kcsApprove);
      });
      
      console.log(`Fetched ${kcsApproves.length} KCS approvals for bối dây ID: ${idBoiday}`);
      return kcsApproves;
    } catch (error) {
      console.error('Error fetching KCS approvals by bối dây ID:', error);
      throw error;
    }
  }

  /**
   * Get KCS approvals by user
   * @param userKcsApprove - User KCS approve
   * @returns Promise<KcsApproveData[]> - Array of KCS approval data
   */
  async getKcsApproveByUser(userKcsApprove: string): Promise<KcsApproveData[]> {
    try {
      console.log('Fetching KCS approvals by user:', userKcsApprove);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('user_kcs_approve', '==', userKcsApprove),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const kcsApproves: KcsApproveData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const kcsApprove: KcsApproveData = {
          id: doc.id,
          kyhieubangve: data['kyhieubangve'],
          id_boiday: data['id_boiday'],
          masothe_bd: data['masothe_bd'],
          user_kcs_approve: data['user_kcs_approve'],
          kcs_approve_status: data['kcs_approve_status'],
          ghi_chu: data['ghi_chu'],
          ngay_approve: data['ngay_approve']?.toDate(),
          created_at: data['created_at']?.toDate(),
          updated_at: data['updated_at']?.toDate()
        };
        kcsApproves.push(kcsApprove);
      });
      
      console.log(`Fetched ${kcsApproves.length} KCS approvals for user: ${userKcsApprove}`);
      return kcsApproves;
    } catch (error) {
      console.error('Error fetching KCS approvals by user:', error);
      throw error;
    }
  }

  /**
   * Update KCS approval record
   * @param id - Document ID
   * @param updateData - Data to update
   * @returns Promise<void>
   */
  async updateKcsApprove(id: string, updateData: Partial<KcsApproveUpdateData>): Promise<void> {
    try {
      console.log('Updating KCS approval with ID:', id, 'Data:', updateData);
      
      const now = new Date();
      const data = {
        ...updateData,
        updated_at: Timestamp.fromDate(now)
      };
      
      // Remove undefined fields before saving to Firebase
      const cleanedData = this.removeUndefinedFields(data);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await updateDoc(docRef, cleanedData);
      
      console.log('KCS approval updated successfully');
    } catch (error) {
      console.error('Error updating KCS approval:', error);
      throw error;
    }
  }

  /**
   * Delete KCS approval record
   * @param id - Document ID
   * @returns Promise<void>
   */
  async deleteKcsApprove(id: string): Promise<void> {
    try {
      console.log('Deleting KCS approval with ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('KCS approval deleted successfully');
    } catch (error) {
      console.error('Error deleting KCS approval:', error);
      throw error;
    }
  }

  /**
   * Get KCS approvals by status
   * @param status - KCS approve status
   * @returns Promise<KcsApproveData[]> - Array of KCS approval data
   */
  async getKcsApproveByStatus(status: string): Promise<KcsApproveData[]> {
    try {
      console.log('Fetching KCS approvals by status:', status);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('kcs_approve_status', '==', status),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const kcsApproves: KcsApproveData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const kcsApprove: KcsApproveData = {
          id: doc.id,
          kyhieubangve: data['kyhieubangve'],
          id_boiday: data['id_boiday'],
          masothe_bd: data['masothe_bd'],
          user_kcs_approve: data['user_kcs_approve'],
          kcs_approve_status: data['kcs_approve_status'],
          ghi_chu: data['ghi_chu'],
          ngay_approve: data['ngay_approve']?.toDate(),
          created_at: data['created_at']?.toDate(),
          updated_at: data['updated_at']?.toDate()
        };
        kcsApproves.push(kcsApprove);
      });
      
      console.log(`Fetched ${kcsApproves.length} KCS approvals with status: ${status}`);
      return kcsApproves;
    } catch (error) {
      console.error('Error fetching KCS approvals by status:', error);
      throw error;
    }
  }
}
