import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SimpleChange } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CdkTableModule } from '@angular/cdk/table';

import { SelectableTableComponent } from './selectable-table.component';
import { SelectableTableDataProvider } from './data-provider';

describe('SelectableTableComponent', () => {
  let component: SelectableTableComponent;
  let fixture: ComponentFixture<SelectableTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelectableTableComponent,
      ],
      imports :[
        CdkTableModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントを初期化できること', () => {
    expect(component).toBeTruthy();
  });

  it('データを表示できること', () => {
    const dataProvider = new TestDataProvider(20, 5);
    component.dataProvider = dataProvider;
    component.length = 20;
    component.headers = dataProvider.headerDef;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
      'length': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    // ヘッダー部分の確認
    const headerRowList = fixture.debugElement.queryAll(By.css('cdk-header-row'));
    expect(headerRowList.length).toBe(1, 'cdk-header-rowが1個あること');
    const headerRow1 = headerRowList[0];
    const headerCellList = headerRow1.queryAll(By.css('cdk-header-cell'));
    expect(headerCellList.length).toBe(5, 'その中にcdk-header-cellが5個あること');
    for (let i = 0; i < 5; i++) {
      const elm = headerCellList[i].nativeElement as Element;
      const headerText = elm.textContent;
      expect(headerText).toBe(`d0${i + 1}`, 'ヘッダーのテキストが d01 ～ d05 であること');
    }

    // テーブル本体部分の確認
    const rowList = fixture.debugElement.queryAll(By.css('cdk-row'));
    expect(rowList.length).toBe(20, 'cdk-rowが20個あること');
    rowList.forEach((row, rowNumber) => {
      const cellList = row.queryAll(By.css('cdk-cell'));
      expect(cellList.length).toBe(5, 'それぞれの中にcdk-cellが5個あること');
      for (let i = 0; i < 5; i++) {
        const elm = cellList[i].nativeElement as Element;
        const cellText = elm.textContent;
        const expected = `${pad(rowNumber + 1)}-${pad(i + 1)}`;
        expect(cellText).toBe(expected, 'セルの内容が正しいこと');
      }
    });
  });

});

/**
 * 以下のようなテストデータを生成するクラス。
 *
 * |   c01 |   c02 |   c03 |   c04 |   c05 | ←キー名
 * |   d01 |   d02 |   d03 |   d04 |   d05 | ←表示名
 * |-------|-------|-------|-------|-------|
 * | 01-01 | 01-02 | 01-03 | 01-04 | 01-05 |
 * | 02-01 | 02-02 | 02-03 | 02-04 | 02-05 |
 *   ...
 * | 20-01 | 20-02 | 20-03 | 20-04 | 20-05 |
 */
class TestDataProvider implements SelectableTableDataProvider {

  headerDef: {[key: string]: string};

  constructor(
    private nrows: number,
    private ncols: number,
  ) {
    // キー名と表示名のマッピングを作成
    this.headerDef = {};
    for (let i = 1; i <= this.ncols; i++) {
      this.headerDef[`c${pad(i)}`] = `d${pad(i)}`;
    }
  }

  getRecords(pageIndex: number, pageSize: number): Observable<{ [key: string]: string }[]> {
    const records: { [key: string]: string }[] = [];

    // 行データを作成
    for (let row = 1; row <= this.nrows; row++) {
      const data: { [key: string]: string } = {};
      for (let col = 1; col <= this.ncols; col++) {
        data[`c${pad(col)}`] = `${pad(row)}-${pad(col)}`;
      }
      records.push(data);
    }
    return new BehaviorSubject<{ [key: string]: string }[]>(records);  // TODO ページング処理
  }

}

/**
 * 数値を0パディングした2桁の文字列に変換する。
 *
 * @param num 対象の数値
 */
function pad(num: number): string {
  return `0${num}`.slice(-2);
}
