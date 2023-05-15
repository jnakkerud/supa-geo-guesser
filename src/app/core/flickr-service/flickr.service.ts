import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class FlickrService {
    
    constructor(private httpClient: HttpClient) { }
    
    getImageUrl(id: string, size: string) {
        const url = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=25e4ac50b599c34a19a44c08339a3292&format=json&photo_id=52793526908';
        this.httpClient.jsonp(url, 'jsoncallback').subscribe((res: any) => {
            console.log(res);
        });
    }

    getGalleryPhotos() {

    }

    getLocation(id: string) {

    }
}