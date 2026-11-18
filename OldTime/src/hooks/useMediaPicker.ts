import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Media } from '../types';
import { generateUUID } from '../lib/utils';
import { MAX_PHOTOS, MAX_VIDEOS } from '../lib/constants';

export function useMediaPicker() {
  const [loading, setLoading] = useState(false);

  const pickImages = async (currentMedia: Media[] = []): Promise<Media[]> => {
    try {
      setLoading(true);

      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能选择照片，请在设置中开启。');
        return [];
      }

      const imageCount = currentMedia.filter((m) => m.type === 'image').length;
      const videoCount = currentMedia.filter((m) => m.type === 'video').length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - imageCount,
        quality: 1,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      const newMedia: Media[] = [];

      for (const asset of result.assets) {
        const isVideo = asset.type === 'video';

        if (isVideo) {
          if (videoCount + newMedia.filter((m) => m.type === 'video').length >= MAX_VIDEOS) {
            continue;
          }

          const thumbnail = await generateVideoThumbnail(asset.uri);
          newMedia.push({
            id: generateUUID(),
            type: 'video',
            uri: asset.uri,
            thumbnailUri: thumbnail,
            width: asset.width,
            height: asset.height,
            duration: asset.duration || 0,
            story: '',
            needStory: true,
          });
        } else {
          if (imageCount + newMedia.filter((m) => m.type === 'image').length >= MAX_PHOTOS) {
            continue;
          }

          const compressed = await compressImage(asset.uri);
          newMedia.push({
            id: generateUUID(),
            type: 'image',
            uri: compressed.uri,
            width: compressed.width,
            height: compressed.height,
            story: '',
            needStory: true,
          });
        }
      }

      return newMedia;
    } catch (err) {
      console.error('选择媒体失败:', err);
      Alert.alert('错误', '选择照片失败，请重试。');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result;
  };

  const generateVideoThumbnail = async (videoUri: string): Promise<string> => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
        quality: 0.8,
      });
      return uri;
    } catch (err) {
      console.error('生成视频封面失败:', err);
      return videoUri;
    }
  };

  return { pickImages, loading };
}
