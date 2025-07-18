export default function Calander({ name, label, description, value, onChange }) {
    return (
      <div className="mb-4">
        <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
        {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
        <input type="date" name={name} value={value} onChange={onChange} className="p-2 border rounded-lg" />
      </div>
    );
  }