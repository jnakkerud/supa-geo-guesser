import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreStoreService, PlayerScore } from 'src/app/core/score-store-service/score-store.service';

@Component({
    selector: 'theme-result',
    templateUrl: './theme-result.component.html',
    styleUrls: ['theme-result.component.scss'],
    standalone: false
})
export class ThemeResultComponent implements OnInit {

    playerScore!: PlayerScore;
    
    constructor(private route: ActivatedRoute, private resultsService: ScoreStoreService) { }

    ngOnInit() { 
        this.route.params.subscribe(p => {
            const resultId = Number(p['id']);
            // get results
            this.resultsService.get(resultId).then(r => {
                this.playerScore = r;
            });
        });
    }
}