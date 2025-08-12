export default function TextArea({ name, label, description, value, onChange, required = true }) {
  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
      <textarea name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-lg" required={required} />
    </div>
  );
}