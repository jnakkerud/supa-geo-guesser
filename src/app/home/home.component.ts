import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { ThemeComponent } from './theme/theme.component';
import { Theme, ThemeService } from '../core/theme-service/theme.service';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

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
        console.log(this.selectedTheme);
        this.router.navigate(['/theme', this.selectedTheme.id]);
    }
}

@NgModule({
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        MaterialModule, 
        NgOptimizedImage, 
        SharedModule],
    exports: [HomeComponent, ThemeComponent],
    declarations: [HomeComponent, ThemeComponent],
  })
export class HomeModule {}