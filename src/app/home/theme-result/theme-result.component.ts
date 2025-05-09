import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreStoreService, TotalResult } from 'src/app/core/score-store-service/score-store.service';
import { Image } from 'src/app/core/image-service/image.service';

@Component({
    selector: 'theme-result',
    templateUrl: './theme-result.component.html',
    styleUrls: ['theme-result.component.scss'],
    standalone: false
})
export class ThemeResultComponent implements OnInit {

    totalResult!: TotalResult;
    
    constructor(private route: ActivatedRoute, private resultsService: ScoreStoreService) { }

    ngOnInit() { 
        this.route.params.subscribe(p => {
            const resultId = Number(p['id']);
            // get results
            this.resultsService.get(resultId).then(r => {
                this.totalResult = r;
            });
        });
    }
}