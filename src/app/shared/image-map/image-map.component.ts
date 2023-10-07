import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { tileLayer, latLng, icon, marker, Map, Marker, LatLngTuple, point } from 'leaflet';
import { LatLon } from 'src/app/core/lat-lon';
import { PlaceSuggestionListComponent } from '../place-suggestion/place-suggestion-list.component';
import { Image } from '../../core/image-service/image.service';

const DEFAULT_HEIGHT = '300px';
const DEFAULT_WIDTH = '100%';

function getLatLngFromMarkers(markers: Marker[]): LatLngTuple[] {
    let markerBounds: LatLngTuple[] = [];
    markers.forEach(m => {
        let ll = m.getLatLng();
        markerBounds.push([ll.lat, ll.lng]);
    });
    return markerBounds;
}

@Component({
    selector: 'image-map',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div id="map" [style.width]="width" [style.height]="height" leaflet [leafletOptions]="mapOptions" [leafletLayers]="markers" (leafletMapReady)="onMapReady($event)" (leafletClick)="mapClickedHandler($event)"></div>`,
    encapsulation: ViewEncapsulation.None,
})
export class ImageMapComponent {

    @Input() height: string | number | null = DEFAULT_HEIGHT;

    @Input() width: string | number | null = DEFAULT_WIDTH;

    @Input() center: boolean = false;

    @Input() placeSuggestionList!: PlaceSuggestionListComponent;

    @Input() get images(): Image[] {
        return this._images;
    }
    set images(value: Image[]) {
        if (this._images) {
            this.removeMarkers();
        }
        this._images = value;
        this.addImageMarkers();
    }
    _images!: Image[];

    mapOptions = {
        layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            opacity: 0.7,
            maxZoom: 19,
            detectRetina: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })],
          zoom:2,
          center:latLng(0,0)
    }; 
    markers: Marker[] = [];

    map!: Map;

    onMapReady(map: Map) {
        this.map = map;
        if (this.center) {
            this.centerMap();
        } 
    }

    // Add markers from other components
    addMarker(location: LatLon): void {
        const newMarker = this.createStandardMarker(location);
        newMarker.addTo(this.map);
        this.markers.push(newMarker);
        if (this.center) {            
            this.centerMap();
        }
	} 

    mapClickedHandler(event: any) {
        if (this.placeSuggestionList) {
            const latLon: LatLon = {latitude: event.latlng.lat, longitude: event.latlng.lng};
            this.placeSuggestionList.setPlaceSuggestion(
                {
                    location: latLon
                }
            );
        }
    }
    
    centerMap() {
        if (this.markers?.length > 0) {
            this.map.fitBounds(getLatLngFromMarkers(this.markers), {
                padding: point(24, 24),
                maxZoom: 3,
                animate: true
            });            
        }
    }

    resetMap() {
        // clear markers 
        this.removeMarkers();
        // center map
        this.map.setView([0, 0], 2);
    }

    private removeMarkers(): void {
        if (this.markers?.length > 0) {
            this.markers.forEach(m => {
                m.options
                m.remove();
            });
            this.markers = [];
        }
    }

    private addImageMarkers(): void {
        this.images.forEach(i => {
            const newMarker = this.createStandardMarker(i.location);
            this.markers.push(newMarker);
        });
    }
    
    private createStandardMarker(location: LatLon): Marker<any> {
		const newMarker = marker(
			[ location.latitude, location.longitude ],
			{
				icon: icon({
					iconSize: [ 25, 41 ],
					iconAnchor: [ 13, 41 ],
					iconUrl: 'assets/leaflet/marker-icon.png',
					iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
					shadowUrl: 'assets/leaflet/marker-shadow.png'
				})
			}
		);
        return newMarker;
    }
}