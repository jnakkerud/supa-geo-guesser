import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FlickrService } from '../core/flickr-service/flickr.service';
import { ThemeService } from '../core/theme-service/theme-service';
import { ImageService, SourceType } from '../core/image-service/image-service';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html'
})

export class AdminComponent {
    constructor(private flickrService: FlickrService, private themeService: ThemeService, private imageService: ImageService) { }


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
        CommonModule, MaterialModule],
    exports: [AdminComponent],
    declarations: [AdminComponent],
  })
export class AdminModule {}