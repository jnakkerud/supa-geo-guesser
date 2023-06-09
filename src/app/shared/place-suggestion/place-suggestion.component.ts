import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, filter, startWith, switchMap } from 'rxjs';
import { PlaceService, PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { PlaceSuggestionListComponent } from './place-suggestion-list.component';

@Component({
    selector: 'place-suggestion',
    templateUrl: 'place-suggestion.component.html',
    styleUrls: ['place-suggestion.component.scss']
})
export class PlaceSuggestionComponent implements OnInit {

    placeControl = new FormControl('');
    suggestions!: Observable<PlaceSuggestion[]>;
    selected!: PlaceSuggestion;
    
    parent!: PlaceSuggestionListComponent;

    constructor(private placeService: PlaceService,) { }

    ngOnInit() { 
        this.suggestions = this.placeControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            filter(value => typeof value === 'string'),
            switchMap(value => {
                // When text field length is 2 char or less,
                // return empty array to hide the drop down.                
                if (value?.length! <= 2) return [];
                return this.placeService.search(value || '');
            }),
        );         
    }

    displayFn(suggestion: PlaceSuggestion): string {
        return suggestion?.description || '';
    }
    
    onSelection(selection: PlaceSuggestion) {
        this.selected = selection;
        this.parent.onSelectionChange(this);
    }    
}