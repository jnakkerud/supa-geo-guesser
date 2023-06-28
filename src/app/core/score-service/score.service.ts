import { Injectable } from '@angular/core';
import { Image } from '../image-service/image.service';
import { GeoAddress, GeoService } from '../geo-service/geo.service';
import { PlaceSuggestion } from '../place-service/place.service';
import { calculateDistanceInKm } from '../utils';

const TRY_NUMBER = 3;

export interface Score {
    score: number;
    distance: number; // in meters
}

export class ScoreCard {

    scores: Score[] = new Array(TRY_NUMBER);
    imageAddress!: GeoAddress;

    constructor(public image: Image) { 
    }
}

@Injectable()
export class ScoreService {

    cards: Map<number, ScoreCard> = new Map<number, ScoreCard>();

    constructor(private geoService: GeoService) { }

    initialize(images: Image[]): void {
        images.forEach(i => {
            this.cards.set(i.id, new ScoreCard(i));
        });
    }

    getScoreCard(image: Image): ScoreCard {
        const scoreCard = this.cards.get(image.id);
        if (scoreCard) {
            this.geoService.lookup(image.location).then(res => {
                scoreCard.imageAddress = res;
            });        
            return scoreCard;
        }
        return new ScoreCard(image);
    }

    score(scoreCard: ScoreCard, tryNumber: number, placeSuggestion: Partial<PlaceSuggestion>): Score {
        const score = scoreCard.scores[tryNumber];

        const actualLocation = scoreCard.image.location;
        const guessLocation = placeSuggestion.location || {longitude: 0, latitude: 0};

        // find the distance        
        const distance = calculateDistanceInKm(actualLocation, guessLocation);
        score.distance = distance;
        return score;
    }

}