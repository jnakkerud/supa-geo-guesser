import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Image, ImageService, ImageSize, SourceType } from '../../core/image-service/image-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FlickrPhotoInfo } from 'src/app/core/flickr-service/flickr.service';

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html',
    styleUrls: ['edit-image.component.scss'],
})
export class EditImageComponent implements OnInit {

    themeId!: number;
    images!: Promise<Image[]>;

    editImage: FormGroup = new FormGroup({
        source: new FormControl<string>('', [Validators.required]),
        convertedSource: new FormControl<any>({}),
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
            source: this.editImage.value.convertedSource
        }

        if (!!this.editImage.value.description) {
            image.description = this.editImage.value.description;
        }        
        this.imageService.insert([image]).then(i => {
            console.log('Images saved', i)
            // clear form
            this.editImage.reset();
            // refetch images
            this.images = this.imageService.images(this.themeId);
        });
    }

    imageInfo(): void {
        this.imageService.getImageInfo(SourceType.FLICKR, this.editImage.value.source).then(r =>  {
            const flickrResult: FlickrPhotoInfo = r as FlickrPhotoInfo;
            let { longitude, latitude, ...imageSource } = r;
            this.editImage.patchValue(
                {
                    longitude: longitude,
                    latitude: latitude,
                    convertedSource:  imageSource
                }
            )
        });
    }

    imgSmallSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.SMALL);
    }
}