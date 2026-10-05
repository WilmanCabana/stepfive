import { supabase } from '../config/supabase.config.mjs'

export async function uploadImage(file, path) {
    const ext = file.name.split('.').pop()
    const uniquePath = `${path}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    
    const { data, error } = await supabase.storage
        .from('space-images')
        .upload(uniquePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        })
    
    if (error) {
        console.error('Upload error:', error)
        return null
    }
    
    const { data: urlData } = supabase.storage
        .from('space-images')
        .getPublicUrl(data.path)
    return urlData.publicUrl
}