import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, filter, startWith, switchMap } from 'rxjs';
import { PlaceService, PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { PlaceSuggestionListComponent } from './place-suggestion-list.component';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { BONUS, COUNTRY_SCORE, LOCALITY_SCORE, STATE_SCORE, Score } from 'src/app/core/score-service/score.service';
import { ThemePalette } from '@angular/material/core';

type MessageIcon = 'cancel' | 'check_circle' | 'do_not_disturb_on';

interface ScoreMessage {
    message: string;
    icon: MessageIcon;
    iconColor: ThemePalette | '';
}

// Counter used to set a unique id and name for a selectable item 
let nextId = 0;
@Component({
    selector: 'place-suggestion',
    templateUrl: 'place-suggestion.component.html',
    styleUrls: ['place-suggestion.component.scss']
})
export class PlaceSuggestionComponent implements OnInit {

    placeControl = new FormControl<any>('');
    suggestions!: Observable<PlaceSuggestion[]>;
    selected!: Partial<PlaceSuggestion>;
    
    // An ID to identify this suggestion as unique
    id = `${nextId++}`;

    parent: PlaceSuggestionListComponent = inject(PlaceSuggestionListComponent);

    // Score messaging
    scoreMessage!: ScoreMessage;

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
    onSelection(selection: Partial<PlaceSuggestion>) {
        this.selected = selection;
        this.parent.onSelectionChange(this);
    }

    setSuggestion(suggestion: Partial<PlaceSuggestion>) {
        this.placeControl.patchValue(suggestion);
        this.onSelection(suggestion);
    }

    displayScore(score: Score): void {
        switch (score.score) {
            case COUNTRY_SCORE:
                this.scoreMessage = {
                    icon: 'do_not_disturb_on',
                    iconColor: '',
                    message: 'Location is in the correct country'
                };             
                break;
            case STATE_SCORE:
                this.scoreMessage = {
                    icon: 'do_not_disturb_on',
                    iconColor: '',
                    message: 'Location is in the correct state/province'
                };             
                break;
            case LOCALITY_SCORE:
                this.scoreMessage = {
                    icon: 'check_circle',
                    iconColor: 'accent',
                    message: 'Location is correct!'
                };             
                break;
            case BONUS:
                this.scoreMessage = {
                    icon: 'check_circle',
                    iconColor: 'accent',
                    message: 'Location is correct on the first try!'
                };             
                break;
            default:
                this.scoreMessage = {
                    icon: 'cancel',
                    iconColor: 'warn',
                    message: `Wrong guess, location is ${score.distance} KM away`
                };             
        }

    }

    get message(): string {
        return this.scoreMessage?.message || '';
    }
}