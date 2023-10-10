import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { NgOptimizedImage } from '@angular/common'
import { ThemePlayComponent } from './theme-play/theme-play.component';
import { ThemeImage, ThemeService } from '../core/theme-service/theme.service';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { ImageService, ImageSize } from '../core/image-service/image.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
    
    themes!: Promise<ThemeImage[]>;
  
    constructor(private themeService: ThemeService, private imageService: ImageService) { }

    ngOnInit() { 
        this.themes = this.themeService.themeImages();        
    }

    themeImage(theme: ThemeImage): string {
        return this.imageService.getImageUrl(theme.images[0], ImageSize.SMALL)
    }    
}

@NgModule({
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        MaterialModule, 
        RouterModule,
        NgOptimizedImage,
        SharedModule],
    exports: [HomeComponent, ThemePlayComponent, ThemeResultComponent],
    declarations: [HomeComponent, ThemePlayComponent, ThemeResultComponent],
  })
export class HomeModule {}