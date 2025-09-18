import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Drawing, DrawingCreate, DrawingUpdate, DrawingStats } from '../models/drawing.model';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  private drawingsCollection: AngularFirestoreCollection<Drawing>;
  private drawingsSubject = new BehaviorSubject<Drawing[]>([]);
  public drawings$ = this.drawingsSubject.asObservable();

  constructor(private firestore: AngularFirestore) {
    this.drawingsCollection = this.firestore.collection<Drawing>('drawings');
    this.loadDrawings();
  }

  /**
   * Tải danh sách bảng vẽ từ Firebase
   */
  private loadDrawings(): void {
    this.drawingsCollection.snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Drawing;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      )
      .subscribe(drawings => {
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

    await this.drawingsCollection.add(newDrawing);
  }

  /**
   * Cập nhật bảng vẽ
   */
  async updateDrawing(id: string, drawing: DrawingUpdate): Promise<void> {
    const updateData = {
      ...drawing,
      ngayCapNhat: new Date()
    };

    await this.drawingsCollection.doc(id).update(updateData);
  }

  /**
   * Xóa bảng vẽ
   */
  async deleteDrawing(id: string): Promise<void> {
    await this.drawingsCollection.doc(id).delete();
  }

  /**
   * Xóa nhiều bảng vẽ
   */
  async deleteMultipleDrawings(ids: string[]): Promise<void> {
    const batch = this.firestore.firestore.batch();
    
    ids.forEach(id => {
      const docRef = this.drawingsCollection.doc(id).ref;
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
    const existingDrawings = await this.drawingsCollection.ref.get();
    if (existingDrawings.empty) {
      for (const drawing of sampleDrawings) {
        await this.addDrawing(drawing);
      }
    }
  }
}
