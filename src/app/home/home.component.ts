import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { NgOptimizedImage } from '@angular/common'
import { ThemePlayComponent } from './theme-play/theme-play.component';
import { Theme, ThemeService } from '../core/theme-service/theme.service';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { ThemeListComponent } from './theme-list/theme-list.component';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
    
    randomTheme!: Theme;

    toggleHelp = false;

    constructor(private themeService: ThemeService) { }

    ngOnInit() { 
        this.themeService.themeImages().then(themes => {
            const random = Math.floor(Math.random() * themes.length);
            this.randomTheme = themes[random];
        });
    }

    toggle() {
        this.toggleHelp = !this.toggleHelp;
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
    exports: [HomeComponent, ThemePlayComponent, ThemeResultComponent, ThemeListComponent],
    declarations: [HomeComponent, ThemePlayComponent, ThemeResultComponent, ThemeListComponent],
  })
export class HomeModule {}