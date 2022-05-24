import { FormModel } from './formdata';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as $ from "jquery";
import { ApiService } from './api.service';
import * as L from 'leaflet';
import 'leaflet-easybutton';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ApiService]
})

export class AppComponent implements OnInit {

  // FormControl attributes

  public searchTerm : FormControl = new FormControl();
  public searchMunicipalities : FormControl = new FormControl();
  public searchRegions : FormControl = new FormControl();
  public address : FormControl = new FormControl();
  public number : FormControl = new FormControl();
  public goodNaming : FormControl = new FormControl();
  public gooodId : FormControl = new FormControl();
  public idVir : FormControl = new FormControl();
  public ilatitude : FormControl = new FormControl();
  public ilongitude : FormControl = new FormControl();
  public formData = new FormModel();

  // provinces attribute for getting autcomplete search data

  public provinces = <any>[];
  
  // map attribute for leaflet map

  private map: any;

  // latitude and longitude attributes for map

  public latitude!: number;
  public longitude!: number;

  // Constructor 
  
  constructor(private apiService: ApiService) {}

  // OnInit method

  ngOnInit() {

    // Get autocomplete search data for regions

    this.searchRegions.valueChanges.subscribe(term => {
      if (term != '' && term.length > 0) this.apiService.searchRegions(term).subscribe((data: any[]) => { this.provinces = data as any[]; });
      else this.provinces = [];
    });

    // Get autocomplete search data for provinces

    this.searchTerm.valueChanges.subscribe(term => {
      this.provinces = [];
      if (term != '' && term.length > 0) this.apiService.searchProvinces(term).subscribe((data: any[]) => { this.provinces = data as any[]; });
      else this.provinces = [];
    });

    // Get autocomplete search data for municipalities

    this.searchMunicipalities.valueChanges.subscribe(term => {
      if (term != '' && term.length > 0) this.apiService.searchMunicipalities(term).subscribe((data: any[]) => { this.provinces = data as any[]; });
      else this.provinces = [];
    });

    // Default layer for map

    var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {noWrap: true, attribution: '<a target="_blank" href="https://about.google/brand-resource-center/products-and-services/geo-guidelines/#google-maps">Map data ©2022 Google</a>', maxZoom: 20.5, subdomains:['mt0','mt1','mt2','mt3'] });

    // Setting the map 

    this.map = L.map('map', {layers: [googleTerrain]}).setView([45.10944000210847, 8.338010648085561], 8);
    this.map.options.minZoom = 3;
    L.control.scale({imperial: false}).addTo(this.map);

    // Custom base layers for map

    var baseLayers = {
      Terrain: googleTerrain,
      Satellite: L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {maxZoom: 20.5, noWrap: true, subdomains:['mt0','mt1','mt2','mt3'], attribution: '<a target="_blank" href="https://about.google/brand-resource-center/products-and-services/geo-guidelines/#google-maps">Map data ©2022 Google</a>'}),
      OSM: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 20, noWrap: true, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
		};
    L.control.layers(baseLayers).addTo(this.map);

    // StreetView button control for map

    var streetViewIcon = L.icon({iconUrl: 'https://icon-library.com/images/street-view-icon/street-view-icon-5.jpg', iconSize: [30, 30]});
    var markerIcon = L.icon({iconUrl: 'https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color/254000/66-512.png', iconSize: [30, 30]});
		var marker: L.Marker<any>, flag = true, map = this.map,
		toggle = L.easyButton({
        id: 'toggle-streetview',
        states: [{
          stateName: 'add-markers',
          icon: 'fa-solid fa-street-view fa-xl',
          title: 'Turn on Street View Mode',
          onClick: function(control) {
              marker = L.marker(map.getCenter(), {icon: streetViewIcon}).addTo(map);
              map.on('move', function() { marker.setLatLng(map.getCenter()); });
              flag = false;
              control.state('remove-markers');
          }
        }, {
          icon: 'fa-solid fa-arrow-rotate-left fa-beat-fade fa-lg',
          title: 'Turn off Street View Mode',
          stateName: 'remove-markers',
          onClick: function(control) {
            map.removeLayer(marker);
            flag = true;
            control.state('add-markers');
          }
        }]
    });
    toggle.addTo(map);

    // StreetView control event

    const tmpl = 'https://www.google.com/maps?layer=c&cbll={lat},{lon}';
    map.on('moveend', function() { 
      if (!flag) window.open(tmpl.replace(/{lat}/g, map.getCenter().lat).replace(/{lon}/g, map.getCenter().lng), '"_self"'); 
    });

    // Double Click on map event

    map.on('dblclick', (e: { latlng: any; }) => {
      if(confirm('Are you sure you want to add these points ' + e.latlng + ' ?')) {
        L.marker([e.latlng.lat, e.latlng.lng], {icon: markerIcon}).addTo(map);
        this.latitude = e.latlng.lat;
        this.longitude = e.latlng.lng;
        $('#latitude').val(this.latitude);
        $('#longitude').val(this.longitude);
      }
    });
  }

  public saveData(event: any) {
    if(confirm('Are you sure you want to save data?')) {
      this.formData.region = this.searchRegions.value;
      this.formData.province = this.searchTerm.value;
      this.formData.municipality = this.searchMunicipalities.value;
      this.formData.address = this.address.value;

      this.formData.number = this.number.value;
      this.formData.goodNaming = this.goodNaming.value;
      this.formData.goodID = this.gooodId.value;
      this.formData.idVir = this.idVir.value;

      this.formData.latitude = this.latitude;
      this.formData.longitude = this.longitude;
      
      this.apiService.save(this.formData).subscribe((data: any) => { return data; });
    }
  }

  public focusOutFunction(event: any) {
    if(this.address.value != '') {
      $.get('https://nominatim.openstreetmap.org/search?format=json&q=' + this.address.value + ', ' + this.searchMunicipalities.value, (data) => {
        this.map.setView([data[0]['lat'], data[0]['lon']], 17, {"animate": true, "duration": 1});
      });
    }
  }
}