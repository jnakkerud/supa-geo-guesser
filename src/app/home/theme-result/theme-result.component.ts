import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultsService, TotalResult } from 'src/app/core/results-service/results.service';
import { Image } from 'src/app/core/image-service/image.service';

@Component({
    selector: 'theme-result',
    templateUrl: './theme-result.component.html',
    styleUrls: ['theme-result.component.scss']
})
export class ThemeResultComponent implements OnInit {

    totalResult!: TotalResult;
    images!: Image[];
    
    constructor(private route: ActivatedRoute, private resultsService: ResultsService) { }

    ngOnInit() { 
        this.route.params.subscribe(p => {
            const resultId = Number(p['id']);
            // get results
            this.resultsService.get(resultId).then(r => {
                this.totalResult = r;
                if (r.scores) {
                    this.images = r.scores.map(sc => sc.image);
                }                
            });
        });
    }
}