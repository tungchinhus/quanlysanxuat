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
import { UserBangVeData } from './user-bangve.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUserBangVeService {
  private firestore: Firestore;

  // Collection name for user_bangve
  private readonly COLLECTION_NAME = 'user_bangve';

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Remove undefined fields from object to prevent Firebase errors
   * @param obj - Object to clean
   * @returns Cleaned object without undefined fields
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
   * Create a new user_bangve record in Firebase
   * @param userBangVeData - The user_bangve data to save
   * @returns Promise<string> - The document ID of the created user_bangve
   */
  async createUserBangVe(userBangVeData: Omit<UserBangVeData, 'id'>): Promise<string> {
    try {
      console.log('Creating user_bangve with data:', userBangVeData);
      
      const now = new Date();
      const data = {
        ...userBangVeData,
        created_at: Timestamp.fromDate(now),
        updated_at: Timestamp.fromDate(now),
        status: true
      };
      
      // Remove undefined fields before saving to Firebase
      const cleanedData = this.removeUndefinedFields(data);
      
      console.log('Data to save to Firebase:', cleanedData);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), cleanedData);
      console.log('UserBangVe created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating user_bangve:', error);
      throw error;
    }
  }

  /**
   * Create multiple user_bangve records in Firebase
   * @param userBangVeDataList - Array of user_bangve data to save
   * @returns Promise<string[]> - Array of document IDs of the created user_bangve records
   */
  async createMultipleUserBangVe(userBangVeDataList: Omit<UserBangVeData, 'id'>[]): Promise<string[]> {
    try {
      console.log('Creating multiple user_bangve records:', userBangVeDataList);
      
      const promises = userBangVeDataList.map(data => this.createUserBangVe(data));
      const docIds = await Promise.all(promises);
      
      console.log('Multiple UserBangVe records created with IDs:', docIds);
      return docIds;
    } catch (error) {
      console.error('Error creating multiple user_bangve records:', error);
      throw error;
    }
  }

  /**
   * Get all user_bangve documents from Firebase
   * @returns Promise<UserBangVeData[]> - Array of all user_bangve documents
   */
  async getAllUserBangVe(): Promise<UserBangVeData[]> {
    try {
      console.log('Getting all user_bangve from Firebase...');
      
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTION_NAME));
      const userBangVeList: UserBangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userBangVe: UserBangVeData = {
          id: parseInt(doc.id) || 0,
          user_id: data['user_id'] || 0,
          firebase_uid: data['firebase_uid'] || undefined,
          bangve_id: data['bangve_id'] || '', // String ID from Firebase
          bd_ha_id: data['bd_ha_id'] || undefined,
          bd_cao_id: data['bd_cao_id'] || undefined,
          bd_ep_id: data['bd_ep_id'] || undefined,
          permission_type: data['permission_type'] || 'gia_cong',
          status: data['status'] !== undefined ? data['status'] : true,
          trang_thai_bv: data['trang_thai_bv'] || 0,
          trang_thai_bd_ha: data['trang_thai_bd_ha'] || 0,
          trang_thai_bd_cao: data['trang_thai_bd_cao'] || 0,
          trang_thai_bd_ep: data['trang_thai_bd_ep'] || 0,
          assigned_at: data['assigned_at']?.toDate() || new Date(),
          assigned_by_user_id: data['assigned_by_user_id'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          created_by: data['created_by'] || 0,
          updated_by: data['updated_by'] || 0,
          // Legacy fields for backward compatibility
          khau_sx: data['khau_sx'] || '',
          trang_thai: data['trang_thai'] || 0
        };
        userBangVeList.push(userBangVe);
      });
      
      console.log('Retrieved user_bangve records:', userBangVeList.length);
      return userBangVeList;
    } catch (error) {
      console.error('Error getting user_bangve from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get user_bangve documents by user_id
   * @param userId - The user ID to filter by
   * @returns Promise<UserBangVeData[]> - Array of user_bangve documents for the user
   */
  async getUserBangVeByUserId(userId: number): Promise<UserBangVeData[]> {
    try {
      console.log('Getting user_bangve for user ID:', userId);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('user_id', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const userBangVeList: UserBangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userBangVe: UserBangVeData = {
          id: parseInt(doc.id) || 0,
          user_id: data['user_id'] || 0,
          firebase_uid: data['firebase_uid'] || undefined,
          bangve_id: data['bangve_id'] || '', // String ID from Firebase
          bd_ha_id: data['bd_ha_id'] || undefined,
          bd_cao_id: data['bd_cao_id'] || undefined,
          bd_ep_id: data['bd_ep_id'] || undefined,
          permission_type: data['permission_type'] || 'gia_cong',
          status: data['status'] !== undefined ? data['status'] : true,
          trang_thai_bv: data['trang_thai_bv'] || 0,
          trang_thai_bd_ha: data['trang_thai_bd_ha'] || 0,
          trang_thai_bd_cao: data['trang_thai_bd_cao'] || 0,
          trang_thai_bd_ep: data['trang_thai_bd_ep'] || 0,
          assigned_at: data['assigned_at']?.toDate() || new Date(),
          assigned_by_user_id: data['assigned_by_user_id'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          created_by: data['created_by'] || 0,
          updated_by: data['updated_by'] || 0,
          // Legacy fields for backward compatibility
          khau_sx: data['khau_sx'] || '',
          trang_thai: data['trang_thai'] || 0
        };
        userBangVeList.push(userBangVe);
      });
      
      console.log('Retrieved user_bangve records for user:', userBangVeList.length);
      return userBangVeList;
    } catch (error) {
      console.error('Error getting user_bangve by user ID from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get user_bangve documents by Firebase Authentication UID
   * @param firebaseUID - The Firebase Authentication UID to filter by
   * @returns Promise<UserBangVeData[]> - Array of user_bangve documents for the user
   */
  async getUserBangVeByFirebaseUID(firebaseUID: string): Promise<UserBangVeData[]> {
    try {
      console.log('Getting user_bangve for Firebase UID:', firebaseUID);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('firebase_uid', '==', firebaseUID)
      );
      
      const querySnapshot = await getDocs(q);
      const userBangVeList: UserBangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userBangVe: UserBangVeData = {
          id: parseInt(doc.id) || 0,
          user_id: data['user_id'] || 0,
          firebase_uid: data['firebase_uid'] || undefined,
          bangve_id: data['bangve_id'] || '', // String ID from Firebase
          bd_ha_id: data['bd_ha_id'] || undefined,
          bd_cao_id: data['bd_cao_id'] || undefined,
          bd_ep_id: data['bd_ep_id'] || undefined,
          permission_type: data['permission_type'] || 'gia_cong',
          status: data['status'] !== undefined ? data['status'] : true,
          trang_thai_bv: data['trang_thai_bv'] || 0,
          trang_thai_bd_ha: data['trang_thai_bd_ha'] || 0,
          trang_thai_bd_cao: data['trang_thai_bd_cao'] || 0,
          trang_thai_bd_ep: data['trang_thai_bd_ep'] || 0,
          assigned_at: data['assigned_at']?.toDate() || new Date(),
          assigned_by_user_id: data['assigned_by_user_id'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          created_by: data['created_by'] || 0,
          updated_by: data['updated_by'] || 0,
          // Legacy fields for backward compatibility
          khau_sx: data['khau_sx'] || '',
          trang_thai: data['trang_thai'] || 0
        };
        userBangVeList.push(userBangVe);
      });
      
      console.log('Retrieved user_bangve records for Firebase UID:', userBangVeList.length);
      return userBangVeList;
    } catch (error) {
      console.error('Error getting user_bangve by Firebase UID from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get user_bangve documents by bangve_id
   * @param bangveId - The bangve ID to filter by (string)
   * @returns Promise<UserBangVeData[]> - Array of user_bangve documents for the bangve
   */
  async getUserBangVeByBangVeId(bangveId: string): Promise<UserBangVeData[]> {
    try {
      console.log('Getting user_bangve for bangve ID:', bangveId);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('bangve_id', '==', bangveId)
      );
      
      const querySnapshot = await getDocs(q);
      const userBangVeList: UserBangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userBangVe: UserBangVeData = {
          id: parseInt(doc.id) || 0,
          user_id: data['user_id'] || 0,
          firebase_uid: data['firebase_uid'] || undefined,
          bangve_id: data['bangve_id'] || '', // String ID from Firebase
          bd_ha_id: data['bd_ha_id'] || undefined,
          bd_cao_id: data['bd_cao_id'] || undefined,
          bd_ep_id: data['bd_ep_id'] || undefined,
          permission_type: data['permission_type'] || 'gia_cong',
          status: data['status'] !== undefined ? data['status'] : true,
          trang_thai_bv: data['trang_thai_bv'] || 0,
          trang_thai_bd_ha: data['trang_thai_bd_ha'] || 0,
          trang_thai_bd_cao: data['trang_thai_bd_cao'] || 0,
          trang_thai_bd_ep: data['trang_thai_bd_ep'] || 0,
          assigned_at: data['assigned_at']?.toDate() || new Date(),
          assigned_by_user_id: data['assigned_by_user_id'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          updated_at: data['updated_at']?.toDate() || new Date(),
          created_by: data['created_by'] || 0,
          updated_by: data['updated_by'] || 0,
          // Legacy fields for backward compatibility
          khau_sx: data['khau_sx'] || '',
          trang_thai: data['trang_thai'] || 0
        };
        userBangVeList.push(userBangVe);
      });
      
      console.log('Retrieved user_bangve records for bangve:', userBangVeList.length);
      return userBangVeList;
    } catch (error) {
      console.error('Error getting user_bangve by bangve ID from Firebase:', error);
      throw error;
    }
  }

  /**
   * Update user_bangve status
   * @param id - The document ID to update
   * @param trangThai - The new status
   * @returns Promise<void>
   */
  async updateUserBangVeStatus(id: string, trangThai: number): Promise<void> {
    try {
      console.log('Updating user_bangve status for ID:', id, 'to status:', trangThai);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        trang_thai: trangThai,
        updated_at: Timestamp.fromDate(new Date())
      });
      
      console.log('UserBangVe status updated successfully');
    } catch (error) {
      console.error('Error updating user_bangve status:', error);
      throw error;
    }
  }

  /**
   * Delete user_bangve record
   * @param id - The document ID to delete
   * @returns Promise<void>
   */
  async deleteUserBangVe(id: string): Promise<void> {
    try {
      console.log('Deleting user_bangve with ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('UserBangVe deleted successfully');
    } catch (error) {
      console.error('Error deleting user_bangve:', error);
      throw error;
    }
  }

  /**
   * Ensure the user_bangve collection exists
   * @returns Promise<void>
   */
  async ensureCollectionExists(): Promise<void> {
    try {
      // Try to get a document to check if collection exists
      const q = query(collection(this.firestore, this.COLLECTION_NAME), limit(1));
      await getDocs(q);
      console.log('UserBangVe collection exists');
    } catch (error) {
      console.log('UserBangVe collection does not exist, it will be created on first write');
    }
  }
}
