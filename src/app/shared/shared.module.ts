import { NgModule } from '@angular/core';

import { PlaceSuggestionComponent } from './place-suggestion/place-suggestion.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { ImageMapComponent } from './image-map/image-map.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, MaterialModule, LeafletModule],
    exports: [PlaceSuggestionComponent, ImageMapComponent],
    declarations: [PlaceSuggestionComponent, ImageMapComponent],
    providers: [],
})
export class SharedModule { }
