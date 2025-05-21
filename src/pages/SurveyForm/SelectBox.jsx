export default function SelectBox({ name, label, description, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="w-full p-2 border rounded-lg"
        required
      >
        <option value="" disabled>Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}