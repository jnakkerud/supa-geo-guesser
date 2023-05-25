import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Image, ImageService, SourceType } from '../../core/image-service/image-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FlickrImageSource } from 'src/app/core/flickr-service/flickr.service';

export function convertSource(sourceType: SourceType, source: string): any {
    switch (sourceType) {
        case SourceType.FLICKR:
            return {
                id: source
            } as FlickrImageSource
        default:
            break;
    }
}

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html',
    styleUrls: ['edit-image.component.scss'],
})
export class EditImageComponent implements OnInit {

    themeId!: number;
    images!: Promise<Image[]>;

    // TODO add longitude/latitude
    editImage: FormGroup = new FormGroup({
        source: new FormControl<string>('', [Validators.required]),
        longitude: new FormControl<number>(0, [Validators.required]),
        latitude: new FormControl<number>(0, [Validators.required]),
        description: new FormControl<string>('')
    });

    constructor(private route: ActivatedRoute, private imageService: ImageService) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                of(params.get('id'))
            )
        ).subscribe((id) => {
            this.themeId = Number(id);
            this.images = this.imageService.images(this.themeId);
        });
    }

    onSubmit() {
        const sourceType = SourceType.FLICKR;
        const image:  Partial<Image> = {
            sourceType: sourceType,
            themeId: this.themeId,
            location: {
                longitude: this.editImage.value.longitude,
                latitude: this.editImage.value.latitude
            },
            source: convertSource(sourceType, this.editImage.value.source)
        }

        if (!!this.editImage.value.description) {
            image.description = this.editImage.value.description;
        }        
        this.imageService.insert([image]).then(i => console.log('Images saved', i));
    }

}