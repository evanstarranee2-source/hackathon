import heroCloudsImg from '../assets/images/hero_meghalaya_clouds_1794636437469.jpg';
import rootBridgeImg from '../assets/images/place_root_bridge_1794636437519.jpg';
import dawkiRiverImg from '../assets/images/place_dawki_river_1794636438931.jpg';
import nohkalikaiImg from '../assets/images/place_nohkalikai_falls_1794636439096.jpg';
import khasiCottageImg from '../assets/images/homestay_khasi_cottage_1794636440310.jpg';
import wangalaFestivalImg from '../assets/images/event_wangala_festival_1794636440207.jpg';
import type { ImageKey } from '../types';

export const IMAGE_MAP: Record<ImageKey, string> = {
  hero_clouds: heroCloudsImg,
  root_bridge: rootBridgeImg,
  dawki_river: dawkiRiverImg,
  nohkalikai: nohkalikaiImg,
  khasi_cottage: khasiCottageImg,
  wangala_festival: wangalaFestivalImg,
};

export function getImageSrc(key: ImageKey): string {
  return IMAGE_MAP[key] || heroCloudsImg;
}
