import type { ElementRef, RefObject } from 'react';
import type { ScrollView, View } from 'react-native';

type ScrollViewWithInner = ScrollView & {
  getInnerViewRef?: () => ElementRef<typeof View> | null;
};

export type ScrollFieldToCenterOptions = {
  /**
   * Pixels of the bottom of the scroll view still covered by the keyboard
   * (when you cannot trust `viewportHeight` from layout yet). Shrinks the region
   * we center into toward the top.
   */
  obscuredBottom?: number;
  /**
   * Where the field’s vertical center should sit in the visible area (0.5 = middle).
   * Slightly < 0.5 places the field higher, above keyboard overlap.
   */
  centerFraction?: number;
};

/**
 * Scrolls a vertical ScrollView so that `fieldRef` is placed in the vertical
 * center of the visible viewport (or slightly higher if `centerFraction` < 0.5).
 */
export function scrollFieldToCenter(
  scrollRef: RefObject<ScrollView | null>,
  fieldRef: RefObject<View | null>,
  viewportHeight: number,
  options?: ScrollFieldToCenterOptions,
): void {
  const scroll = scrollRef.current;
  const field = fieldRef.current;
  if (!scroll || !field || viewportHeight <= 0) {
    return;
  }

  const obscured = Math.max(0, options?.obscuredBottom ?? 0);
  const visibleH = Math.max(72, viewportHeight - obscured);
  const t = options?.centerFraction ?? 0.5;

  const inner = (scroll as ScrollViewWithInner).getInnerViewRef?.() ?? null;
  if (!inner) {
    return;
  }

  field.measureLayout(
    inner,
    (_x, y, _w, h) => {
      const targetY = y - t * visibleH + h / 2;
      scroll.scrollTo({ y: Math.max(0, targetY), animated: true });
    },
    () => {},
  );
}
