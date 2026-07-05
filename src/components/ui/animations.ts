import { FadeInDown, FadeInUp } from "react-native-reanimated";

/**
 * Staggered FadeInDown for list items.
 * Pass the item's index to offset each card's entrance.
 */
export function listItemEntering(index: number) {
  return FadeInDown.delay(index * 60)
    .duration(300)
    .springify()
    .damping(15);
}

/**
 * FadeInUp entrance for full-screen content sections.
 */
export function contentEntering() {
  return FadeInUp.duration(400).springify().damping(16);
}
