export function getRoomTypeCardStateClasses({
  isSelected,
  isBestDeal: _isBestDeal,
  hasSelectedRoom: _hasSelectedRoom,
}: {
  isSelected: boolean;
  isBestDeal: boolean;
  hasSelectedRoom: boolean;
}) {
  if (isSelected) {
    return 'ring-[3px] ring-primary bg-primary/10 shadow-xl shadow-primary/10';
  }

  return 'bg-surface ring-1 ring-black/5';
}
