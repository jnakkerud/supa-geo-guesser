import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError } from '../utils';
import { mapResultToImage, Image, ImageSize } from '../image-service/image.service';
import { Theme } from '../theme-service/theme.service';

export abstract class ImageProvider {
    
    constructor(public supabaseService: SupabaseService) {}

    public async images(theme: Theme): Promise<Image[]> {
        const { data, error } = await this.supabaseService.supabase.rpc('images_in_theme',
            {themeid: theme.id}
        );
   
        try {
            handleError('', error);
            const result = mapResultToImage(data);
            return new Promise((resolve) => {resolve(result)});                
        } catch (error) {
            return new Promise((resolve) => {resolve([])});                
        }
    }

    public abstract getImageUrl(image: Partial<Image>, size: ImageSize): string;

    // Used when adding an image to to the database
    public abstract getImageInfo(source: string ): Promise<any>;
}