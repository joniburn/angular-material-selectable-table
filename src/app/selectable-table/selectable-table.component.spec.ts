import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import 'rxjs/add/operator/delay';
import { SimpleChange, Component, ViewChild, DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CdkTableModule } from '@angular/cdk/table';
import {
  MatCheckboxModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatCheckbox,
} from '@angular/material';

import { SelectableTableComponent } from './selectable-table.component';
import { SelectableTableDataProvider } from './data-provider';

describe('SelectableTableComponent', () => {
  let testHostComponent: TestHostComponent;
  let component: SelectableTableComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        SelectableTableComponent,
      ],
      imports: [
        NoopAnimationsModule,
        CdkTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = testHostComponent.testTarget;
  });

  it('コンポーネントを初期化できること', () => {
    expect(component).toBeTruthy('コンポーネントを初期化できること');
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
    component.headers = dataProvider.headerDef;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    testTableContent(20, 5);
  });

  it('ページング表示できること', () => {
    const dataProvider = new TestDataProvider(27, 5);
    component.dataProvider = dataProvider;
    component.pageSize = 10;
    component.headers = dataProvider.headerDef;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
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

  it('各行をチェックボックスで選択できること', () => {
    const dataProvider = new TestDataProvider(22, 5);
    component.dataProvider = dataProvider;
    component.headers = dataProvider.headerDef;
    component.selectable = true;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    // チェックボックスを表示できること
    testTableContent(20, 5, 1, true);

    // ヘッダーのチェックボックス
    const headerCheckbox = fixture.debugElement.query(By.css('cdk-header-cell.mst-checkbox-cell > mat-checkbox'));
    const headerCheckboxComponent = headerCheckbox.componentInstance as MatCheckbox;
    const headerCheckboxOverlay = fixture.debugElement.query(By.css('cdk-header-cell.mst-checkbox-cell > .mst-checkbox-overlay'));
    const allCheckboxes = fixture.debugElement.queryAll(By.css('cdk-cell.mst-checkbox-cell > mat-checkbox'));
    allCheckboxes.forEach((checkbox) => {
      const checkboxComponent = checkbox.componentInstance as MatCheckbox;
      expect(headerCheckboxComponent.checked).toBe(false,
        '最初はヘッダーのチェックボックスがチェックされていないこと');
      expect(checkboxComponent.checked).toBe(false,
        '最初は各行のチェックボックスがチェックされていないこと');
    });
    headerCheckboxOverlay.triggerEventHandler('click', null);
    fixture.detectChanges();
    allCheckboxes.forEach((checkbox) => {
      const checkboxComponent = checkbox.componentInstance as MatCheckbox;
      expect(headerCheckboxComponent.checked).toBe(true,
        'ヘッダーのチェックボックスクリックでヘッダーのチェックボックスがチェックされること');
      expect(checkboxComponent.checked).toBe(true,
        'ヘッダーのチェックボックスクリックで各行のチェックボックスがチェックされること');
    });
    headerCheckboxOverlay.triggerEventHandler('click', null);
    fixture.detectChanges();
    allCheckboxes.forEach((checkbox) => {
      const checkboxComponent = checkbox.componentInstance as MatCheckbox;
      expect(headerCheckboxComponent.checked).toBe(false,
        'もう1回ヘッダーのチェックボックスクリックでヘッダーのチェックボックスがクリアされること');
      expect(checkboxComponent.checked).toBe(false,
        'もう1回ヘッダーのチェックボックスクリックで全てのチェックボックスがクリアされること');
    });

    // 各行のチェックボックス
    const rowCheckboxOverlays = fixture.debugElement.queryAll(By.css('cdk-cell.mst-checkbox-cell > .mst-checkbox-overlay'));
    expect(rowCheckboxOverlays.length).toBe(allCheckboxes.length, '各行のチェックボックスとそのオーバーレイの数が等しいこと');
    for (let i = 0; i < allCheckboxes.length; i++) {
      const overlay = rowCheckboxOverlays[i];
      const checkboxComponent = allCheckboxes[i].componentInstance as MatCheckbox;
      overlay.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(checkboxComponent.checked).toBe(true, '各行のチェックボックスクリックでチェックされること');
      if (i < allCheckboxes.length - 1) {
        expect(headerCheckboxComponent.indeterminate).toBe(true,
          '最後の1行をチェックするまでヘッダーのチェックボックスがindeterminate表示になること');
      } else {
        expect(headerCheckboxComponent.checked).toBe(true, '全行クリックでヘッダーのチェックボックスがオンになること');
      }
    }

    // 途中行のクリック
    const rowsToClick = [2, 10, 5];
    rowsToClick.forEach((row) => {
      const overlay = rowCheckboxOverlays[row];
      overlay.triggerEventHandler('click', null);
    });
    fixture.detectChanges();
    expect(headerCheckboxComponent.indeterminate).toBe(true,
      '何行かチェックを外すとヘッダーのチェックボックスがindeterminate表示になること');
    for (let i = 0; i < allCheckboxes.length; i++) {
      const checkboxComponent = allCheckboxes[i].componentInstance as MatCheckbox;
      const expectedCheck = rowsToClick.findIndex((item) => item === i) === -1;
      expect(checkboxComponent.checked).toBe(expectedCheck, `クリックした行のチェックが外されること (${i + 1}行目)`);
    }
    headerCheckboxOverlay.triggerEventHandler('click', null);
    fixture.detectChanges();
    allCheckboxes.forEach((checkbox) => {
      const checkboxComponent = checkbox.componentInstance as MatCheckbox;
      expect(headerCheckboxComponent.checked).toBe(true,
        '一部の行だけ選択された状態でヘッダーのチェックボックスをクリックするとヘッダーのチェックボックスがチェックされること');
      expect(checkboxComponent.checked).toBe(true,
        '一部の行だけ選択された状態でヘッダーのチェックボックスをクリックすると全行のチェックボックスがチェックされること');
    });

    // ページング
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    const nextPagesCheckboxes = fixture.debugElement.queryAll(By.css('cdk-cell.mst-checkbox-cell > mat-checkbox'));
    nextPagesCheckboxes.forEach((checkbox) => {
      const checkboxComponent = checkbox.componentInstance as MatCheckbox;
      expect(headerCheckboxComponent.checked).toBe(false,
        '次ページを表示するとヘッダーのチェックボックスがクリアされること');
      expect(checkboxComponent.checked).toBe(false,
        '次ページを表示すると各行のチェックボックスがクリアされること');
    });
  });

  it('チェック状態を通知できること', () => {
    const dataProvider = new TestDataProvider(30, 5);
    component.dataProvider = dataProvider;
    component.headers = dataProvider.headerDef;
    component.selectable = true;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    // 1行目のチェックボックスをクリックする
    const rowCheckboxOverlays = fixture.debugElement.queryAll(By.css('cdk-cell.mst-checkbox-cell > .mst-checkbox-overlay'));
    rowCheckboxOverlays[0].triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([0], '1行目をチェックすると通知されること');

    // もう何行かチェックする
    const rowsToClick = [1, 19, 7];
    rowsToClick.forEach((row) => {
      const overlay = rowCheckboxOverlays[row];
      overlay.triggerEventHandler('click', null);
    });
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([0, 1, 7, 19], '複数行のチェック状態が通知されること');

    // ヘッダー行のクリックで全行選択する
    const headerCheckboxOverlay = fixture.debugElement.query(By.css('cdk-header-cell.mst-checkbox-cell > .mst-checkbox-overlay'));
    headerCheckboxOverlay.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      12, 13, 14, 15, 16, 17, 18, 19], '全行をチェックした状態が通知されること');

    // ヘッダーのクリックで全行クリアする
    headerCheckboxOverlay.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([], '全行をクリアした状態が通知されること');

    // ページング; 何行かチェックした状態からページングする
    const rowsToClick2 = [0, 1, 10, 19];
    rowsToClick2.forEach((row) => {
      const overlay = rowCheckboxOverlays[row];
      overlay.triggerEventHandler('click', null);
    });
    fixture.detectChanges();
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([], 'ページングにより全行をクリアした状態が通知されること');

    // 2ページ目のチェック
    const rowsToClick3 = [1, 2, 3, 9];
    rowsToClick3.forEach((row) => {
      const overlay = rowCheckboxOverlays[row];
      overlay.triggerEventHandler('click', null);
    });
    fixture.detectChanges();
    expect(testHostComponent.selectedRows).toEqual([21, 22, 23, 29], '2ページ目は通算行番号で通知されること');
  });

  it('行のクリックができること', () => {
    const dataProvider = new TestDataProvider(30, 5);
    component.dataProvider = dataProvider;
    component.headers = dataProvider.headerDef;
    component.clickable = true;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    function cell(row: number, col: number): DebugElement {
      const rowList = fixture.debugElement.queryAll(By.css('cdk-row'));
      const cellList = rowList[row].queryAll(By.css('cdk-cell'));
      return cellList[col];
    }

    // 1ページ目をクリック
    for (let row = 0; row < 20; row++) {
      cell(row, row % 5).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(testHostComponent.clickedRow).toBe(row, '1ページ目のクリックした行が通知されること');
    }

    // 2ページ目をクリック
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    for (let row = 0; row < 10; row++) {
      cell(row, row % 5).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(testHostComponent.clickedRow).toBe(row + 20, '2ページ目のクリックした行が通知されること');
    }

    // チェックボックスありの場合: 準備
    component.selectable = true;
    component.ngOnChanges({
      'selectable': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();
    // 1ページ目に戻る
    const previousButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-previous'));
    previousButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    testTableContent(20, 5, 1, true);

    // 1ページ目をクリック
    for (let row = 0; row < 20; row++) {
      cell(row, (row % 5) + 1).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(testHostComponent.clickedRow).toBe(row, '1ページ目のクリックした行が通知されること(チェックボックスあり)');
    }

    // 2ページ目をクリック
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    for (let row = 0; row < 10; row++) {
      cell(row, (row % 5) + 1).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(testHostComponent.clickedRow).toBe(row + 20, '2ページ目のクリックした行が通知されること(チェックボックスあり)');
    }
  });

  it('読み込みアニメーションを表示できること', () => {
    const dataProvider = new TestDataProvider(21, 5, true);
    component.dataProvider = dataProvider;
    component.pageSize = 5;
    component.headers = dataProvider.headerDef;
    component.ngOnChanges({
      'dataProvider': new SimpleChange(null, null, true),
      'headers': new SimpleChange(null, null, true),
    });
    fixture.detectChanges();

    const spinner1 = fixture.debugElement.queryAll(By.css('mat-spinner'));
    expect(spinner1.length).toBe(1, '総件数取得までmat-spinnerが表示されること');
    const cdkTable1 = fixture.debugElement.queryAll(By.css('cdk-table'));
    expect(cdkTable1.length).toBe(0, '総件数取得までテーブルが表示されないこと');
    const paginator1 = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginator1.length).toBe(0, '総件数取得までmat-paginatorが表示されないこと');

    // 総件数取得後
    dataProvider.next();
    // 1ページ目を表示(読み込み中のまま)
    const spinner2 = fixture.debugElement.queryAll(By.css('mat-spinner'));
    expect(spinner2.length).toBe(1, '1ページ目の読み込みが完了するまでmat-spinnerが表示されること');
    const cdkTable2 = fixture.debugElement.queryAll(By.css('cdk-table'));
    expect(cdkTable2.length).toBe(0, '1ページ目の読み込みが完了するまでテーブルが表示されないこと');
    const paginator2 = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginator2.length).toBe(0, '1ページ目の読み込みが完了するまでmat-paginatorが表示されないこと');

    // 1ページの読み込み完了
    dataProvider.next();
    fixture.detectChanges();
    const spinner3 = fixture.debugElement.queryAll(By.css('mat-spinner'));
    expect(spinner3.length).toBe(0, '1ページ目の読み込み完了後にmat-spinnerが表示されないこと');
    testTableContent(5, 5);  // 1ページ目の読み込み完了後にテーブルが表示されること
    const paginator3 = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginator3.length).toBe(1, '1ページ目の読み込み完了後にmat-paginatorが表示されること');

    // 2ページ目を表示(読み込み中のまま)
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
    nextButton.triggerEventHandler('click', {button: 0});
    fixture.detectChanges();
    const spinner4 = fixture.debugElement.queryAll(By.css('mat-spinner'));
    expect(spinner4.length).toBe(1, '2ページ目の読み込み中にmat-spinnerが表示されること');
    testTableContent(5, 5);  // 2ページ目の読み込み中にテーブルが表示されたままになること
    const paginator4 = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginator4.length).toBe(1, 'ページ読み込み中にmat-paginatorが表示されたままになること');
    const paginatorDisabler = fixture.debugElement.queryAll(By.css('.mst-paginator-disabler'));
    expect(paginatorDisabler.length).toBe(1, 'ページ読み込み中にmat-paginatorが操作できないようになること');

    // 2ページ目の読み込み完了
    dataProvider.next();
    fixture.detectChanges();
    const spinner5 = fixture.debugElement.queryAll(By.css('mat-spinner'));
    expect(spinner5.length).toBe(0, '2ページ目の読み込み完了後にmat-spinnerが表示されないこと');
    testTableContent(5, 5, 6);  // 2ページ目の読み込み完了後にテーブルが表示されること
    const paginator5 = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginator5.length).toBe(1, '2ページ目の読み込み完了後にmat-paginatorが表示されること');
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

  private _next: Subject<void>;

  /*
   * delayにtrueを設定した場合、getRowCount()やgetRecords()が呼ばれても
   * next()を呼ぶまでデータが更新されない。
   */
  constructor(
    private nrows: number,
    private ncols: number,
    private delay = false,
  ) {
    // キー名と表示名のマッピングを作成
    this.headerDef = {};
    for (let i = 1; i <= this.ncols; i++) {
      this.headerDef[`c${pad(i)}`] = `d${pad(i)}`;
    }
  }

  getRowCount(): Observable<number> {
    if (this.delay) {
      const subject = new Subject<number>();
      this._next = new Subject<void>();
      this._next.subscribe(() => subject.next(this.nrows));
      return subject;
    } else {
      return new BehaviorSubject<number>(this.nrows);
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
    if (this.delay) {
      const subject = new Subject<{ [key: string]: string }[]>();
      this._next = new Subject<void>();
      this._next.subscribe(() => subject.next(records));
      return subject;
    } else {
      return new BehaviorSubject<{ [key: string]: string }[]>(records);
    }
  }

  next() {
    this._next.next();
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

@Component({
  template: `
    <mst-selectable-table
      [selectable]="selectable"
      [dataProvider]="dataProvider"
      [pageSize]="pageSize"
      [headers]="dataProvider?.headerDef"
      (selectionChange)="onSelectionChange($event)"
      (rowClicked)="onRowClicked($event)">
    </mst-selectable-table>`
})
class TestHostComponent {
  selectable = false;
  dataProvider: TestDataProvider;
  pageSize = 20;

  @ViewChild(SelectableTableComponent)
  testTarget: SelectableTableComponent;

  selectedRows: number[] = [];
  clickedRow = -1;

  onSelectionChange(selection: number[]) {
    this.selectedRows = selection;
  }

  onRowClicked(row: number) {
    this.clickedRow = row;
  }
}
