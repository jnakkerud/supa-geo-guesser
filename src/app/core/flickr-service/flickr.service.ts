import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flickrConfig } from '../../app-config';
import { ImageSize, Image } from '../image-service/image.service';
import { coerceNumberProperty } from '@angular/cdk/coercion';

function flickrUrl(methodName: string): URL {
    return new URL(`https://www.flickr.com/services/rest/?method=${methodName}&api_key=${flickrConfig.apiKey}&format=json`);
}
export interface FlickrImageSource {
    id: string;
    secret: string;
    serverId: string;
}

export interface FlickrPhotoInfo extends FlickrImageSource {
    //description: string; TODO get description?
    longitude?: number;
    latitude?: number;
    title?: string;
}

export function sizeSuffix(size: ImageSize): string {
    switch (size) {
        // 320
        case ImageSize.SMALL:
            return 'n';
        // 800
        case ImageSize.MEDIUM:
            return 'c';
        // 1024
        case ImageSize.LARGE:
            return 'b';
    }
}

export function mapPhoto(photo: any): FlickrPhotoInfo {
    const result: FlickrPhotoInfo = {
        id: photo.id,
        secret: photo.secret,
        serverId: photo.server,
        title: photo.title,
        latitude: coerceNumberProperty(photo.latitude),
        longitude: coerceNumberProperty(photo.longitude)
    }
    return result;
}

@Injectable({providedIn: 'root'})
export class FlickrService {
    
    constructor(private httpClient: HttpClient) { }
    
    getInfo(id: string): Promise<FlickrPhotoInfo> {
        const url: URL = flickrUrl('flickr.photos.getInfo');
        url.searchParams.append('photo_id', id);

        return new Promise<FlickrPhotoInfo>((resolve, reject) => {
            this.httpClient.jsonp(url.href, 'jsoncallback')
                .subscribe((res: any) => {
                    if (res.stat !== 'ok') {
                        console.error(res);
                        reject(`Error calling service: ${res.message}`);
                    }

                    const photo = res.photo;
                    console.log(photo);

                    const result: FlickrPhotoInfo = {
                        id: photo.id,
                        secret: photo.secret,
                        serverId: photo.server
                    }

                    if (photo.location && photo.location?.longitude) {
                        result.longitude = photo.location?.longitude;
                        result.latitude = photo.location?.latitude;
                    }

                    // TODO description

                    resolve(result)
                }
            );
        });
    }

    // https://www.flickr.com/services/api/misc.urls.html
    public getImageUrl(image: Partial<Image>, size: ImageSize): string {
        const imageSource: FlickrImageSource = image.source as FlickrImageSource;
        return `https://live.staticflickr.com/${imageSource.serverId}/${imageSource.id}_${imageSource.secret}_${sizeSuffix(size)}.jpg`;
    }

    public getGroupPhotos(groupId: string, page: number, perPage=30): Promise<FlickrPhotoInfo[]> {
        const url: URL = flickrUrl('flickr.groups.pools.getPhotos');
        url.searchParams.append('extras', 'geo');
        url.searchParams.append('group_id', groupId);
        url.searchParams.append('page', String(page));
        url.searchParams.append('per_page', String(perPage));

        return new Promise<FlickrPhotoInfo[]>((resolve, reject) => {
            this.httpClient.jsonp(url.href, 'jsoncallback')
                .subscribe((res: any) => {
                    if (res.stat !== 'ok') {
                        console.error(res);
                        reject(`Error calling service: ${res.message}`);
                    }

                    const result: FlickrPhotoInfo[] = [];
                    const photos: any[] = res.photos.photo;

                    photos.forEach(p => {
                        result.push(mapPhoto(p));
                    });

                    resolve(result)
                }
            );
        });
    }

}