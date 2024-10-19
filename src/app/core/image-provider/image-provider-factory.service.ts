import { Injectable } from '@angular/core';
import { ImageProvider } from './image-provider';
import { FlickerImageProvider } from '../flickr-service/flickr-image-provider';
import { SupabaseService } from '../supabase-service/supabase.service';
import { FlickrService } from '../flickr-service/flickr.service';
import { SourceType } from '../utils';

@Injectable({providedIn: 'root'})
export class ImageProviderFactoryService {

    flickrImageProvider!: FlickerImageProvider;

    constructor(private supabaseService: SupabaseService, private flickrService: FlickrService) {}

    public create(sourceType: SourceType): ImageProvider {
        if (sourceType == SourceType.FLICKR) {
            if (!this.flickrImageProvider) {
                this.flickrImageProvider = new FlickerImageProvider(this.supabaseService, this.flickrService);
            }
            return this.flickrImageProvider;
        } else {
            throw new Error(`Unavailable source type: ${sourceType}`);
        }
    }

}