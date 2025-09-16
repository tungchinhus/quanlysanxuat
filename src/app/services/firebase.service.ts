import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, setDoc, query, where, orderBy, limit, getDocs, startAfter } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { BangVe } from '../models/bangve.model';
import { BdCao } from '../models/bd-cao.model';
import { BdHa } from '../models/bd-ha.model';
import { EpBoiday } from '../models/ep-boiday.model';
import { KcsApprove } from '../models/kcs-approve.model';
import { UserBangVe } from '../models/user-bangve.model';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);

  // Collection names
  private readonly COLLECTIONS = {
    BANGVE: 'tbl_bangve',
    BD_CAO: 'tbl_bd_cao',
    BD_HA: 'tbl_bd_ha',
    EP_BOIDAY: 'tbl_ep_boiday',
    KCS_APPROVE: 'tbl_kcs_approve',
    USER_BANGVE: 'tbl_user_bangve',
    USERS: 'users',
    ROLES: 'roles'
  };

  // BangVe operations
  getBangVeList(): Observable<BangVe[]> {
    const bangVeRef = collection(this.firestore, this.COLLECTIONS.BANGVE);
    return collectionData(bangVeRef, { idField: 'id' }) as Observable<BangVe[]>;
  }

  getBangVeById(id: string): Observable<BangVe | undefined> {
    const bangVeRef = doc(this.firestore, this.COLLECTIONS.BANGVE, id);
    return docData(bangVeRef, { idField: 'id' }) as Observable<BangVe | undefined>;
  }

  addBangVe(bangVe: Omit<BangVe, 'id'>): Promise<any> {
    const bangVeRef = collection(this.firestore, this.COLLECTIONS.BANGVE);
    return addDoc(bangVeRef, bangVe);
  }

  updateBangVe(id: string, bangVe: Partial<BangVe>): Promise<void> {
    const bangVeRef = doc(this.firestore, this.COLLECTIONS.BANGVE, id);
    return updateDoc(bangVeRef, bangVe);
  }

  deleteBangVe(id: string): Promise<void> {
    const bangVeRef = doc(this.firestore, this.COLLECTIONS.BANGVE, id);
    return deleteDoc(bangVeRef);
  }

  // BdCao operations
  getBdCaoList(): Observable<BdCao[]> {
    const bdCaoRef = collection(this.firestore, this.COLLECTIONS.BD_CAO);
    return collectionData(bdCaoRef, { idField: 'id' }) as Observable<BdCao[]>;
  }

  getBdCaoById(id: string): Observable<BdCao | undefined> {
    const bdCaoRef = doc(this.firestore, this.COLLECTIONS.BD_CAO, id);
    return docData(bdCaoRef, { idField: 'id' }) as Observable<BdCao | undefined>;
  }

  addBdCao(bdCao: Omit<BdCao, 'id'>): Promise<any> {
    const bdCaoRef = collection(this.firestore, this.COLLECTIONS.BD_CAO);
    return addDoc(bdCaoRef, bdCao);
  }

  updateBdCao(id: string, bdCao: Partial<BdCao>): Promise<void> {
    const bdCaoRef = doc(this.firestore, this.COLLECTIONS.BD_CAO, id);
    return updateDoc(bdCaoRef, bdCao);
  }

  deleteBdCao(id: string): Promise<void> {
    const bdCaoRef = doc(this.firestore, this.COLLECTIONS.BD_CAO, id);
    return deleteDoc(bdCaoRef);
  }

  // BdHa operations
  getBdHaList(): Observable<BdHa[]> {
    const bdHaRef = collection(this.firestore, this.COLLECTIONS.BD_HA);
    return collectionData(bdHaRef, { idField: 'id' }) as Observable<BdHa[]>;
  }

  getBdHaById(id: string): Observable<BdHa | undefined> {
    const bdHaRef = doc(this.firestore, this.COLLECTIONS.BD_HA, id);
    return docData(bdHaRef, { idField: 'id' }) as Observable<BdHa | undefined>;
  }

  addBdHa(bdHa: Omit<BdHa, 'id'>): Promise<any> {
    const bdHaRef = collection(this.firestore, this.COLLECTIONS.BD_HA);
    return addDoc(bdHaRef, bdHa);
  }

  updateBdHa(id: string, bdHa: Partial<BdHa>): Promise<void> {
    const bdHaRef = doc(this.firestore, this.COLLECTIONS.BD_HA, id);
    return updateDoc(bdHaRef, bdHa);
  }

  deleteBdHa(id: string): Promise<void> {
    const bdHaRef = doc(this.firestore, this.COLLECTIONS.BD_HA, id);
    return deleteDoc(bdHaRef);
  }

  // EpBoiday operations
  getEpBoidayList(): Observable<EpBoiday[]> {
    const epBoidayRef = collection(this.firestore, this.COLLECTIONS.EP_BOIDAY);
    return collectionData(epBoidayRef, { idField: 'id' }) as Observable<EpBoiday[]>;
  }

  getEpBoidayById(id: string): Observable<EpBoiday | undefined> {
    const epBoidayRef = doc(this.firestore, this.COLLECTIONS.EP_BOIDAY, id);
    return docData(epBoidayRef, { idField: 'id' }) as Observable<EpBoiday | undefined>;
  }

  addEpBoiday(epBoiday: Omit<EpBoiday, 'id'>): Promise<any> {
    const epBoidayRef = collection(this.firestore, this.COLLECTIONS.EP_BOIDAY);
    return addDoc(epBoidayRef, epBoiday);
  }

  updateEpBoiday(id: string, epBoiday: Partial<EpBoiday>): Promise<void> {
    const epBoidayRef = doc(this.firestore, this.COLLECTIONS.EP_BOIDAY, id);
    return updateDoc(epBoidayRef, epBoiday);
  }

  deleteEpBoiday(id: string): Promise<void> {
    const epBoidayRef = doc(this.firestore, this.COLLECTIONS.EP_BOIDAY, id);
    return deleteDoc(epBoidayRef);
  }

  // KcsApprove operations
  getKcsApproveList(): Observable<KcsApprove[]> {
    const kcsApproveRef = collection(this.firestore, this.COLLECTIONS.KCS_APPROVE);
    return collectionData(kcsApproveRef, { idField: 'id' }) as Observable<KcsApprove[]>;
  }

  getKcsApproveById(id: string): Observable<KcsApprove | undefined> {
    const kcsApproveRef = doc(this.firestore, this.COLLECTIONS.KCS_APPROVE, id);
    return docData(kcsApproveRef, { idField: 'id' }) as Observable<KcsApprove | undefined>;
  }

  addKcsApprove(kcsApprove: Omit<KcsApprove, 'id'>): Promise<any> {
    const kcsApproveRef = collection(this.firestore, this.COLLECTIONS.KCS_APPROVE);
    return addDoc(kcsApproveRef, kcsApprove);
  }

  updateKcsApprove(id: string, kcsApprove: Partial<KcsApprove>): Promise<void> {
    const kcsApproveRef = doc(this.firestore, this.COLLECTIONS.KCS_APPROVE, id);
    return updateDoc(kcsApproveRef, kcsApprove);
  }

  deleteKcsApprove(id: string): Promise<void> {
    const kcsApproveRef = doc(this.firestore, this.COLLECTIONS.KCS_APPROVE, id);
    return deleteDoc(kcsApproveRef);
  }

  // UserBangVe operations
  getUserBangVeList(): Observable<UserBangVe[]> {
    const userBangVeRef = collection(this.firestore, this.COLLECTIONS.USER_BANGVE);
    return collectionData(userBangVeRef, { idField: 'id' }) as Observable<UserBangVe[]>;
  }

  getUserBangVeById(id: string): Observable<UserBangVe | undefined> {
    const userBangVeRef = doc(this.firestore, this.COLLECTIONS.USER_BANGVE, id);
    return docData(userBangVeRef, { idField: 'id' }) as Observable<UserBangVe | undefined>;
  }

  addUserBangVe(userBangVe: Omit<UserBangVe, 'id'>): Promise<any> {
    const userBangVeRef = collection(this.firestore, this.COLLECTIONS.USER_BANGVE);
    return addDoc(userBangVeRef, userBangVe);
  }

  updateUserBangVe(id: string, userBangVe: Partial<UserBangVe>): Promise<void> {
    const userBangVeRef = doc(this.firestore, this.COLLECTIONS.USER_BANGVE, id);
    return updateDoc(userBangVeRef, userBangVe);
  }

  deleteUserBangVe(id: string): Promise<void> {
    const userBangVeRef = doc(this.firestore, this.COLLECTIONS.USER_BANGVE, id);
    return deleteDoc(userBangVeRef);
  }

  // Query methods
  getBangVeByKyHieu(kyhieubangve: string): Observable<BangVe[]> {
    const bangVeRef = collection(this.firestore, this.COLLECTIONS.BANGVE);
    const q = query(bangVeRef, where('kyhieubangve', '==', kyhieubangve));
    return collectionData(q, { idField: 'id' }) as Observable<BangVe[]>;
  }

  getBdCaoByKyHieu(kyhieubangve: string): Observable<BdCao[]> {
    const bdCaoRef = collection(this.firestore, this.COLLECTIONS.BD_CAO);
    const q = query(bdCaoRef, where('kyhieubangve', '==', kyhieubangve));
    return collectionData(q, { idField: 'id' }) as Observable<BdCao[]>;
  }

  getBdHaByKyHieu(kyhieubangve: string): Observable<BdHa[]> {
    const bdHaRef = collection(this.firestore, this.COLLECTIONS.BD_HA);
    const q = query(bdHaRef, where('kyhieubangve', '==', kyhieubangve));
    return collectionData(q, { idField: 'id' }) as Observable<BdHa[]>;
  }

  getEpBoidayByKyHieu(kyhieubangve: string): Observable<EpBoiday[]> {
    const epBoidayRef = collection(this.firestore, this.COLLECTIONS.EP_BOIDAY);
    const q = query(epBoidayRef, where('kyhieubangve', '==', kyhieubangve));
    return collectionData(q, { idField: 'id' }) as Observable<EpBoiday[]>;
  }

  getKcsApproveByKyHieu(kyhieubangve: string): Observable<KcsApprove[]> {
    const kcsApproveRef = collection(this.firestore, this.COLLECTIONS.KCS_APPROVE);
    const q = query(kcsApproveRef, where('kyhieubangve', '==', kyhieubangve));
    return collectionData(q, { idField: 'id' }) as Observable<KcsApprove[]>;
  }

  getUserBangVeByUserId(userId: string): Observable<UserBangVe[]> {
    const userBangVeRef = collection(this.firestore, this.COLLECTIONS.USER_BANGVE);
    const q = query(userBangVeRef, where('user_id', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<UserBangVe[]>;
  }

  // User operations
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    return from(getDocs(usersRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
    );
  }

  getUserById(id: string): Observable<User | undefined> {
    const userRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
    return docData(userRef, { idField: 'id' }) as Observable<User | undefined>;
  }

  getUserByEmail(email: string): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', email));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
    );
  }

  getUserByUsername(username: string): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    const q = query(usersRef, where('uid', '==', username));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
    );
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    const q = query(usersRef, where('role', '==', role));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
    );
  }

  getActiveUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    const q = query(usersRef, where('isActive', '==', true));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))
    );
  }

  addUser(user: Omit<User, 'id'>): Observable<any> {
    const docId = user.uid || Date.now().toString();
    const userRef = doc(this.firestore, this.COLLECTIONS.USERS, docId);
    return from(setDoc(userRef, { ...user, id: docId }));
  }

  updateUser(id: string, user: Partial<User>): Observable<void> {
    const userRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
    return from(updateDoc(userRef, user));
  }

  deleteUser(id: string): Observable<void> {
    const userRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
    return from(deleteDoc(userRef));
  }

  // Search users
  searchUsers(searchTerm: string): Observable<User[]> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    return from(getDocs(usersRef)).pipe(
      map(snapshot => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return users.filter(user => 
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  // Get users with pagination
  getUsersWithPagination(limitCount: number, lastDoc?: any): Observable<{ users: User[], lastDoc: any }> {
    const usersRef = collection(this.firestore, this.COLLECTIONS.USERS);
    let q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDoc) {
      q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
    }
    
    return from(getDocs(q)).pipe(
      map(snapshot => ({
        users: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)),
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      }))
    );
  }

  // Generic collection operations
  getCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' });
  }

  addDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return setDoc(docRef, data);
  }

  deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return deleteDoc(docRef);
  }
}
