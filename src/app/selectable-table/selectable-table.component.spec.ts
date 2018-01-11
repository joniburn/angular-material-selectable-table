import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SimpleChange } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CdkTableModule } from '@angular/cdk/table';
import { MatCheckboxModule, MatPaginatorModule } from '@angular/material';

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
      imports: [
        NoopAnimationsModule,
        CdkTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
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
    expect(component).toBeTruthy('コンポーネントを初期化できること');
    const matPaginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(matPaginator).toBeTruthy('mat-paginatorがレンダリングされること');
  });

  function testTableContent(nrows: number, ncols: number, startRow: number = 1, hasCheckbox = false) {
    // ヘッダー部分の確認
    const headerRowList = fixture.debugElement.queryAll(By.css('cdk-header-row'));
    expect(headerRowList.length).toBe(1, 'cdk-header-rowが1個あること');
    const headerRow1 = headerRowList[0];
    const headerCellList = headerRow1.queryAll(By.css('cdk-header-cell'));
    if (hasCheckbox) {
      expect(headerCellList.length).toBe(ncols + 1, 'cdk-header-cellがカラム数 + 1個あること');
      headerCellList.forEach((headerCell, colNumber) => {
        if (colNumber === 0) {
          const checkbox = headerCell.query(By.css('mat-checkbox'));
          expect(checkbox).toBeTruthy('ヘッダー1列目にチェックボックスを含むこと');
        } else {
          const elm = headerCell.nativeElement as Element;
          const headerText = elm.textContent;
          expect(headerText).toBe(`d0${colNumber}`, 'ヘッダーのテキストが正しいこと');
        }
      });
    } else {
      expect(headerCellList.length).toBe(ncols, 'cdk-header-cellがカラム数分あること');
      headerCellList.forEach((headerCell, colNumber) => {
        const elm = headerCell.nativeElement as Element;
        const headerText = elm.textContent;
        expect(headerText).toBe(`d0${colNumber + 1}`, 'ヘッダーのテキストが正しいこと');
      });
    }

    // テーブル本体部分の確認
    const rowList = fixture.debugElement.queryAll(By.css('cdk-row'));
    expect(rowList.length).toBe(nrows, 'cdk-rowが行数分あること');
    rowList.forEach((row, rowNumber) => {
      const cellList = row.queryAll(By.css('cdk-cell'));
      if (hasCheckbox) {
        expect(cellList.length).toBe(ncols + 1, 'cdk-cellがカラム数 + 1個あること');
        cellList.forEach((cell, colNumber) => {
          if (colNumber === 0) {
            const checkbox = cell.query(By.css('mat-checkbox'));
            expect(checkbox).toBeTruthy('1列目にチェックボックスを含むこと');
          } else {
            const elm = cell.nativeElement as Element;
            const cellText = elm.textContent;
            const expected = `${pad(rowNumber + startRow)}-${pad(colNumber)}`;
            expect(cellText).toBe(expected, 'セルの内容が正しいこと');
          }
        });
      } else {
        expect(cellList.length).toBe(ncols, 'cdk-cellがカラム数分あること');
        cellList.forEach((cell, colNumber) => {
          const elm = cell.nativeElement as Element;
          const cellText = elm.textContent;
          const expected = `${pad(rowNumber + startRow)}-${pad(colNumber + 1)}`;
          expect(cellText).toBe(expected, 'セルの内容が正しいこと');
        });
      }
    });
  }

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

    testTableContent(20, 5);
  });

  it('ページング表示できること', () => {
    const dataProvider = new TestDataProvider(27, 5);
    component.dataProvider = dataProvider;
    component.length = 27;
    component.pageSize = 10;
    component.headers = dataProvider.headerDef;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
      'length': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    testTableContent(10, 5);

    // 2ページ目を表示する
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();

    testTableContent(10, 5, 11);

    // 3ページ目を表示する
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();

    testTableContent(7, 5, 21);
  });

  it('チェックボックスを表示できること', () => {
    const dataProvider = new TestDataProvider(20, 5);
    component.dataProvider = dataProvider;
    component.length = 20;
    component.headers = dataProvider.headerDef;
    component.selectable = true;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
      'length': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    testTableContent(20, 5, 1, true);
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
    const startRow = 1 + (pageIndex * pageSize);
    const endRow = Math.min(startRow + pageSize, this.nrows + 1);

    // 行データを作成
    for (let row = startRow; row < endRow; row++) {
      const data: { [key: string]: string } = {};
      for (let col = 1; col <= this.ncols; col++) {
        data[`c${pad(col)}`] = `${pad(row)}-${pad(col)}`;
      }
      records.push(data);
    }
    return new BehaviorSubject<{ [key: string]: string }[]>(records);
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
