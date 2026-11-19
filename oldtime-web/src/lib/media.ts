import type { DraftMedia } from '../types'
import { uploadApi } from './api'

export interface UploadedMedia {
  url: string
  thumbnail: string
  audioUrl: string
}

export async function uploadDraftMedia(media: DraftMedia): Promise<UploadedMedia> {
  let url: string
  let thumbnail = ''

  if (media.type === 'video') {
    if (!media.file) {
      throw new Error('视频文件已失效，请重新选择。')
    }

    const video = await uploadApi.video(media.file)
    url = video.data.url

    if (media.thumbnailFile) {
      const thumb = await uploadApi.single(media.thumbnailFile)
      thumbnail = thumb.data.url
    }
  } else {
    if (!media.file) {
      throw new Error('照片文件已失效，请重新选择。')
    }

    const image = await uploadApi.single(media.file)
    url = image.data.url
    thumbnail = image.data.thumbnail
  }

  let audioUrl = ''
  if (media.audioFile) {
    const audio = await uploadApi.audio(media.audioFile)
    audioUrl = audio.data.url
  }

  return { url, thumbnail, audioUrl }
}
