import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionChange, PlaceSuggestionComponent, PlaceSuggestionOptions } from 'src/app/shared/place-suggestion/place-suggestion.component';
import { BONUS, COUNTRY_SCORE, LOCALITY_SCORE, STATE_SCORE, Score, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
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

function generateSuggestionOptions(score: Score): PlaceSuggestionOptions {
    let options: PlaceSuggestionOptions;
    switch (score.score) {
        case COUNTRY_SCORE:
            options = {
                icon: 'do_not_disturb_on',
                message: 'Location is in the correct country'
            };
            break;       
        case STATE_SCORE:
            options = {
                icon: 'do_not_disturb_on',
                message: 'Location is in the correct state/province'
            };
            break;            
        case LOCALITY_SCORE:
            options = {
                icon: 'check_circle',
                iconColor: 'accent',
                message: 'Location is correct!'
            };
            break;          
        case BONUS:
            options =  {
                icon: 'check_circle',
                iconColor: 'accent',
                message: 'Location is correct on the first try!'
            };
            break;        
        default:
            options = {
                icon: 'cancel',
                iconColor: 'warn',
                message: `Wrong guess, location is ${score.distance} KM away`
            };             
    }
    options.active = false;
    return options;
}

function tryMessage(tryIndex: number): string {
    return `You get ${TRY_NUMBER-tryIndex} tries to guess the place`;
}

export type PlayStatus = 'play_end' | 'next_image' | 'next_suggestion' | 'play_start'; // TODO rename play_start to play

@Component({
    selector: 'theme-play',
    templateUrl: './theme-play.component.html',
    styleUrls: ['theme-play.component.scss'],
    providers: [ScoreService]
})
export class ThemePlayComponent implements OnInit {

    themeId!: number; // TODO replace with theme
    images!: Image[];

    selectedImage!: Image;
    selectedImageIndex = 0;
    scoreCard!: ScoreCard; 
    score!: number; // TODO remove ?
    tryIndex = 0;

    playStatus: PlayStatus = 'play_start';
    totalResult!: TotalResult;

    placeSuggestionOptions!: PlaceSuggestionOptions;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;
    @ViewChild(PlaceSuggestionComponent) suggestionComponent!: PlaceSuggestionComponent;

    constructor(
        private route: ActivatedRoute,
        private imageService: ImageService,
        private scoreService: ScoreService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.themeId = Number(p['id']);

            // TODO get theme / async

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
        this.score, this.tryIndex = 0;
        this.placeSuggestionOptions = {
            message: tryMessage(this.tryIndex)
        };
        this.selectedImage = image;
        this.scoreCard = this.scoreService.getScoreCard(this.selectedImage);
    }

    /**
     * User has selected a place
     *  1) score
     *  2) Update the place suggestion with score
     *  3) Move to next: suggestion/image tally score for game 
     */
    onPlaceSelection(event: PlaceSuggestionChange) {
        const placeSuggestion: Partial<PlaceSuggestion> = event.placeSuggestion;

        // add marker to map
        if (placeSuggestion.location) {
            this.imageMap.addMarker(placeSuggestion.location);
        }
        
        // TODO performance slow
        this.scoreService.score(this.scoreCard, this.tryIndex++, placeSuggestion).then(s => {
            this.placeSuggestionOptions = generateSuggestionOptions(s);
            if (s.score >= LOCALITY_SCORE || this.tryIndex == (TRY_NUMBER-1)) {
                if (this.selectedImageIndex == (this.images.length-1)) {
                    this.scoreService.getTotalScore().then(ts => {
                        this.playStatus = 'play_end';
                        this.totalResult = ts;
                    });
                } else {
                    this.score = s.score;
                    this.playStatus = 'next_image';                    
                }
            } else {
                this.playStatus = 'next_suggestion';
            }
        });
    }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }

    nextImage(): void {
        this.resetMap();
        this.selectedImageIndex = (this.selectedImageIndex+1)%this.images.length;
        const nextImage = this.images[this.selectedImageIndex];
        this.setImage(nextImage);
    }

    nextSuggestion(): void {
        this.placeSuggestionOptions = {
            message:  tryMessage(this.tryIndex),
            active: true
        }
        this.playStatus = 'play_start';
    }

    private resetMap() {
        if (this.imageMap) {
            this.imageMap.resetMap();
        }
    }
}
