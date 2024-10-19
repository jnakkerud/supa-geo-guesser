import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Image, ImageService, ImageSize } from '../../core/image-service/image.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { ImageProvider } from 'src/app/core/image-provider/image-provider';
import { Theme, ThemeService } from 'src/app/core/theme-service/theme.service';

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html',
    styleUrls: ['edit-image.component.scss'],
})
export class EditImageComponent implements OnInit {

    theme!: Theme;
    images!: Image[];
    imageProvider!: ImageProvider;

    editImage: FormGroup = new FormGroup({
        source: new FormControl<string>('', [Validators.required]),
        convertedSource: new FormControl<any>({}),
        longitude: new FormControl<number>(0, [Validators.required]),
        latitude: new FormControl<number>(0, [Validators.required]),
        description: new FormControl<string>('')
    });

    constructor(private route: ActivatedRoute, 
        private imageService: ImageService, 
        private themeService: ThemeService,
        private imageProviderFactory: ImageProviderFactoryService) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.initData(Number(p['id']));
        });
    }

    private async initData(themeId: number) {
        const theme = await this.themeService.getTheme(themeId);

        this.imageProvider = this.imageProviderFactory.create(theme.sourceType);

        this.imageProvider.images(theme).then(r => {
            this.images = r;
        });
    }

    onSubmit() {
        const image:  Partial<Image> = {
            sourceType: this.theme.sourceType,
            themeId: this.theme.id,
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
            // add markers
            // ! Note that result image from supabase call is returned with
            // null location, so we add it here
            const img: Image =  Object.assign({} as Image, image);
            // refetch image              
            this.imageProvider.images(this.theme).then(r => {
                this.images = r;
            });
        });
    }

    imageInfo(): void {
        this.imageProvider.getImageInfo(this.editImage.value.source).then(r =>  {
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
        return this.imageProvider.getImageUrl(image, ImageSize.SMALL);
    }
}