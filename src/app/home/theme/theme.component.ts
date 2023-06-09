import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image.service';
import { PlaceSuggestion } from 'src/app/core/place-service/place.service';
import { GeoAddress, GeoService } from 'src/app/core/geo-service/geo.service';
import { PlaceSuggestionListChange } from 'src/app/shared/place-suggestion/place-suggestion-list.component';

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

    constructor(
        private route: ActivatedRoute, 
        private imageService: ImageService,
        private geoService: GeoService) { }

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
    }

    initImageAddress(): void {
        this.geoService.lookup(this.selectedImage.location).then(res => {
            console.log('Image Address', res);
            this.imageAddress = res;
        });
    }

    onPlaceSuggestionSelection(event: PlaceSuggestionListChange) {
        console.log(event);
    }

    score(selection: PlaceSuggestion) {
        // this.selected = selection;


        // TODO PlaceSelectionList: https://github.com/angular/components/blob/main/src/material/list/selection-list.ts

        // TODO calculate score, return score to control, lock control
    }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }
}
