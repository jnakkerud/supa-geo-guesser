import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Output, QueryList, ViewEncapsulation } from '@angular/core';
import { PlaceSuggestionComponent } from './place-suggestion.component';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';

export class PlaceSuggestionListChange {
    constructor(
      public source: PlaceSuggestionListComponent,
      public placeSuggestionComponent: PlaceSuggestionComponent,
      public index: number
    ) {}

    get placeSuggestion(): Partial<PlaceSuggestion> {
        return this.placeSuggestionComponent.selected;
    }
}

@Component({
    selector: 'place-suggestion-list',
    template: `<div class="place-suggestion-list-container" role="presentation">
        <ng-content></ng-content>
    </div>`,
    styleUrls: ['place-suggestion-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'placeSuggestionList'
})
export class PlaceSuggestionListComponent {
 
    @ContentChildren(PlaceSuggestionComponent, {descendants: true}) items!: QueryList<PlaceSuggestionComponent>;

    @Output() selectionChange: EventEmitter<PlaceSuggestionListChange> = new EventEmitter<PlaceSuggestionListChange>();    
    
    onSelectionChange(suggestionComponent: PlaceSuggestionComponent): void {
        // user has selected as place
        const index = this.findIndex(suggestionComponent);
        this.selectionChange.emit(new PlaceSuggestionListChange(this, suggestionComponent, index));
    }

    nextSuggestion(index: number): void {
        // toggle current suggestion as inactive
        const activeSuggestion = this.activePlaceSuggestionComponent();
        if (activeSuggestion) activeSuggestion.activated = false;

        // move to next suggestion an make active
        const nextSuggestion = this.items.toArray()[(index+1)%this.items.length];
        nextSuggestion.activated = true;
    }

    activePlaceSuggestionComponent(): PlaceSuggestionComponent | undefined {
        return this.items.find(item => item.activated);
    }

    private findIndex(suggestionComponent: PlaceSuggestionComponent): number {
        let result = -1;
        this.items.forEach((item, index) => {
            if (item.id === suggestionComponent.id) {
                result = index;
            }
        });
        return result;
    }

    setPlaceSuggestion(placeSuggestion: Partial<PlaceSuggestion>) {
        const activeComponent = this.activePlaceSuggestionComponent();
        if (activeComponent) {
            const location = placeSuggestion.location;
            placeSuggestion.description = placeSuggestion.description || `${location?.latitude} , ${location?.longitude}`
            activeComponent.setSuggestion(placeSuggestion);           
        }
    }
}