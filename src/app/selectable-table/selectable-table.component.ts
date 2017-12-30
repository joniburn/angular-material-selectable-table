import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { SelectableTableDataProvider } from './data-provider';
import { TableDataSource } from './data-source';

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

  pageSize = 20;
  pageIndex = 0;

  dataSource: TableDataSource;
  headerKeys: string[];

  constructor(
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataProvider']) {
      this.dataSource = new TableDataSource(this.dataProvider);
      this.dataSource.setPage(this.pageIndex, this.pageSize);
    }
    if (changes['headers']) {
      this.headerKeys = Object.keys(this.headers);
    }
  }

  onPageEvent(pageEvent: PageEvent) {
    if (this.dataSource) {
      this.pageIndex = pageEvent.pageIndex;
      this.pageSize = pageEvent.pageSize;
      this.dataSource.setPage(this.pageIndex, this.pageSize);
    }
  }

}
