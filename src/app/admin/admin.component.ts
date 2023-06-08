import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common'
import { MaterialModule } from '../material.module';
import { Theme, ThemeService } from '../core/theme-service/theme.service';
import { EditImageComponent } from './edit-image/edit-image.component';
import { Router } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['admin.component.scss'],
})
export class AdminComponent implements OnInit {

    themes!: Promise<Theme[]>;
    selectedTheme!: Theme;

    adminTheme: FormGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        description: new FormControl<string>('')
    });

    constructor(private router: Router, private themeService: ThemeService) { }

    ngOnInit(): void {
        this.themes = this.themeService.themes();
    }

    onSelectedTheme() {
        console.log(this.selectedTheme);
        this.router.navigate(['/edit-image', { id: this.selectedTheme.id }]);
    }

    onSubmit() {
        const theme: Partial<Theme>  = {
            name: this.adminTheme.value.name
        }

        if (!!this.adminTheme.value.description) {
            theme.description = this.adminTheme.value.description;
        }
        
        this.themeService.insert(theme).then(r => console.log('Theme created', r));
    }

    test() {
        console.log('start test');
        /*this.flickrService.getLocation('52793526908').then(result => {
            console.log(result)
        });*/

        //this.themeService.themes().then(r => console.log(r));

        /*this.imageService.insert([{
            themeId: 2,
            source: '52793526908',
            sourceType: SourceType.FLICKR,
            location: {latitude: 48.211727, longitude: 16.365630}
        }]).then(r => console.log(r));*/

        //this.imageService.images(2).then(r => console.log(r));
    }

}

@NgModule({
    imports: [
        CommonModule, ReactiveFormsModule, MaterialModule, NgOptimizedImage, LeafletModule],
    exports: [AdminComponent, EditImageComponent],
    declarations: [AdminComponent, EditImageComponent],
  })
export class AdminModule {}