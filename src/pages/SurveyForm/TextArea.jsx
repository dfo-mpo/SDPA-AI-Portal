export default function TextArea({ name, label, description, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2">{label}</label>
      {description && (<div className="text-sm text-black mb-4">{description}</div>)}
      <textarea name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-lg" required />
    </div>
  );
}