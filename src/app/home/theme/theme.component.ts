import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image, ImageSize } from '../../core/image-service/image-service';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

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

    geoControl = new FormControl('');
    options: string[] = ['One', 'Two', 'Three'];
    filteredOptions!: Observable<string[]>;
    

    // TODO Add Service, use as template: https://www.geoapify.com/location-autocomplete-with-angular

    constructor(private route: ActivatedRoute, private imageService: ImageService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.themeId = Number(p['id']);
            // get images
            this.imageService.images(this.themeId).then(i => {
                this.images = shuffle(i);
                this.selectedImage = this.images[this.selectedIndex];
            });
        });

        this.filteredOptions = this.geoControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
        );        
     }

    imgSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.MEDIUM);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }

}
