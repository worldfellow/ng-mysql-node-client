/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Title } from '@angular/platform-browser';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserStore } from '../../../@core/stores/user.store';
import { SettingsData } from '../../../@core/interfaces/common/settings';
import { User } from '../../../@core/interfaces/common/users';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: User;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  languages = [
    {
      value: 'en',
      name: 'English',
    },
    {
      value: 'hi',
      name: 'Hindi',
    },
    {
      value: 'mr',
      name: 'Marathi',
    },
    {
      value: 'gj',
      name: 'Gujrati',
    },
  ];

  currentTheme = 'default';
  currentLanguage = 'en';
  

  userMenu = this.getMenuItems();

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userStore: UserStore,
              private settingsService: SettingsData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService) {
  }

  getMenuItems() {
    const userLink = this.user ?  '/pages/users/current/' : '';
    return [
      { title: 'Profile', link: userLink, queryParams: { profile: true } },
      { title: 'Log out', link: '/auth/logout' },
    ];
  }

  ngOnInit() {
    console.log('Default test: ' + this.i18NextService.t('not_exists', 'default'));
    this.currentTheme = this.themeService.currentTheme;

    this.userStore.onUserStateChange()
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((user: User) => {
        this.user = user;
        this.userMenu = this.getMenuItems();
      });

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

      this.i18NextService.events.languageChanged.subscribe(lang => {
        //let root = this.router.routerState.root;
       // if (root != null && root.firstChild != null) {
       //   let data: any = root.firstChild.data;
//          this.updatePageTitle(data && data.value && data.value.title);
     //   }
     console.log("language => ",lang);
     
      });
  }
  // updatePageTitle(title: string): void {
  //   let newTitle = title || 'application_title';
  //   console.log('Setting page title:', newTitle);
  //   this.title.setTitle(newTitle);
  //   console.log('Setting page title end:', newTitle);
  // }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.userStore.setSetting(themeName);
    this.settingsService.updateCurrent(this.userStore.getUser().settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.themeService.changeTheme(themeName);
  }
  changeLanguage(languageName: string) {
    // this.userStore.setSetting(themeName);
    // this.settingsService.updateCurrent(this.userStore.getUser().settings)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe();
    console.log("language should be set to ",languageName);
    if (languageName !== this.i18NextService.language) {
      this.i18NextService.changeLanguage(languageName).then(x => {
       // this.updateState(lang);
        document.location.reload();
      });
    // this.themeService.changeTheme(themeName);
  }
}

  //  updateState(lang: string) {
  //   this.language = lang;
  // }
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
