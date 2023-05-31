import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'theme',
    templateUrl: './theme.component.html'
})

export class ThemeComponent implements OnInit {

    themeId!: number;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe(p => {
            this.themeId = Number(p['id']);
        });        
     }
}

@NgModule({
    imports: [
        CommonModule, ReactiveFormsModule, MaterialModule, NgOptimizedImage],
    exports: [ThemeComponent],
    declarations: [ThemeComponent],
  })
export class ThemeModule {}