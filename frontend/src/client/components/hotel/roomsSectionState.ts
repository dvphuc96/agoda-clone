const baseRoomsSectionLinkClasses = 'mt-4 flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-white transition-spring-fast';

export function getRoomsSectionLinkClasses(isActive: boolean) {
  return isActive
    ? `${baseRoomsSectionLinkClasses} bg-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-surface`
    : `${baseRoomsSectionLinkClasses} bg-primary hover:bg-primary-hover`;
}
