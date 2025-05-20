
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ThemeImage, ThemeService } from '../../core/theme-service/theme.service';
import { ImageSize } from '../../core/image-service/image.service';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';
import { SourceType } from 'src/app/core/utils';
import { FlickrGroupInfo } from 'src/app/core/flickr-service/flickr-group-image-provider';

@Component({
    selector: 'theme-list',
    templateUrl: './theme-list.component.html',
    styleUrls: ['theme-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ThemeListComponent implements OnInit {
    
    themes!: Promise<ThemeImage[]>;
  
    constructor(private themeService: ThemeService, private imageProviderFactory: ImageProviderFactoryService) { }

    ngOnInit() { 
        this.themes = this.themeService.themeImages();        
    }

    themeImage(theme: ThemeImage): string {
        const imageProvider = this.imageProviderFactory.create(theme.sourceType);
        return imageProvider.getImageUrl(theme.images[0], ImageSize.SMALL)
    }

    imagesCount(theme: ThemeImage): number {
        if (theme.sourceType === SourceType.FLICKR_GROUP) {            
             const groupInfo: FlickrGroupInfo = theme.sourceInfo;
             return groupInfo.photoCount
        }
        return theme.images.length;
    }
}