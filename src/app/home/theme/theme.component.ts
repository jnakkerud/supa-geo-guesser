import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionListChange, PlaceSuggestionListComponent } from 'src/app/shared/place-suggestion/place-suggestion-list.component';
import { Score, ScoreCard, ScoreService } from 'src/app/core/score-service/score.service';
import { tileLayer, latLng, Layer, icon, marker } from 'leaflet';
import { LatLon } from 'src/app/core/lat-lon';

function shuffle(array: Image[]): Image[] {
    // tslint:disable-next-line: one-variable-per-declaration
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
@Component({
    selector: 'theme',
    templateUrl: './theme.component.html',
    styleUrls: ['theme.component.scss'],
    providers: [ScoreService]
})
export class ThemeComponent implements OnInit {

    themeId!: number;
    images!: Image[];
    selectedImage!: Image;
    selectedImageIndex = 0;

    scoreCard!: ScoreCard;    
    scores: Score[] = [];

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

    @ViewChild(PlaceSuggestionListComponent) placeSuggestionList!: PlaceSuggestionListComponent;

    constructor(
        private route: ActivatedRoute, 
        private imageService: ImageService,
        private scoreService: ScoreService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.themeId = Number(p['id']);
            // get images
            this.imageService.images(this.themeId).then(i => {
                this.images = shuffle(i);
                this.setImage(this.images[this.selectedImageIndex]);
            });
        });
    }

    setImage(image: Image): void {
        this.selectedImage = image;
        this.scoreCard = this.scoreService.createScoreCard(this.selectedImage);
        this.scores = this.scoreCard.scores;
    }

    /**
     * User has selected a place
     *  1) score
     *  2) Update the place suggestion with score
     *  3) Move to next: suggestion/image tally score for game 
     */
    onPlaceSuggestionSelection(event: PlaceSuggestionListChange) {
        this.scoreService.score(this.scores[event.index], event.placeSuggestion);
        // TODO if continue game, next image or game over
        event.source.nextSuggestion(event.index);
    }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }

    mapClicked(event: any) {
        const latLon: LatLon = {latitude: event.latlng.lat, longitude: event.latlng.lng}
        const active = this.placeSuggestionList.activePlaceSuggestionComponent();
        if (active) {
            active.setSuggestion(
                {
                    description: `${latLon.latitude} , ${latLon.longitude}`,
                    location: latLon
                }
            );
        }

        this.addMarker(latLon);
    }

    // TODO duplicate ... consider shared service
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
}
