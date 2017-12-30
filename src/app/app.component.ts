import { Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SelectableTableDataProvider } from './selectable-table';

@Component({
  selector: 'mst-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  dataProvider = new SampleDataProvider();
}

class SampleDataProvider implements SelectableTableDataProvider {

  /*
   * 以下のようなテーブルを表示する。
   * |    c1 |    c2 | ←キー名
   * | Col 1 | Col 2 | ←表示名
   * |-------|-------|
   * |     1 |  text |
   * |     2 |  text |
   *   ...
   * |   100 |  text |
   */

  headerDef: { [key: string]: string } = {
    'c1': 'Col 1',
    'c2': 'Col 2',
  };

  getRecords(pageIndex: number, pageSize: number): Observable<{ [key: string]: string }[]> {
    const startRow = 1 + (pageIndex * pageSize);
    const endRow = Math.min(startRow + pageSize, 101);
    const data: { [key: string]: string }[] = [];

    for (let row = startRow; row < endRow; row++) {
      data.push({
        'c1': `${row}`,
        'c2': 'text',
      });
    }
    return new BehaviorSubject(data);
  }

}
