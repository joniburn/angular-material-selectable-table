import 'rxjs/add/operator/delay';
import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SelectableTableDataProvider } from './selectable-table';
import { ThemeManagerService } from './theme-manager.service';

@Component({
  selector: 'mst-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements AfterViewInit {
  dataProvider = new SampleDataProvider();
  tableThemeIsDark = false;
  tableIsClickable = true;
  tableIsSelectable = true;
  length: number;

  selectedRows = '[]';
  clickedRow = '';

  constructor(
    public themeManagerService: ThemeManagerService,
  ) {
  }

  ngAfterViewInit() {
    // 画面表示後5秒間はローディング表示にする
    setTimeout(() => this.length = 100, 5000);
  }

  onSelectionChange(selection: number[]) {
    this.selectedRows = JSON.stringify(selection);
  }

  onRowClicked(row: number) {
    this.clickedRow = '' + row;
  }
}

class SampleDataProvider implements SelectableTableDataProvider {

  /*
   * 以下のようなテーブルを表示する。
   * |    c1 |    c2 |                      c3 | ←キー名
   * | Col 1 | Col 2 |                   Col 3 | ←表示名
   * |-------|-------|-------------------------|
   * |     1 |  text |               long text |
   * |     2 |  text | long long long ... text |
   *   ...
   * |   100 |  text |               long text |
   */

  headerDef: { [key: string]: string } = {
    'c1': 'Col 1',
    'c2': 'Col 2',
    'c3': 'Col 3',
  };

  getRecords(pageIndex: number, pageSize: number): Observable<{ [key: string]: string }[]> {
    const startRow = 1 + (pageIndex * pageSize);
    const endRow = Math.min(startRow + pageSize, 101);
    const data: { [key: string]: string }[] = [];

    for (let row = startRow; row < endRow; row++) {
      let c3Text = 'long text';
      if (row === 2) {
        for (let i = 0; i < 20; i++) {
          c3Text = 'long ' + c3Text;
        }
      }
      data.push({
        'c1': `${row}`,
        'c2': 'text',
        'c3': c3Text,
      });
    }
    return new BehaviorSubject(data).delay(2000);  // 次ページの表示に2秒かける
  }

}
