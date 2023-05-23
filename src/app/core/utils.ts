import { PostgrestError } from "@supabase/postgrest-js";

export function handleError(title: string, error: PostgrestError | null): void {
    if (error) {
        console.error(title, error.message);
        throw error;
    }
}