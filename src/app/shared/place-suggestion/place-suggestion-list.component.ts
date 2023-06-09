import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Output, QueryList, ViewEncapsulation } from '@angular/core';
import { PlaceSuggestionComponent } from './place-suggestion.component';

export class PlaceSuggestionListChange {
    constructor(
      //public source: MatSelectionList,
      public placeSuggestion: PlaceSuggestionComponent
    ) {}
}

@Component({
    selector: 'place-suggestion-list',
    template: `<div class="place-suggestion-list-container" role="presentation">
        <ng-content></ng-content>
    </div>`,
    styleUrls: ['place-suggestion-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceSuggestionListComponent implements AfterViewInit {
 
    @ContentChildren(PlaceSuggestionComponent, {descendants: true}) items!: QueryList<PlaceSuggestionComponent>;

    @Output() selectionChange: EventEmitter<PlaceSuggestionListChange> = new EventEmitter<PlaceSuggestionListChange>();    
    
    constructor() { }

    ngAfterViewInit() { 
        // bind parent
        this.items.forEach(item => {
            item.parent = this;
        });
    }

    makeSelectionFunc(): (value: PlaceSuggestionComponent) => void  {
        const change = this.selectionChange;
        return (value) => {
            console.log(change)
            change.emit(new PlaceSuggestionListChange(value));
        }
    }

    onSelectionChange(suggestionComponent: PlaceSuggestionComponent): void {
        // Find the index
        // Get the suggestion
        // Fire off the event
        this.selectionChange.emit(new PlaceSuggestionListChange(suggestionComponent));
    }
}