
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ThemeImage, ThemeService } from '../../core/theme-service/theme.service';
import { ImageSize } from '../../core/image-service/image.service';
import { ImageProviderFactoryService } from 'src/app/core/image-provider/image-provider-factory.service';

@Component({
    selector: 'theme-list',
    templateUrl: './theme-list.component.html',
    styleUrls: ['theme-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
}