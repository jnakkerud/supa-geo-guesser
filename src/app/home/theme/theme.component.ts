import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, filter, startWith, switchMap } from 'rxjs';
import { PlaceService, PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { GeoAddress, GeoService } from 'src/app/core/geo-service/geo.service';

function shuffle(array: Image[]): Image[] {
    // tslint:disable-next-line: one-variable-per-declaration
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

@Component({
    selector: 'theme',
    templateUrl: './theme.component.html',
    styleUrls: ['theme.component.scss']
})

export class ThemeComponent implements OnInit {

    themeId!: number;
    images!: Image[];
    selectedImage!: Image;
    selectedIndex = 0;

    imageAddress!: GeoAddress;

    // TODO make PlaceLookupComponent
    placeControl = new FormControl('');
    suggestions!: Observable<PlaceSuggestion[]>;
    selected!: PlaceSuggestion;

    constructor(private route: ActivatedRoute, private imageService: ImageService, private placeService: PlaceService, private geoService: GeoService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.themeId = Number(p['id']);
            // get images
            this.imageService.images(this.themeId).then(i => {
                this.images = shuffle(i);
                this.selectedImage = this.images[this.selectedIndex];
                this.initImageAddress();
            });
        });

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

    initImageAddress(): void {
        this.geoService.lookup(this.selectedImage.location).then(res => {
            console.log('Image Address', res);
            this.imageAddress = res;
        });
    }

    displayFn(suggestion: PlaceSuggestion): string {
        return suggestion && suggestion.description ? suggestion.description : '';
    }    

    onSelection(selection: PlaceSuggestion) {
        this.selected = selection;
        // TODO calculate score, lock the control
    }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }
}
