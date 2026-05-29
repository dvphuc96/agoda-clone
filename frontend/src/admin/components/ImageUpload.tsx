type Props = {
  label: string;
  multiple?: boolean;
  onChange: (files: FileList) => void;
};

export default function ImageUpload({ label, multiple, onChange }: Props) {
  return (
    <label className="block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="mt-2 block w-full text-sm"
        onChange={(event) => {
          if (event.target.files?.length) onChange(event.target.files);
        }}
      />
    </label>
  );
}
