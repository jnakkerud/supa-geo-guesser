import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Image, ImageService, ImageSize } from '../../core/image-service/image.service';
import { FormsModule } from '@angular/forms';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { ImageProvider } from 'src/app/core/image-provider/image-provider';
import { Theme, ThemeService } from 'src/app/core/theme-service/theme.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ImageMapComponent } from 'src/app/shared/image-map/image-map.component';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GeoService } from 'src/app/core/geo-service/geo.service';

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
        MatIconModule,
        NgOptimizedImage,
        MatButtonModule,
        ImageMapComponent,
        MatToolbarModule,
        FormsModule,
        MatInputModule
    ]
})
export class EditImageComponent implements OnInit {

    theme!: Theme;
    images!: Image[];
    imageProvider!: ImageProvider;
    loadMap: boolean = false;
    imageSource: string = '';
    description: string | null = null;
    metaData: string | null = null;
    previewImage: Partial<Image> | null = null;

    constructor(private route: ActivatedRoute, 
        private imageService: ImageService, 
        private themeService: ThemeService,
        private geoService: GeoService,
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

    addImage() {
        const image = Object.assign({} as Image, this.previewImage);

        if (!!this.description) {
            image.description = this.description;
        }        
        this.imageService.insert([image]).then(i => {
            console.log('Images saved', i)
            this.previewImage = null;
            this.description = null;
            this.metaData = null;
            this.imageSource = '';

            // refetch images              
            this.imageProvider.loadImages(this.theme).then(r => {
                this.images = r;
            });
        });
    }

    async imageInfo() {
        let { longitude, latitude, description, ...imageSource } = await this.imageProvider.getImageInfo(this.imageSource);
        this.previewImage = {
            sourceType: this.theme.sourceType,
            themeId: this.theme.id,
            location: {
                longitude: longitude,
                latitude: latitude
            },
            source: imageSource
        };
        this.description = description || null;
        if (this.previewImage.location) {
            const {description} = await this.geoService.lookup(this.previewImage.location);
            this.metaData = description || 'Cannot geo locate this image';
        }   
    }

    imgSmallSource(image: Partial<Image>): string {
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

    onTabChange(event: any): void {
        if (event.index === 1) {
            this.loadMap = true;
        }
    }

}