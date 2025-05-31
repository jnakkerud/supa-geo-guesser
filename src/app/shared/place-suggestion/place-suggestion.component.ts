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

type MessageIcon = 'cancel' | 'check_circle' | 'do_not_disturb_on';

export interface PlaceSuggestionOptions {
    message?: string;
    active?: boolean;
    iconColor?: ThemePalette | '';
    icon?: MessageIcon;
}

export class PlaceSuggestionChange {
    constructor(
      public source: PlaceSuggestionComponent,
      public placeSuggestion: Partial<PlaceSuggestion>
    ) {}
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
            if (this._suggestionOptions?.active !== undefined) {
                const controlDisabled = this.placeControl.disabled;
                this._suggestionOptions.active ? this.placeControl.enable() : this.placeControl.disable();
                if (this._suggestionOptions.active && controlDisabled) {
                    this.placeControl.reset();
                } 
            }
            
            this.changeDetectorRef.markForCheck();
        }
    }

    get message(): string {
        return this.suggestionOptions?.message || '';
    }
}