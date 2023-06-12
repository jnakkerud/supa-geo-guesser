import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, filter, startWith, switchMap } from 'rxjs';
import { PlaceService, PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { PlaceSuggestionListComponent } from './place-suggestion-list.component';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

// Counter used to set a unique id and name for a selectable item 
let nextId = 0;
@Component({
    selector: 'place-suggestion',
    templateUrl: 'place-suggestion.component.html',
    styleUrls: ['place-suggestion.component.scss']
})
export class PlaceSuggestionComponent implements OnInit {

    placeControl = new FormControl('');
    suggestions!: Observable<PlaceSuggestion[]>;
    selected!: PlaceSuggestion;
    
    // An ID to identify this suggestion as unique
    id = `${nextId++}`;

    parent: PlaceSuggestionListComponent = inject(PlaceSuggestionListComponent);

    @Input()
    get activated(): boolean {
        return this._activated;
    }
    set activated(value: BooleanInput) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._activated) {
            this._activated = newValue;
            // Toggle disabled
            this._activated ? this.placeControl.enable() : this.placeControl.disable();
        }
    }
    private _activated = true;

    constructor(private placeService: PlaceService) { }

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
    
    // Called from AutoComplete
    onSelection(selection: PlaceSuggestion) {
        this.selected = selection;
        this.parent.onSelectionChange(this);
    }    
}