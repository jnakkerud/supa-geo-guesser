import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionListChange } from 'src/app/shared/place-suggestion/place-suggestion-list.component';
import { Score, ScoreCard, ScoreService } from 'src/app/core/score-service/score.service';

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

}
