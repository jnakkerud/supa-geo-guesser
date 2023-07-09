import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionListChange, PlaceSuggestionListComponent } from 'src/app/shared/place-suggestion/place-suggestion-list.component';
import { LOCALITY_SCORE, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { TotalResult } from 'src/app/core/results-service/results.service';

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

export type PlayStatus = 'play_end' | 'next_image' | 'next_suggestion' | 'play_start';

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
    score!: number;

    playStatus: PlayStatus = 'play_start';
    totalResult!: TotalResult;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;
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
                this.scoreService.initialize(this.themeId, this.images);
                this.setImage(this.images[this.selectedImageIndex]);
            });
        });
    }

    setImage(image: Image): void {
        this.playStatus = 'play_start';
        this.score = 0;
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
            if (this.selectedImageIndex == (this.images.length-1)) {
                this.scoreService.getTotalScore().then(ts => {
                    this.playStatus = 'play_end';
                    this.totalResult = ts;
                });
            } else if (s.score >= LOCALITY_SCORE || tryIndex == (TRY_NUMBER-1)) {
                this.score = s.score;
                this.playStatus = 'next_image';
                // Disable current suggestions
                this.placeSuggestionList.setEnabled(false);
            } else {
                this.playStatus = 'next_suggestion';
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
        const nextImage = this.images[this.selectedImageIndex];
        this.setImage(nextImage);
    }
}
