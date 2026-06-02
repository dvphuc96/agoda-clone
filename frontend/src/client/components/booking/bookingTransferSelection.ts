type TransferQuoteLike = {
  route_id: number;
  vehicle_type: {
    id: number;
  };
};

export function findSelectedTransferQuote<TQuote extends TransferQuoteLike>(
  quotes: TQuote[] | undefined,
  selectedVehicleTypeId: string,
) {
  if (!selectedVehicleTypeId) {
    return null;
  }

  return quotes?.find((quote) => String(quote.vehicle_type.id) === selectedVehicleTypeId) ?? null;
}
