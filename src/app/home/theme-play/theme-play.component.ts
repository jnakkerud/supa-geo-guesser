import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionChange, PlaceSuggestionComponent, PlaceSuggestionOptions } from 'src/app/shared/place-suggestion/place-suggestion.component';
import { BONUS, COUNTRY_SCORE, LOCALITY_SCORE, STATE_SCORE, Score, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { TotalResult } from 'src/app/core/results-service/results.service';
import { Theme, ThemeService } from 'src/app/core/theme-service/theme.service';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { ImageProvider } from 'src/app/core/image-provider/image-provider';

const LARGE_IMAGE_SIZE = {
    width: 800,
    height: 600
}

const SMALL_IMAGE_SIZE = {
    width: 800,
    height: 350
}


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
                message: `Location is in the correct country. ${score.distance} KM away`
            };
            break;       
        case STATE_SCORE:
            options = {
                icon: 'do_not_disturb_on',
                message: `Location is in the correct state/province. ${score.distance} KM away`
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
    return `You get ${TRY_NUMBER-tryIndex} tries to guess the location`;
}

export type PlayStatus = 'play_end' | 'next_image' | 'next_suggestion' | 'play';

export class TryResult {
    options!: PlaceSuggestionOptions;
    constructor(public score: Score,
    public suggestion: Partial<PlaceSuggestion>) {}
    get suggestionOptions(): PlaceSuggestionOptions {
        if (!this.options) {
            this.options = generateSuggestionOptions(this.score);
        }
        return this.options;
    }
}

@Component({
    selector: 'theme-play',
    templateUrl: './theme-play.component.html',
    styleUrls: ['theme-play.component.scss'],
    providers: [ScoreService],
    standalone: false
})
export class ThemePlayComponent implements OnInit {

    theme!: Theme;
    images!: Image[];

    width = LARGE_IMAGE_SIZE.width;
    height = LARGE_IMAGE_SIZE.height;

    selectedImage!: Image;
    selectedImageIndex = 0;
    scoreCard!: ScoreCard; 
    tryIndex = 0;

    playStatus: PlayStatus = 'play';
    totalResult!: TotalResult;

    placeSuggestionOptions!: PlaceSuggestionOptions;
    countryCodes: string | undefined;

    tryResults: TryResult[] = []; 

    // Signal from the score service will have update total
    totalScore = this.scoreService.totalScore;

    imageProvider!: ImageProvider;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;
    @ViewChild(PlaceSuggestionComponent) suggestionComponent!: PlaceSuggestionComponent;

    constructor(
        private route: ActivatedRoute,
        private themeService: ThemeService,
        private imageProviderFactory: ImageProviderFactoryService,
        private scoreService: ScoreService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.initData(Number(p['id']));
        });
    }

    private async initData(themeId: number) {
        // get the theme
        this.theme = await this.themeService.getTheme(themeId);

        this.imageProvider = this.imageProviderFactory.create(this.theme.sourceType);

        this.imageProvider.images(this.theme).then(i => {
            this.images = shuffle(i);
            this.scoreService.initialize(this.theme, this.images);
            this.setImage(this.images[this.selectedImageIndex]);
        });
    }

    setImage(image: Image): void {
        this.playStatus = 'play';
        this.tryIndex = 0;
        this.placeSuggestionOptions = {
            message: tryMessage(this.tryIndex),
            active: true
        };
        this.selectedImage = image;
        this.scoreService.getScoreCard(this.selectedImage).then(sc => {
            this.scoreCard = sc;
            this.countryCodes = this.generateCountryCodes(this.scoreCard);
        });
        this.tryResults = [];
        
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
        
        const tryNumber = this.tryIndex++;
        // TODO performance can be slow
        this.scoreService.score(this.scoreCard, tryNumber, placeSuggestion).then(s => {
            this.placeSuggestionOptions = generateSuggestionOptions(s);
            if (s.score >= LOCALITY_SCORE || tryNumber == (TRY_NUMBER-1)) {
                if (this.selectedImageIndex == (this.images.length-1)) {
                    this.scoreService.getTotalResult().then(ts => {
                        this.playStatus = 'play_end';
                        this.totalResult = ts;
                    });
                } else {
                    this.playStatus = 'next_image';                    
                }
            } else {
                this.playStatus = 'next_suggestion';
            }
            this.tryResults.push(new TryResult(s, placeSuggestion));
        });
    }

    imgSource(image: Image): string {
        return this.imageProvider.getImageUrl(image, ImageSize.MEDIUM);
    }

    imageClick(): void {
        this.height = SMALL_IMAGE_SIZE.height;
        this.width = SMALL_IMAGE_SIZE.width;
        const url = this.imageProvider.getImageUrl(this.selectedImage, ImageSize.LARGE)
        window.open(url, "_blank");
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
        this.playStatus = 'play';
    }

    get score(): number {
        return this.scoreCard?.score || 0;
    }

    get playEnd(): boolean {
        return (this.playStatus == 'play_end' || this.playStatus == 'next_image');
    }

    private resetMap() {
        if (this.imageMap) {
            this.imageMap.resetMap();
        }
    }

    private generateCountryCodes(scoreCard: ScoreCard): string | undefined {
        let result;
        const countries = [];
        if (scoreCard.imageAddress.countryCode) {
            const cc = scoreCard.imageAddress.countryCode.toLowerCase()
            countries.push(cc);
            result = countries.join(',');
        }
        return result;
    }
}
