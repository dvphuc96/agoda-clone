type PricedAddOn = {
  price: string | number;
} | null | undefined;

interface BookingSummaryTotalsInput {
  roomPricePerNight: string | number;
  nights: number;
  transferQuote?: PricedAddOn;
}

export function getBookingSummaryTotals({ roomPricePerNight, nights, transferQuote }: BookingSummaryTotalsInput) {
  const roomTotal = Number(roomPricePerNight) * nights;
  const transferTotal = transferQuote ? Number(transferQuote.price) : 0;

  return {
    roomTotal,
    transferTotal,
    grandTotal: roomTotal + transferTotal,
  };
}
