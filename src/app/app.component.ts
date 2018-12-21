import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { Nav } from 'ionic-angular/components/nav/nav';
import { DatabaseProvider } from '../providers/database/database'


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
    public dbProvider: DatabaseProvider) {
    this.iniciarAplicativo();
  }

  iniciarAplicativo() {
    this.platform.ready().then(() => {
      this.rootPage = HomePage;

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      /*Inicialização do banco de dados no momento em que carrega o aplicativo. */
      this.dbProvider.createDatabase();
    });
  }
}

