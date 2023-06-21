import { Injectable } from '@angular/core';
import { Image } from '../image-service/image.service';
import { GeoAddress, GeoService } from '../geo-service/geo.service';
import { PlaceSuggestion } from '../place-service/place.service';

const TRY_NUMBER = 3;

export interface Score {
    score: number;
}

export class ScoreCard {

    scores: Score[] = new Array(TRY_NUMBER);
    imageAddress!: GeoAddress;

    constructor(public image: Image) { 
    }
}

@Injectable()
export class ScoreService {

    constructor(private geoService: GeoService) { }

    // TODO create a Game, initialize scorecard based on images
    // Map<Image.ID, ScoreCard)

    // TODO getScoreCard(imageId)
    createScoreCard(image: Image): ScoreCard {
        const scoreCard = new ScoreCard(image);
        this.geoService.lookup(image.location).then(res => {
            scoreCard.imageAddress = res;
        });        
        return scoreCard;
    }

    score(score: Score, placeSuggestion: Partial<PlaceSuggestion>): Score {
        // TODO 
        return score;
    }

}