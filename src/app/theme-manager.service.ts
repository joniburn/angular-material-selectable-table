import { Injectable } from '@angular/core';

@Injectable()
export class ThemeManagerService {

  private _isDark: boolean;

  constructor() {
    this.isDark = false;
  }

  public set isDark(val: boolean) {
    this._isDark = val;

    const body = document.body;
    if (val) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme')
    } else {
      body.classList.remove('dark-theme')
      body.classList.add('light-theme');
    }
  }

  public get isDark() {
    return this._isDark;
  }

}
