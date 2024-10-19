import { ImageProvider } from "../image-provider/image-provider";
import { Image, ImageSize } from "../image-service/image.service";
import { FlickrService } from "./flickr.service";
import { SupabaseService } from "../supabase-service/supabase.service";

// TODO add flickr service code here
export class FlickerImageProvider extends ImageProvider {

    constructor(public override supabaseService: SupabaseService, private flickrService: FlickrService) {
        super(supabaseService);
    }

    public override getImageUrl(image: Partial<Image>, size: ImageSize): string {
        try {
            return this.flickrService.getImageUrl(image, size);

        } catch (error) {
            console.error('Unable to get image URL', error);
        }
        // TODO generic No Image url
        return 'https://live.staticflickr.com/65535/52793526908_c11769cd0c_n.jpg';
    }

    public override getImageInfo(source: string): Promise<any> {
        return this.flickrService.getInfo(source);
    }    
}