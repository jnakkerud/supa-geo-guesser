import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { tileLayer, latLng, Layer, icon, marker } from 'leaflet';
import { LatLon } from 'src/app/core/lat-lon';
import { PlaceSuggestionListComponent } from '../place-suggestion/place-suggestion-list.component';
import { Image } from '../../core/image-service/image.service';

const DEFAULT_HEIGHT = '300px';
const DEFAULT_WIDTH = '100%';

@Component({
    selector: 'image-map',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div [style.width]="width" [style.height]="height" leaflet [leafletOptions]="mapOptions" [leafletLayers]="markers" (leafletClick)="mapClickedHandler($event)"></div>`,
    encapsulation: ViewEncapsulation.None,
})
export class ImageMapComponent {

    @Input() height: string | number | null = DEFAULT_HEIGHT;

    @Input() width: string | number | null = DEFAULT_WIDTH;

    @Input() placeSuggestionList!: PlaceSuggestionListComponent;

    @Input() get images(): Image[] {
        return this._images;
    }
    set images(value: Image[]) {
        if (this._images) {
            this.removeImageMarkers();
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
    markers: Layer[] = [];
 
    addImages(images: Image[]) {
        images.forEach(i => {
            this.addMarker(i.location);
        });        
    }

    addMarker(location: LatLon): void {
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

		this.markers.push(newMarker);
	} 

    mapClickedHandler(event: any) {
        if (this.placeSuggestionList) {
            const latLon: LatLon = {latitude: event.latlng.lat, longitude: event.latlng.lng};
            this.placeSuggestionList.setPlaceSuggestion(
                {
                    location: latLon
                }
            );
            this.addMarker(latLon);
        }
    }
    
    private removeImageMarkers(): void {
        if (this.markers) {
            this.markers.forEach(m => {
                m.remove();
            });
        }
    }

    private addImageMarkers(): void {
        this.addImages(this.images);
    }
    
}