import { GoogleMaps, GoogleMap, Environment, GoogleMapOptions, Marker, GoogleMapsEvent, HtmlInfoWindow } from '@ionic-native/google-maps';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Crop } from '@ionic-native/crop';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { DatabaseProvider } from '../../providers/database/database';

//API_KEY Google Maps: AIzaSyApLzTLSeiYNOACwNV1mAHtLIqrxFaWaGw

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  map: GoogleMap;
  currentCoords = { lat: 0, long: 0 };
  
  constructor(public crop: Crop,
    public dbProvider: DatabaseProvider,
    public navCtrl: NavController,
    private camera: Camera,
    private geolocation: Geolocation) {
  }

  /*Carregamento das posições de latitude e longitude somente quando o aplicativo 
  estiver carregado depois de receber as coordenadas, inicia o carregamento do mapa.*/
  ionViewDidLoad() {
    this.getCurrentPossition().then(() => this.loadMap())
  }

  /*Pega as coordenadas do usuário.*/
  async getCurrentPossition() {
    try {
      let resp = await this.geolocation.getCurrentPosition()
      this.currentCoords = { lat: resp.coords.latitude, long: resp.coords.longitude }
    } catch (error) {
      console.error("Encontrado um erro ao procurar sua localização: " + error);
    }
  }

  /*Carregamento do mapa, e mostrando com as coordenadas recebidas pelo disposiivo.*/
  loadMap() {
    // Treicho do codigo para rodar no Browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyApLzTLSeiYNOACwNV1mAHtLIqrxFaWaGw',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyApLzTLSeiYNOACwNV1mAHtLIqrxFaWaGw'
    });

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.currentCoords.lat,
          lng: this.currentCoords.long
        },
        zoom: 16,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map_canvas', mapOptions);
  }

  /*Inicia a camera pelo botão, depois insere a foto como um marker no mapa.*/
  getPicture() {
    const options: CameraOptions = {
      quality: 50,
      cameraDirection: 0,
      targetWidth: 55,
      targetHeight: 55,
      allowEdit: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((data) => {
      this.crop.crop(data, { quality: 75 })
        .then((newImage) => {
          this.insertMarker(newImage.split('?')[0]);
        }, (error) => console.error("Erro ao tentar cortar a imagem: ", error));
    }, (err) => {
      console.error("Erro ao tentar iniciar a camera: " + err);
    });
  }

  /*Inserindo o marcador no mapa como uma foto do usuário.
  inserir uma caixa de titulo com as informações do usuário de latitude, longitude e hora.
  Salva as informações no banco de dados, Coordenadas hora da foto e a foto.*/
  insertMarker(foto) {
    let htmlInfoWindow = new HtmlInfoWindow();
    var contentString = '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">Sua Localização</h1>' +
      '<div id="bodyContent">' +
      '<p><b>Coordenadas: Latitude :</b>' + this.currentCoords.lat + '<p>' +
      '<p><b>Longitude :</b>' + this.currentCoords.long + '<p>' +
      '<p><b>Hora :</b>' + new Date().toLocaleTimeString() + '<p>' +
      '</p>' +
      '</div>' +
      '</div>';

    /*Pega novamente a posição atual do dispositivo, caso a camera seja iniciada em um lugar e
    a foto seja tirada em outro, para guardar no bando de dados as coordenadas certas da foto.*/
    this.getCurrentPossition().then(() => {
      let marker: Marker = this.map.addMarkerSync({
        title: 'Sua Localização',
        icon: foto,
        animation: 'DROP',
        position: {
          lat: this.currentCoords.lat,
          lng: this.currentCoords.long
        }
      });

      htmlInfoWindow.setContent(contentString, {
        width: "260px",
        height: "150px"
      });

      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        htmlInfoWindow.open(marker);
      });
    })

    let parametros = {
      long: this.currentCoords.long,
      lat: this.currentCoords.lat,
      hora: new Date().toLocaleTimeString(),
      imagem: foto
    }
    this.saveInDB(parametros);
  }

  /*Salva no banco de dados as informações capturadas no momento em que tirou a foto.*/
  saveInDB(parametros) {
    this.dbProvider.insertDataBase(parametros);
  }
}