type PricedAddOn = {
  price: string | number;
} | null | undefined;

interface BookingSummaryTotalsInput {
  roomPricePerNight: string | number;
  nights: number;
  transferQuote?: PricedAddOn;
  discount?: number;
}

export function getBookingSummaryTotals({ roomPricePerNight, nights, transferQuote, discount = 0 }: BookingSummaryTotalsInput) {
  const roomTotal = Number(roomPricePerNight) * nights;
  const transferTotal = transferQuote ? Number(transferQuote.price) : 0;
  const discountAmount = discount || 0;

  return {
    roomTotal,
    transferTotal,
    discountAmount,
    grandTotal: roomTotal + transferTotal - discountAmount,
  };
}
