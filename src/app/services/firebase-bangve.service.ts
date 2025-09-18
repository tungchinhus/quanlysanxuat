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
import { BangVeData } from '../components/ds-bangve/ds-bangve.component';

@Injectable({
  providedIn: 'root'
})
export class FirebaseBangVeService {
  private firestore: Firestore;

  // Collection name for bang ve (drawing boards)
  private readonly COLLECTION_NAME = 'bangve';

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Create a new bang ve (drawing board) in Firebase
   * @param bangVeData - The drawing board data to save
   * @returns Promise<string> - The document ID of the created bang ve
   */
  async createBangVe(bangVeData: Omit<BangVeData, 'id'>): Promise<string> {
    try {
      console.log('Creating bang ve with data:', bangVeData);
      
      const now = new Date();
      const data = {
        ...bangVeData,
        trang_thai: 0, // Ensure trang_thai is 0 for new drawing boards
        created_at: Timestamp.fromDate(now),
        updated_at: Timestamp.fromDate(now),
        isActive: true
      };
      
      console.log('Data to save to Firebase:', data);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), data);
      console.log('Bang ve created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating bang ve:', error);
      throw error;
    }
  }

  /**
   * Get all bang ve documents from Firebase
   * @returns Promise<BangVeData[]> - Array of all bang ve documents
   */
  async getAllBangVe(): Promise<BangVeData[]> {
    try {
      console.log('Fetching all bang ve from Firebase...');
      
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTION_NAME));
      const bangVeList: BangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bangVe: BangVeData = {
          id: parseInt(doc.id) || 0, // Convert string ID to number or use 0 as fallback
          kyhieubangve: data['kyhieubangve'] || '',
          congsuat: data['congsuat'] || 0,
          tbkt: data['tbkt'] || '',
          dienap: data['dienap'] || '',
          soboiday: data['soboiday'] || '',
          bd_ha_trong: data['bd_ha_trong'] || '',
          bd_ha_ngoai: data['bd_ha_ngoai'] || '',
          bd_cao: data['bd_cao'] || '',
          bd_ep: data['bd_ep'] || '',
          bung_bd: data['bung_bd'] || 0,
          user_create: data['user_create'] || '',
          trang_thai: data['trang_thai'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          username: data['username'] || data['user_create'] || '',
          email: data['email'] || '',
          role_name: data['role_name'] || 'user',
          IsActive: data['isActive'] !== undefined ? data['isActive'] : true
        };
        bangVeList.push(bangVe);
      });
      
      console.log('Fetched bang ve list:', bangVeList);
      return bangVeList;
    } catch (error) {
      console.error('Error fetching bang ve:', error);
      throw error;
    }
  }

  /**
   * Get bang ve by ID
   * @param id - The document ID
   * @returns Promise<BangVeData | null> - The bang ve data or null if not found
   */
  async getBangVeById(id: string): Promise<BangVeData | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: parseInt(id) || 0,
          kyhieubangve: data['kyhieubangve'] || '',
          congsuat: data['congsuat'] || 0,
          tbkt: data['tbkt'] || '',
          dienap: data['dienap'] || '',
          soboiday: data['soboiday'] || '',
          bd_ha_trong: data['bd_ha_trong'] || '',
          bd_ha_ngoai: data['bd_ha_ngoai'] || '',
          bd_cao: data['bd_cao'] || '',
          bd_ep: data['bd_ep'] || '',
          bung_bd: data['bung_bd'] || 0,
          user_create: data['user_create'] || '',
          trang_thai: data['trang_thai'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          username: data['username'] || data['user_create'] || '',
          email: data['email'] || '',
          role_name: data['role_name'] || 'user',
          IsActive: data['isActive'] !== undefined ? data['isActive'] : true
        };
      } else {
        console.log('No bang ve found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('Error fetching bang ve by ID:', error);
      throw error;
    }
  }

  /**
   * Update bang ve by ID
   * @param id - The document ID
   * @param bangVeData - The updated bang ve data
   * @returns Promise<void>
   */
  async updateBangVe(id: string, bangVeData: Partial<BangVeData>): Promise<void> {
    try {
      console.log('Updating bang ve with ID:', id, 'Data:', bangVeData);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const updateData = {
        ...bangVeData,
        updated_at: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updateData);
      console.log('Bang ve updated successfully');
    } catch (error) {
      console.error('Error updating bang ve:', error);
      throw error;
    }
  }

  /**
   * Delete bang ve by ID (soft delete by setting isActive to false)
   * @param id - The document ID
   * @returns Promise<void>
   */
  async deleteBangVe(id: string): Promise<void> {
    try {
      console.log('Deleting bang ve with ID:', id);
      
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updated_at: Timestamp.fromDate(new Date())
      });
      
      console.log('Bang ve deleted successfully');
    } catch (error) {
      console.error('Error deleting bang ve:', error);
      throw error;
    }
  }

  /**
   * Get bang ve by status
   * @param trang_thai - The status to filter by
   * @returns Promise<BangVeData[]> - Array of bang ve with the specified status
   */
  async getBangVeByStatus(trang_thai: number): Promise<BangVeData[]> {
    try {
      console.log('Fetching bang ve with status:', trang_thai);
      
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('trang_thai', '==', trang_thai),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const bangVeList: BangVeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bangVe: BangVeData = {
          id: parseInt(doc.id) || 0,
          kyhieubangve: data['kyhieubangve'] || '',
          congsuat: data['congsuat'] || 0,
          tbkt: data['tbkt'] || '',
          dienap: data['dienap'] || '',
          soboiday: data['soboiday'] || '',
          bd_ha_trong: data['bd_ha_trong'] || '',
          bd_ha_ngoai: data['bd_ha_ngoai'] || '',
          bd_cao: data['bd_cao'] || '',
          bd_ep: data['bd_ep'] || '',
          bung_bd: data['bung_bd'] || 0,
          user_create: data['user_create'] || '',
          trang_thai: data['trang_thai'] || 0,
          created_at: data['created_at']?.toDate() || new Date(),
          username: data['username'] || data['user_create'] || '',
          email: data['email'] || '',
          role_name: data['role_name'] || 'user',
          IsActive: data['isActive'] !== undefined ? data['isActive'] : true
        };
        bangVeList.push(bangVe);
      });
      
      console.log('Fetched bang ve with status', trang_thai, ':', bangVeList);
      return bangVeList;
    } catch (error) {
      console.error('Error fetching bang ve by status:', error);
      throw error;
    }
  }

  /**
   * Check if collection exists and create it if it doesn't
   * @returns Promise<void>
   */
  async ensureCollectionExists(): Promise<void> {
    try {
      // Try to get a document to check if collection exists
      const testQuery = query(collection(this.firestore, this.COLLECTION_NAME), limit(1));
      await getDocs(testQuery);
      console.log('Collection', this.COLLECTION_NAME, 'exists');
    } catch (error) {
      console.log('Collection', this.COLLECTION_NAME, 'does not exist, will be created on first document add');
      // In Firestore, collections are created automatically when the first document is added
    }
  }
}
