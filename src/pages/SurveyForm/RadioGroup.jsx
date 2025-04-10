export default function RadioGroup({ name, label, description, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2">{label}</label>
      {description && (<div className="text-sm text-black mb-4">{description}</div>)}
      <div className="flex space-x-6">
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name={name} 
              value={option} 
              checked={value === option} 
              onChange={onChange} 
              className="form-radio h-5 w-5 text-black cursor-pointer"
              required
            />
            <span className="ml-2 text-black">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
