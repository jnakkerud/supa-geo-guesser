import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FlickrService } from '../core/flickr-service/flickr.service';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html'
})

export class AdminComponent {
    constructor(private flickrService: FlickrService) { }


    test() {
        console.log('start test');
        this.flickrService.getLocation('52793526908').then(result => {
            console.log(result)
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