import { NgModule } from '@angular/core';

import { PlaceSuggestionComponent } from './place-suggestion/place-suggestion.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { PlaceSuggestionListComponent } from './place-suggestion/place-suggestion-list.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, MaterialModule],
    exports: [PlaceSuggestionComponent, PlaceSuggestionListComponent],
    declarations: [PlaceSuggestionComponent, PlaceSuggestionListComponent],
    providers: [],
})
export class SharedModule { }
