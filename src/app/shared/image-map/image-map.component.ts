import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { tileLayer, latLng, icon, marker, Map, Marker, LatLngTuple, point } from 'leaflet';
import { LatLon } from 'src/app/core/lat-lon';
import { Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { ScoreCard } from 'src/app/core/score-service/score.service';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';

const DEFAULT_HEIGHT = '100%';
const DEFAULT_WIDTH = '100%';
const DEFAULT_MIN_HEIGHT = '300px'

function getLatLngFromMarkers(markers: Marker[]): LatLngTuple[] {
    let markerBounds: LatLngTuple[] = [];
    markers.forEach(m => {
        let ll = m.getLatLng();
        markerBounds.push([ll.lat, ll.lng]);
    });
    return markerBounds;
}

function makeScorePopup(scoreCard: ScoreCard, imageUrl: string): string {
    return `` +
      `<div>Location: ${scoreCard.imageAddress.locality}</div>` +
      `<div>Country: ${scoreCard.imageAddress.countryCode}</div>` +
      `<div>Description: ${scoreCard.imageAddress.description}</div>` +
      `<div>Score: ${scoreCard.score}</div><br>` +
      `<img src=${imageUrl} width="112px" height="112px" alt="No Image"/>`
}

@Component({
    selector: 'image-map',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div id="map" [style.width]="width" [style.height]="height" [style.minHeight]="minHeight" leaflet [leafletOptions]="mapOptions" [leafletLayers]="markers" (leafletMapReady)="onMapReady($event)" (leafletClick)="mapClickedHandler($event)"></div>`,
    encapsulation: ViewEncapsulation.None,
})
export class ImageMapComponent implements AfterViewInit, OnDestroy {

    @Input() height: string | number | null = DEFAULT_HEIGHT;

    @Input() width: string | number | null = DEFAULT_WIDTH;

    @Input() minHeight: string | number | null = DEFAULT_MIN_HEIGHT;

    @Input() center: boolean = false;

    @Output() selectionChange: EventEmitter<Partial<PlaceSuggestion>> = new EventEmitter<Partial<PlaceSuggestion>>();

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

    @Input() get scoreCards(): ScoreCard[] {
        return this._scoreCards;
    }
    set scoreCards(value: ScoreCard[]) {
        if (this._scoreCards) {
            this.removeMarkers();
        }
        this._scoreCards = value;
        this.addScoreCardMarkers();
    }
    _scoreCards!: ScoreCard[];    

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

    resizeObserver!: ResizeObserver;

    constructor(private host: ElementRef, private imageProviderFactory: ImageProviderFactoryService) {}

    ngAfterViewInit(): void {
        this.resizeObserver = new ResizeObserver((entries) => { 
            this.map.invalidateSize(); 
        }); 
        this.resizeObserver.observe(this.host.nativeElement);        
    }

    ngOnDestroy() {
        this.resizeObserver.unobserve(this.host.nativeElement);
      }    

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
        const latLon: LatLon = {latitude: event.latlng.lat, longitude: event.latlng.lng};
        this.selectionChange.emit({
            location: latLon,
            description: `${latLon.latitude} , ${latLon.longitude}`
        });
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
    
    private addScoreCardMarkers(): void {
        this.scoreCards.forEach(s => {
            const newMarker = this.createStandardMarker(s.image.location);
            const imageProvider = this.imageProviderFactory.create(s.image.sourceType);
            let imageLocation = imageProvider.getImageUrl(s.image, ImageSize.SMALL);
            newMarker.bindPopup(makeScorePopup(s, imageLocation));
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
