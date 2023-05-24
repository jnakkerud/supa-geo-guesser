import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import {  FormControl, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { FlickrService } from '../core/flickr-service/flickr.service';
import { Theme, ThemeService } from '../core/theme-service/theme-service';
import { ImageService, SourceType } from '../core/image-service/image-service';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['admin.component.scss'],
})

export class AdminComponent {

    adminTheme: FormGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        description: new FormControl<string>('')
    });

    constructor(private flickrService: FlickrService, private themeService: ThemeService, private imageService: ImageService) { }

    onSubmit() {
        // console.log(this.adminTheme.value)
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

        this.imageService.images(2).then(r => console.log(r));
    }

}

@NgModule({
    imports: [
        CommonModule, ReactiveFormsModule, MaterialModule],
    exports: [AdminComponent],
    declarations: [AdminComponent],
  })
export class AdminModule {}