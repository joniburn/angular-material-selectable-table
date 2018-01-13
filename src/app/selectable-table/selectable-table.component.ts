import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';

import { SelectableTableDataProvider } from './data-provider';
import { TableDataSource, TableRecord } from './data-source';

enum SelectionState {
  NONE,
  PARTIAL,
  ALL,
}

@Component({
  selector: 'mst-selectable-table',
  templateUrl: './selectable-table.component.html',
  styleUrls: ['./selectable-table.component.scss']
})
export class SelectableTableComponent implements OnChanges {

  /**
   * テーブルのデータを提供するオブジェクト。
   *
   * 本コンポーネントの使用側で具象クラスを定義する。
   */
  @Input()
  dataProvider: SelectableTableDataProvider;

  /**
   * trueを指定すると、行を選択するためのチェックボックスを表示する。
   */
  @Input()
  selectable = false;

  /**
   * データの総件数。
   */
  @Input()
  length = 0;

  /**
   * ヘッダーに表示するキー名と、その表示文字列のマッピング。
   *
   * キー名は、SelectableTableDataProvider#getRecords()から
   * 返却されるデータのキーとして用いる。
   */
  @Input()
  headers: { [key: string]: string };

  /**
   * 1ページ当たりの表示件数の初期値。
   */
  @Input()
  pageSize = 20;

  /**
   * ページ番号。0オリジン。
   */
  pageIndex = 0;

  dataSource: TableDataSource;
  headerKeys: string[];
  headerKeysAndCheckbox: string[];

  // チェックボックスの選択状況
  selection = new SelectionModel<TableRecord>(true);
  selectionState = SelectionState.NONE;

  constructor(
  ) {
    this.selection.onChange.subscribe(() => {
      this.updateSelectionState();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataProvider']) {
      this.dataSource = new TableDataSource(this.dataProvider);
      this.dataSource.setPage(this.pageIndex, this.pageSize);
    }
    if (changes['headers']) {
      this.headerKeys = Object.keys(this.headers);
      this.headerKeysAndCheckbox = Array.from(this.headerKeys);
      if (this.selectable) {
        this.headerKeysAndCheckbox.splice(0, 0, '_checkbox');
      }
    }
  }

  onPageEvent(pageEvent: PageEvent) {
    if (this.dataSource) {
      this.pageIndex = pageEvent.pageIndex;
      this.pageSize = pageEvent.pageSize;
      this.dataSource.setPage(this.pageIndex, this.pageSize);
    }
    this.selection.clear();
  }

  onClickHeaderCheckbox() {
    if (this.selectionState === SelectionState.ALL) {
      this.selection.clear();
    } else {
      // 全て選択
      this.dataSource.dataChange.value.forEach((record) => this.selection.select(record));
    }
  }

  onClickCheckbox(row: TableRecord) {
    this.selection.toggle(row);
  }

  private updateSelectionState() {
    if (this.selection.isEmpty()) {
      this.selectionState = SelectionState.NONE;
    } else if (this.selection.selected.length
                 === this.dataSource.dataChange.value.length) {
      this.selectionState = SelectionState.ALL;
    } else {
      this.selectionState = SelectionState.PARTIAL;
    }
  }

}
