import { Injectable } from '@angular/core';
import { Image } from '../image-service/image.service';
import { GeoAddress, GeoService } from '../geo-service/geo.service';
import { PlaceSuggestion } from '../place-service/place.service';
import { calculateDistanceInKm } from '../utils';
import { from } from 'rxjs/internal/observable/from';
import { map } from 'rxjs/internal/operators/map';
import { reduce } from 'rxjs/internal/operators/reduce';
import { firstValueFrom } from 'rxjs';
import { ResultsService, TotalResult } from '../results-service/results.service';

export const TRY_NUMBER = 3;

// scores, See GeoAddress
export const COUNTRY_SCORE = 1;
export const STATE_SCORE = 2;
export const LOCALITY_SCORE = 3; // or within 5 KM
export const BONUS = 5; // first try is correct

function geoAddressValue(geoAddress: GeoAddress, property: keyof GeoAddress): any {
    return geoAddress[property];
} 

export interface Score {
    score: number;
    distance?: number; // in KM
}
export class ScoreCard {
    scores: Score[] = [
        {score: 0}, {score: 0}, {score: 0}
    ];
    imageAddress!: GeoAddress;

    constructor(public image: Image) { 
    }

    get score(): number {
        return Math.max(...this.scores.map(o => o.score));
    }
}
@Injectable()
export class ScoreService {

    cards: Map<number, ScoreCard> = new Map<number, ScoreCard>();
    themId!: number;

    constructor(private geoService: GeoService, private resultService: ResultsService) { }

    public initialize(themId: number, images: Image[]): void {
        this.themId = themId;
        images.forEach(i => {
            this.cards.set(i.id, new ScoreCard(i));
        });
    }

    public getScoreCard(image: Image): ScoreCard {
        const scoreCard = this.cards.get(image.id);
        if (scoreCard) {
            this.geoService.lookup(image.location).then(res => {
                scoreCard.imageAddress = res;
            });        
            return scoreCard;
        }
        return new ScoreCard(image);
    }

    public async score(scoreCard: ScoreCard, tryNumber: number, placeSuggestion: Partial<PlaceSuggestion>): Promise<Score> {
        const score = scoreCard.scores[tryNumber];

        const actualLocation = scoreCard.image.location;
        const guessLocation = placeSuggestion.location || {longitude: 0, latitude: 0};

        // find the distance        
        const distance = calculateDistanceInKm(actualLocation, guessLocation);
        score.distance = distance;

        if (score.distance <= 5.0) {
            score.score = tryNumber == 0 ? BONUS : LOCALITY_SCORE;
        } else {
            const guessGeo = await this.geoService.lookup(guessLocation);
            const {countryCode, state, locality} = scoreCard.imageAddress;
            let tempScore = 0;


            if (countryCode == geoAddressValue(guessGeo, 'countryCode')) {
                tempScore = COUNTRY_SCORE;
            }

            if (state == geoAddressValue(guessGeo, 'state')) {
                tempScore = STATE_SCORE;          
            }

            if (tempScore > 0 && locality == geoAddressValue(guessGeo, 'locality')) {
                tempScore = LOCALITY_SCORE;           
            }

            score.score = tempScore;

        }

        return new Promise((resolve) => {resolve(score)});
    }

    public async getTotalScore(): Promise<TotalResult> {

        // tally the total score
        const tScore = from(this.cards.values()).pipe(
            map(sc => sc.score),
            reduce((acc, val) => acc + val)
        ); 
        const total = await firstValueFrom(tScore);

        // save total and return the saved version
        const totalResult = await this.resultService.save({
            themeId: this.themId,
            score: total
        });

        return new Promise((resolve) => resolve(totalResult));
    }


}