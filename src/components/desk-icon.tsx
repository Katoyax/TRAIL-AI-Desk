import { View } from 'react-native';
import { Brand } from '../constants/brand';

export type DeskIconName = 'chat' | 'history' | 'university' | 'offices' | 'calendar' | 'announcement' | 'concern' | 'profile' | 'settings' | 'logout' | 'panel' | 'plus' | 'send' | 'arrow' | 'book' | 'close' | 'shield';
type Segment = [number, number, number, number];
const paths: Record<DeskIconName, Segment[]> = {
  chat: [[5,18,3,22],[3,22,10,19],[7,8,17,8],[7,12,14,12]],
  history: [[3,4,3,9],[3,9,8,9],[12,7,12,12],[12,12,16,14]],
  university: [[3,8,12,3],[12,3,21,8],[3,8,21,8],[5,11,5,18],[10,11,10,18],[15,11,15,18],[20,11,20,18],[3,21,22,21]],
  offices: [[5,21,5,3],[5,3,18,3],[18,3,18,21],[2,21,22,21],[9,7,10,7],[14,7,15,7],[9,11,10,11],[14,11,15,11],[10,21,10,16],[10,16,14,16],[14,16,14,21]],
  calendar: [[7,2,7,6],[17,2,17,6],[3,9,21,9],[7,13,8,13],[12,13,13,13],[17,13,18,13],[7,17,8,17],[12,17,13,17]],
  announcement: [[4,9,4,15],[4,9,9,9],[9,9,20,4],[20,4,20,20],[20,20,9,15],[9,15,4,15],[7,15,9,21],[9,21,12,21],[12,21,10,16]],
  concern: [[12,7,12,13],[12,17,12,17]],
  profile: [[5,21,5,19],[5,19,8,16],[8,16,16,16],[16,16,19,19],[19,19,19,21]],
  settings: [[12,2,12,5],[12,19,12,22],[2,12,5,12],[19,12,22,12],[5,5,7,7],[17,17,19,19],[5,19,7,17],[17,7,19,5]],
  logout: [[10,3,4,3],[4,3,4,21],[4,21,10,21],[10,12,22,12],[18,8,22,12],[22,12,18,16]],
  panel: [[9,3,9,21],[5,7,6,7]],
  plus: [[12,5,12,19],[5,12,19,12]],
  send: [[12,19,12,5],[6,11,12,5],[12,5,18,11]],
  arrow: [[5,12,19,12],[14,7,19,12],[19,12,14,17]],
  book: [[12,5,12,21],[3,3,12,5],[12,5,21,3],[3,3,3,19],[3,19,12,21],[12,21,21,19],[21,19,21,3]],
  close: [[6,6,18,18],[6,18,18,6]],
  shield: [[12,2,21,6],[21,6,19,16],[19,16,12,22],[12,22,5,16],[5,16,3,6],[3,6,12,2],[8,12,11,15],[11,15,16,9]],
};

/** Small native line icons; no web-only font or additional runtime dependency. */
export function DeskIcon({ name, color = Brand.muted, size = 21 }: { name: DeskIconName; color?: string; size?: number }) {
  const scale = size / 24;
  const circle = (x: number, y: number, diameter: number, key: string) => <View key={key} style={{ position: 'absolute', left: x * scale, top: y * scale, width: diameter * scale, height: diameter * scale, borderRadius: diameter * scale / 2, borderWidth: 1.6 * scale, borderColor: color }} />;
  const rect = (x: number, y: number, width: number, height: number) => <View style={{ position: 'absolute', left: x * scale, top: y * scale, width: width * scale, height: height * scale, borderRadius: 3 * scale, borderWidth: 1.6 * scale, borderColor: color }} />;
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
    {name === 'chat' && rect(3,3,18,16)}
    {name === 'calendar' && rect(3,4,18,17)}
    {name === 'panel' && rect(2,3,20,18)}
    {name === 'history' && circle(3,3,18,'history')}
    {name === 'profile' && circle(8,3,8,'head')}
    {name === 'settings' && circle(6,6,12,'gear')}
    {name === 'settings' && circle(9.5,9.5,5,'center')}
    {name === 'concern' && circle(2,2,20,'alert')}
    {paths[name].map(([x1,y1,x2,y2], index) => {
      const length = Math.max(1.6, Math.hypot(x2-x1,y2-y1)) * scale;
      return <View key={index} style={{ position: 'absolute', left: (x1+x2)*scale/2-length/2, top: (y1+y2)*scale/2-0.8*scale, width: length, height: 1.6*scale, borderRadius: scale, backgroundColor: color, transform: [{ rotate: `${Math.atan2(y2-y1,x2-x1)*180/Math.PI}deg` }] }} />;
    })}
  </View>;
}
