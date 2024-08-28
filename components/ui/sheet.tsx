import { Dispatch, SetStateAction, ReactNode, useState } from 'react';
import { Sheet } from '@tamagui/sheet';

type SnapPointsMode = 'percent' | 'constant' | 'fit' | 'mixed';

interface ReusableSheetProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  snapPointsMode?: SnapPointsMode;
  initialPosition?: number;
  modal?: boolean;
  snapPoints?: (number | string)[];
  children: ReactNode;
}

export const MySheet = ({
  open,
  setOpen,
  snapPointsMode = 'percent',
  initialPosition = 0,
  modal = true,
  snapPoints,
  children,
}: ReusableSheetProps) => {
  const [position, setPosition] = useState(initialPosition);
  const computedSnapPoints = snapPoints || (snapPointsMode === 'percent' ? [85, 50, 25] : ['80%', 256, 190]);

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={modal}
      open={open}
      onOpenChange={setOpen}
      snapPoints={computedSnapPoints}
      snapPointsMode={snapPointsMode}
      dismissOnSnapToBottom
      position={position}
      onPositionChange={setPosition}
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
        {children}
      </Sheet.Frame>
    </Sheet>
  );
};
