import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestionChange, PlaceSuggestionComponent, PlaceSuggestionOptions } from 'src/app/shared/place-suggestion/place-suggestion.component';
import { BONUS, COUNTRY_SCORE, LOCALITY_SCORE, STATE_SCORE, Score, ScoreCard, ScoreService, TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { PlayerScore } from 'src/app/core/score-store-service/score-store.service';
import { Theme, ThemeService } from 'src/app/core/theme-service/theme.service';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { ImageProvider } from 'src/app/core/image-provider/image-provider';
import { combineLatest, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SourceType } from 'src/app/core/utils';

const LARGE_IMAGE_SIZE = {
    width: 800,
    height: 600
}

const SMALL_IMAGE_SIZE = {
    width: 800,
    height: 350
}

function generateSuggestionOptions(score: Score, tryIndex = TRY_NUMBER): PlaceSuggestionOptions {
    let options: PlaceSuggestionOptions;
    switch (score.score) {
        case COUNTRY_SCORE:
            options = {
                icon: 'do_not_disturb_on',
                message: `Location is in the correct country. ${score.distance} KM away.`
            };
            break;       
        case STATE_SCORE:
            options = {
                icon: 'do_not_disturb_on',
                message: `Location is in the correct state/province. ${score.distance} KM away.`
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
                message: `Wrong guess, location is ${score.distance} KM away.`
            };             
    }
    options.tryIndex = tryIndex;
    return options;
}

export type PlayStatus = 'play_end' | 'next_image' | 'play';

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
export class ThemePlayComponent implements OnInit, OnDestroy {
    theme!: Theme;

    width = LARGE_IMAGE_SIZE.width;
    height = LARGE_IMAGE_SIZE.height;

    selectedImage!: Image;
    scoreCard!: ScoreCard; 
    tryIndex = 0;

    playStatus: PlayStatus = 'play';
    totalResult!: PlayerScore;
    persistScore = false;

    placeSuggestionOptions!: PlaceSuggestionOptions;
    countryCodes: string | undefined;

    tryResults: TryResult[] = []; 

    // Signal from the score service will have update total
    totalScore = this.scoreService.totalScore;

    imageProvider!: ImageProvider;

    private routeSubscription: Subscription | undefined;

    @ViewChild(ImageMapComponent) imageMap!: ImageMapComponent;
    @ViewChild(PlaceSuggestionComponent) suggestionComponent!: PlaceSuggestionComponent;

    constructor(
        private route: ActivatedRoute,
        private themeService: ThemeService,
        private imageProviderFactory: ImageProviderFactoryService,
        private scoreService: ScoreService) { }

    ngOnInit() {
        this.routeSubscription = combineLatest([
            this.route.params,
            this.route.queryParams,
        ])
        .pipe(
            switchMap(([params, queryParams]) => {
                return this.initData(Number(params['id']), queryParams);
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    private async initData(themeId: number, queryParams: Params) {
        // get the theme
        this.theme = await this.themeService.getTheme(themeId);
        this.persistScore = queryParams['score'] ?? this.theme.storeScore;

        this.imageProvider = this.imageProviderFactory.create(this.theme.sourceType);

        this.imageProvider.loadImages(this.theme, true).then(images => {
            this.scoreService.initialize(this.theme, images);
            this.setImage(this.imageProvider.currentImage());
        });
    }

    async setImage(image: Image) {
        this.playStatus = 'play';
        this.tryIndex = 0;
        this.placeSuggestionOptions = {};
        this.selectedImage = image;
        // a scorecard might not exist if playing a timed game
        let sc = await this.scoreService.getScoreCard(this.selectedImage);
        if (!sc) {
            sc = await this.scoreService.setScoreCard(this.selectedImage);
        }
        if (!sc) {
            console.error('score card not found for image', this.selectedImage);
            return;
        }
        this.scoreCard = sc;
        this.countryCodes = this.generateCountryCodes(this.scoreCard);
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

        this.scoreService.score(this.scoreCard, tryNumber, placeSuggestion).then(s => {
            this.placeSuggestionOptions = generateSuggestionOptions(s, this.tryIndex);
            if (s.score >= LOCALITY_SCORE || tryNumber == (TRY_NUMBER-1)) {
                if (this.imageProvider.hasMoreImages() == false) {
                    this.scoreService.getTotalResult(this.persistScore).then(ts => {
                        this.playStatus = 'play_end';
                        this.totalResult = ts;
                    });
                } else {
                    this.playStatus = 'next_image';                    
                }
            } 
            this.imageMap.zoomToLocation(placeSuggestion.location!, s.distance);
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
        const nextImage = this.imageProvider.nextImage();
        this.setImage(nextImage);
    }

    hasMoreImages(): boolean {
        return (this.theme.storeScore && this.theme.sourceType === SourceType.FLICKR_GROUP);
    }

    pageRefresh(): void {
        window.location.reload();
    }

    onCountDownEnd(): void {
        // for timed games, finalize score
        this.scoreService.getTotalResult(this.persistScore).then(ts => {
            this.playStatus = 'play_end';
            this.totalResult = ts;
        });
    }

    get score(): number {
        return this.scoreCard?.score || 0;
    }

    get playEnd(): boolean {
        return (this.playStatus == 'play_end' || this.playStatus == 'next_image');
    }

    imageLengthMessage(): string {
        if (this.theme.sourceType === SourceType.FLICKR_GROUP) {
            return '1 random image from the group';
        } else if (this.hasMoreImages()) {
            return 'random';
        }
        return this.imageProvider.images.length+'';
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
