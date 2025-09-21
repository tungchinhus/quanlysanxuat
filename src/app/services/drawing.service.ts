import { Injectable } from '@angular/core';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { firestore } from '../../firebase.config';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Drawing, DrawingCreate, DrawingUpdate, DrawingStats } from '../models/drawing.model';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  private drawingsCollection = collection(firestore, 'drawings');
  private drawingsSubject = new BehaviorSubject<Drawing[]>([]);
  public drawings$ = this.drawingsSubject.asObservable();

  constructor() {
    this.loadDrawings();
  }

  /**
   * Tải danh sách bảng vẽ từ Firebase
   */
  private loadDrawings(): void {
    const q = query(this.drawingsCollection, orderBy('ngayTao', 'desc'));
    
    onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const drawings: Drawing[] = [];
      querySnapshot.forEach((doc: DocumentSnapshot) => {
        const data = doc.data() as Omit<Drawing, 'id'>;
        const id = doc.id;
        drawings.push({ id, ...data });
      });
      this.drawingsSubject.next(drawings);
    });
  }

  /**
   * Lấy danh sách tất cả bảng vẽ
   */
  getDrawings(): Observable<Drawing[]> {
    return this.drawings$;
  }

  /**
   * Lấy bảng vẽ theo trạng thái
   */
  getDrawingsByStatus(status: 'new' | 'processing' | 'completed' | 'error'): Observable<Drawing[]> {
    return this.drawings$.pipe(
      map(drawings => drawings.filter(drawing => drawing.trangThai === status))
    );
  }

  /**
   * Lấy bảng vẽ theo ID
   */
  getDrawingById(id: string): Observable<Drawing | undefined> {
    return this.drawings$.pipe(
      map(drawings => drawings.find(drawing => drawing.id === id))
    );
  }

  /**
   * Thêm bảng vẽ mới
   */
  async addDrawing(drawing: DrawingCreate): Promise<void> {
    const newDrawing: Omit<Drawing, 'id'> = {
      ...drawing,
      ngayTao: new Date(),
      trangThai: 'new',
      ngayCapNhat: new Date()
    };

    await addDoc(this.drawingsCollection, newDrawing);
  }

  /**
   * Cập nhật bảng vẽ
   */
  async updateDrawing(id: string, drawing: DrawingUpdate): Promise<void> {
    const updateData = {
      ...drawing,
      ngayCapNhat: new Date()
    };

    const drawingDoc = doc(this.drawingsCollection, id);
    await updateDoc(drawingDoc, updateData);
  }

  /**
   * Xóa bảng vẽ
   */
  async deleteDrawing(id: string): Promise<void> {
    const drawingDoc = doc(this.drawingsCollection, id);
    await deleteDoc(drawingDoc);
  }

  /**
   * Xóa nhiều bảng vẽ
   */
  async deleteMultipleDrawings(ids: string[]): Promise<void> {
    const batch = writeBatch(firestore);
    
    ids.forEach(id => {
      const docRef = doc(this.drawingsCollection, id);
      batch.delete(docRef);
    });

    await batch.commit();
  }

  /**
   * Tìm kiếm bảng vẽ
   */
  searchDrawings(searchTerm: string): Observable<Drawing[]> {
    return this.drawings$.pipe(
      map(drawings => 
        drawings.filter(drawing => 
          drawing.kyHieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drawing.tbkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drawing.dienAp.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  /**
   * Lấy thống kê bảng vẽ
   */
  getDrawingStats(): Observable<DrawingStats> {
    return this.drawings$.pipe(
      map(drawings => {
        const stats: DrawingStats = {
          total: drawings.length,
          new: 0,
          processing: 0,
          completed: 0,
          error: 0
        };

        drawings.forEach(drawing => {
          switch (drawing.trangThai) {
            case 'new':
              stats.new++;
              break;
            case 'processing':
              stats.processing++;
              break;
            case 'completed':
              stats.completed++;
              break;
            case 'error':
              stats.error++;
              break;
          }
        });

        return stats;
      })
    );
  }

  /**
   * Cập nhật trạng thái bảng vẽ
   */
  async updateDrawingStatus(id: string, status: 'new' | 'processing' | 'completed' | 'error', nguoiXuLy?: string): Promise<void> {
    const updateData: DrawingUpdate = {
      trangThai: status,
      nguoiXuLy,
      ngayCapNhat: new Date()
    };

    await this.updateDrawing(id, updateData);
  }

  /**
   * Làm mới dữ liệu
   */
  refreshDrawings(): void {
    this.loadDrawings();
  }

  /**
   * Tạo dữ liệu mẫu cho testing
   */
  async createSampleData(): Promise<void> {
    const sampleDrawings: DrawingCreate[] = [
      {
        kyHieu: '1000-39N-25086T',
        congSuat: 1000,
        tbkt: '25086T',
        dienAp: '22/0.4',
        ghiChu: 'Máy biến áp 1000kVA',
        nguoiTao: 'admin'
      },
      {
        kyHieu: 'BV_TEST_002',
        congSuat: 2000,
        tbkt: 'IBKT002',
        dienAp: '380',
        ghiChu: 'Máy biến áp 2000kVA',
        nguoiTao: 'admin'
      },
      {
        kyHieu: '1500-45N-30001T',
        congSuat: 1500,
        tbkt: '30001T',
        dienAp: '35/0.4',
        ghiChu: 'Máy biến áp 1500kVA',
        nguoiTao: 'admin'
      }
    ];

    // Check if data already exists
    const existingDrawings = await getDocs(this.drawingsCollection);
    if (existingDrawings.empty) {
      for (const drawing of sampleDrawings) {
        await this.addDrawing(drawing);
      }
    }
  }
}
