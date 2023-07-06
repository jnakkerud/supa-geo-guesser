import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionListChange, PlaceSuggestionListComponent } from 'src/app/shared/place-suggestion/place-suggestion-list.component';
import { LOCALITY_SCORE, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';

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
    selector: 'theme-play',
    templateUrl: './theme-play.component.html',
    styleUrls: ['theme-play.component.scss'],
    providers: [ScoreService]
})
export class ThemePlayComponent implements OnInit {

    themeId!: number;
    images!: Image[];
    selectedImage!: Image;
    selectedImageIndex = 0;
    scoreCard!: ScoreCard; 
    
    showNextButtons!: boolean;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;
    @ViewChild(PlaceSuggestionListComponent) placeSuggestionList!: PlaceSuggestionListComponent;

    constructor(
        private route: ActivatedRoute, 
        private imageService: ImageService,
        private scoreService: ScoreService) { }

    ngOnInit() {
        // TODO init game: ScoreService rename to GameService
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
        const placeSuggestion: Partial<PlaceSuggestion> = event.placeSuggestion;
        const tryIndex = event.index;

        // add marker to map
        if (placeSuggestion.location) {
            this.imageMap.addMarker(placeSuggestion.location);
        }
        
        this.scoreService.score(this.scoreCard, tryIndex, placeSuggestion).then(s => {
            event.placeSuggestionComponent.displayScore(s); // TODO better way for component to react to score change? Signals?
            if (s.score >= LOCALITY_SCORE || tryIndex == (TRY_NUMBER-1)) {
                // TODO show summary: Score + ??

                // Show next | cancel buttons
                this.showNextButtons = true;
                // Disable current suggestions
                this.placeSuggestionList.setEnabled(false);
            } else if (this.selectedImageIndex == (this.images.length-1)) {
                // TODO game over, show results
            } else {
                // move to the next suggestion for the current image
                this.placeSuggestionList.nextSuggestion(tryIndex);
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
