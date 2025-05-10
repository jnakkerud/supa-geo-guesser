import { Injectable, signal } from '@angular/core';
import { Image } from '../image-service/image.service';
import { GeoAddress, GeoService } from '../geo-service/geo.service';
import { PlaceSuggestion } from '../place-service/place.service';
import { calculateDistanceInKm } from '../utils';
import { PlayerScore, ScoreStoreService } from '../score-store-service/score-store.service';
import { Theme } from '../theme-service/theme.service';
import { Player, PlayerService } from '../player-service/player.service';

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

    // cards indexed by image id
    cards: Map<number, ScoreCard> = new Map<number, ScoreCard>();
    theme!: Theme;

    cardList!: ScoreCard[];
    totalScore = signal(0);

    constructor(private geoService: GeoService,
                private playerService: PlayerService,
                private resultService: ScoreStoreService) { }

    public initialize(theme: Theme, images: Image[]): void {
        this.theme = theme;
        images.forEach(i => {
            this.cards.set(i.id, new ScoreCard(i));
        });
        this.cardList = Array.from(this.cards.values());
    }

    public async getScoreCard(image: Image): Promise<ScoreCard> {
        const scoreCard = this.cards.get(image.id);
        if (scoreCard) { 
            scoreCard.imageAddress = await this.geoService.lookup(image.location);    
            return new Promise((resolve) => {resolve(scoreCard)});
        }
        return new Promise((resolve) => {resolve(new ScoreCard(image))});
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

            if (state && tempScore == COUNTRY_SCORE && state == geoAddressValue(guessGeo, 'state')) {
                tempScore = STATE_SCORE;          
            }

            if (locality && tempScore >= COUNTRY_SCORE && locality == geoAddressValue(guessGeo, 'locality')) {
                tempScore = LOCALITY_SCORE;           
            }

            score.score = tempScore;
        }

        this.updateTotal();

        return new Promise((resolve) => {resolve(score)});
    }

    public async getTotalResult(canPersist: boolean): Promise<PlayerScore> {
        let player = await this.playerService.getPlayer();
        let persistScore = canPersist;
        if (player && player.canScore === false) {
            // player is not allowed to score
            persistScore = false;
        }
        // save total and return the saved version
        const totalResult = await this.resultService.save({
            theme: this.theme,
            player: player,
            score: this.totalScore(),
            gameSummary: Array.from(this.cards.values())
        }, persistScore);

        return new Promise((resolve) => resolve(totalResult));
    }

    updateTotal() {
        let total = this.cardList.reduce((acc, curr) => acc + curr.score, 0);
        this.totalScore.set(total);
    }
}