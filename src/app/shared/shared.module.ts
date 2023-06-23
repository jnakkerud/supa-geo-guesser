import { NgModule } from '@angular/core';

import { PlaceSuggestionComponent } from './place-suggestion/place-suggestion.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { PlaceSuggestionListComponent } from './place-suggestion/place-suggestion-list.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ImageMapComponent } from './image-map/image-map.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, MaterialModule, LeafletModule],
    exports: [PlaceSuggestionComponent, PlaceSuggestionListComponent, ImageMapComponent],
    declarations: [PlaceSuggestionComponent, PlaceSuggestionListComponent, ImageMapComponent],
    providers: [],
})
export class SharedModule { }
