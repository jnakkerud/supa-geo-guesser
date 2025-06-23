import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { PlaceService, PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { MatOption, ThemePalette } from '@angular/material/core';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { GeoService, simpleGeoAddressFormat } from 'src/app/core/geo-service/geo.service';
import { TRY_NUMBER } from 'src/app/core/score-service/score.service';
import { PlayStatus } from 'src/app/home/theme-play/theme-play.component';

type MessageIcon = 'cancel' | 'check_circle' | 'do_not_disturb_on';

export interface PlaceSuggestionOptions {
    message?: string;
    iconColor?: ThemePalette | '';
    icon?: MessageIcon;
    tryIndex?: number;
}

export class PlaceSuggestionChange {
    constructor(
      public source: PlaceSuggestionComponent,
      public placeSuggestion: Partial<PlaceSuggestion>
    ) {}
}

function toPlural(count: number, single: string, plural?: string): string {
    if (count !== 1 && plural) {
        return plural;
    }
    return `${single}${count === 1 ? "" : "s"}`;
}

@Component({
    selector: 'place-suggestion',
    templateUrl: 'place-suggestion.component.html',
    styleUrls: ['place-suggestion.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatIcon,
        MatOption,
        MatAutocompleteModule,
        MatHint,
        AsyncPipe
    ]
})
export class PlaceSuggestionComponent implements OnInit {

    placeControl = new FormControl<any>('');
    suggestions!: Observable<PlaceSuggestion[]>;
    
    @Output() selectionChange: EventEmitter<PlaceSuggestionChange> = new EventEmitter<PlaceSuggestionChange>();   

    @Input() countryCodeFilter: string | undefined;

    @Input() playStatus: PlayStatus = 'play';

    @Input()
    get suggestionOptions(): PlaceSuggestionOptions {
        return this._suggestionOptions;
    }
    set suggestionOptions(value: PlaceSuggestionOptions) {
        this._suggestionOptions = value;
        this.updateSuggestionOptions();
    }
    private _suggestionOptions!: PlaceSuggestionOptions;

    constructor(private placeService: PlaceService, private geoService: GeoService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() { 
        this.suggestions = this.placeControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            filter(value => typeof value === 'string'),
            distinctUntilChanged(),
            switchMap(value => {
                // When text field length is 2 char or less,
                // return empty array to hide the drop down.                
                if (value?.length! <= 2) return [];
                return this.placeService.search(value || '', this.countryCodeFilter);
            }),
        );         
    }

    displayFn(suggestion: PlaceSuggestion): string {
        return suggestion?.description || '';
    }
    
    // Called from AutoComplete
    onSelection(selection: Partial<PlaceSuggestion>) {
        this.selectionChange.emit(new PlaceSuggestionChange(this, selection));
    }

    // Called from user selection on map
    async setSuggestion(suggestion: Partial<PlaceSuggestion>) {
        // resolve lat lon to actual place name
        if (suggestion.location) {
            const geoAddress = await this.geoService.lookup(suggestion.location);
            // Get a formatted description
            suggestion.description = simpleGeoAddressFormat(geoAddress) || suggestion.description;            
        }
        
        this.placeControl.patchValue(suggestion);
        this.onSelection(suggestion);
    }

    updateSuggestionOptions() {
        if (this._suggestionOptions) {
            const tryIndex = this.suggestionOptions?.tryIndex ?? 0;
            const triesLeft = TRY_NUMBER - tryIndex;
            if (!this.suggestionOptions?.message) {
                this.suggestionOptions.message = `You have ${triesLeft} tries to guess the location`;
            } else {
                this.suggestionOptions.message = (this.suggestionOptions?.message || '') + ` ${triesLeft} ${toPlural(triesLeft, 'try', 'tries')} left`;
            }
            this.changeDetectorRef.markForCheck();
        }
    }

    onFocus() {
        if (this.placeControl.value) {
            this.placeControl.reset();
        }
    }

    get message(): string {
        return this.suggestionOptions?.message || '';
    }
 
}