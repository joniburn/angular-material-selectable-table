import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk/collections';

import { SelectableTableDataProvider } from './data-provider';

export interface TableRecord {
  rowNumber: number;  // 行番号。0オリジン。
  data: { [key: string]: string };
}

export class TableDataSource extends DataSource<TableRecord> {

  dataChange: BehaviorSubject<TableRecord[]> =
    new BehaviorSubject<TableRecord[]>([]);

  constructor(private dataProvider: SelectableTableDataProvider) {
    super();
  }

  connect(): Observable<TableRecord[]> {
    return this.dataChange;
  }

  disconnect() {}

  setPage(pageIndex: number, pageSize: number) {
    this.dataProvider.getRecords(pageIndex, pageSize).subscribe((data) => {
      const tableRecords: TableRecord[] = data.map((row, index) => {
        return <TableRecord>{
          rowNumber: index,
          data: row,
        };
      });
      this.dataChange.next(tableRecords);
    });
  }

}
