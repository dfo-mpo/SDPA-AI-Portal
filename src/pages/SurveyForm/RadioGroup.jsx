export default function RadioGroup({ name, label, description, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
      <div className="flex flex-wrap gap-6">
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name={name} 
              value={option} 
              checked={value === option} 
              onChange={onChange} 
              className="form-radio h-5 w-5 text-black cursor-pointer dark:text-white"
              required
            />
            <span className="ml-2 text-black dark:text-white">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
