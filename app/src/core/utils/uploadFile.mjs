import { supabase } from '../config/supabase.config.mjs'

const SUPPORTED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'video/webm'
])

export async function uploadFile(file, path) {
    if (!SUPPORTED_CONTENT_TYPES.has(file?.type)) {
        console.error(`Unsupported upload content type: ${file?.type || 'unknown'}`)
        return null
    }

    const extension = file.name.includes('.')
        ? file.name.slice(file.name.lastIndexOf('.') + 1).replace(/[^a-zA-Z0-9]/g, '')
        : ''
    const uniquePath = `${path}-${Date.now()}-${Math.random().toString(36).substring(7)}${extension ? `.${extension}` : ''}`
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

export const uploadImage = uploadFile
export const uploadVideo = uploadFile
