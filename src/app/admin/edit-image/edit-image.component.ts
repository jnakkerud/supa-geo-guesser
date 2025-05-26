import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Image, ImageService, ImageSize } from '../../core/image-service/image.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { ImageProvider } from 'src/app/core/image-provider/image-provider';
import { Theme, ThemeService } from 'src/app/core/theme-service/theme.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html',
    styleUrls: ['edit-image.component.scss'],
    imports: [
        MatFormField,
        MatLabel,
        MatTab,
        MatTabGroup,
        MatCardModule,
        ReactiveFormsModule,
        MatIcon,
        NgOptimizedImage,
        MatButtonModule,
        ImageMapComponent,
        MatToolbarModule,
        MatInput
    ]
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
        this.theme = await this.themeService.getTheme(themeId);

        this.imageProvider = this.imageProviderFactory.create(this.theme.sourceType);

        this.imageProvider.loadImages(this.theme).then(r => {
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

        // TODO get title or description from image source
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
            this.imageProvider.loadImages(this.theme).then(r => {
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

    deleteImage(image: Image): void {
        this.imageService.delete(image.id).then(() => {
            this.images = this.images.filter(i => i.id !== image.id);
        }).catch(err => {
            console.error('Error deleting image', err);
        });
    }

    deleteTheme(): void {
        this.themeService.delete(this.theme.id).then(() => {
            // Navigate back to themes list
            window.history.back();
        }).catch(err => {
            console.error('Error deleting theme', err);
        });
    }
}