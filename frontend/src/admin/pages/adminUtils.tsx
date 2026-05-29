export const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
};

export const numberValue = (value: string | number | null | undefined) => Number(value ?? 0);

export const pageTitle = (title: string, subtitle: string) => (
  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
  </div>
);
