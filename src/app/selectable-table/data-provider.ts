import { Observable } from 'rxjs/Observable';

/**
 * SelectableTableComponentにデータを提供するクラス。
 */
export interface SelectableTableDataProvider {

  /**
   * テーブルに表示するデータを取得する。
   *
   * @param pageIndex 表示するページ番号。0オリジン。
   * @param pageSize 1ページあたりの表示行数。
   */
  getRecords(pageIndex: number, pageSize: number): Observable<{ [key: string]: string }[]>;

}
