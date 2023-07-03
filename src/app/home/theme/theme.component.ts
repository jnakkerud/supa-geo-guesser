import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionListChange } from 'src/app/shared/place-suggestion/place-suggestion-list.component';
import { LOCALITY_SCORE, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';

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
    
    showNextButtons!: boolean;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;

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
                this.scoreService.initialize(this.images);
                this.setImage(this.images[this.selectedImageIndex]);
            });
        });
    }

    setImage(image: Image): void {
        this.showNextButtons = false;
        // TODO reset the map
        this.selectedImage = image;
        this.scoreCard = this.scoreService.getScoreCard(this.selectedImage);
    }

    /**
     * User has selected a place
     *  1) score
     *  2) Update the place suggestion with score
     *  3) Move to next: suggestion/image tally score for game 
     */
    onPlaceSuggestionSelection(event: PlaceSuggestionListChange) {
        // add marker to map
        if (event.placeSuggestion.location) {
            this.imageMap.addMarker(event.placeSuggestion.location);
        }
        
        this.scoreService.score(this.scoreCard, event.index, event.placeSuggestion).then(s => {
            event.placeSuggestionComponent.displayScore(s);
            if (s.score >= LOCALITY_SCORE || event.index == (TRY_NUMBER-1)) {
                // Show next | cancel buttons
                this.showNextButtons = true;
                // Disable current suggestions
                event.source.setEnabled(false);

                // TODO show actual location on map?
            } else if (this.selectedImageIndex == (this.images.length-1)) {
                // TODO game over, show results
            } else {
                // move to the next suggestion for the current image
                event.source.nextSuggestion(event.index);
            }
        });
    }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }

    nextImage(): void {
        this.selectedImageIndex = (this.selectedImageIndex+1)%this.images.length;
        const next = this.images[this.selectedImageIndex];
        this.setImage(next);
    }
}
