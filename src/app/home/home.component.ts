import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { ThemePlayComponent } from './theme-play/theme-play.component';
import { Theme, ThemeService } from '../core/theme-service/theme.service';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ThemeResultComponent } from './theme-result/theme-result.component';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
    
    themes!: Promise<Theme[]>;
    selectedTheme!: Theme;
  
    constructor(private router: Router, private themeService: ThemeService) { }

    ngOnInit() { 
        this.themes = this.themeService.themes();        
    }

    onSelectedTheme() {
        this.router.navigate(['/theme', this.selectedTheme.id]);
    }
}

@NgModule({
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        MaterialModule, 
        RouterModule,
        SharedModule],
    exports: [HomeComponent, ThemePlayComponent, ThemeResultComponent],
    declarations: [HomeComponent, ThemePlayComponent, ThemeResultComponent],
  })
export class HomeModule {}