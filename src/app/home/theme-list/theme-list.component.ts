
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ThemeImage, ThemeService } from '../../core/theme-service/theme.service';
import { ImageService, ImageSize } from '../../core/image-service/image.service';

@Component({
    selector: 'theme-list',
    templateUrl: './theme-list.component.html',
    styleUrls: ['theme-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeListComponent implements OnInit {
    
    themes!: Promise<ThemeImage[]>;
  
    constructor(private themeService: ThemeService, private imageService: ImageService) { }

    ngOnInit() { 
        this.themes = this.themeService.themeImages();        
    }

    themeImage(theme: ThemeImage): string {
        return this.imageService.getImageUrl(theme.images[0], ImageSize.SMALL)
    }    
}