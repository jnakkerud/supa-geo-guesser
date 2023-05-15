import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FlickrService, PhotoSize } from '../core/flickr-service/flickr.service';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html'
})

export class AdminComponent {
    constructor(private flickrService: FlickrService) { }


    test() {
        console.log('start test');
        this.flickrService.getImageUrl('52793526908', PhotoSize.Large1600).then(result => {
            console.log(result.href)
        });
    }

}

@NgModule({
    imports: [
        CommonModule, MaterialModule],
    exports: [AdminComponent],
    declarations: [AdminComponent],
  })
export class AdminModule {}