import { useState } from 'react';

export default function InputField({ name, label, description, value, maxlength, onChange }) {
  const [warning, setWarning] = useState('');

  const handleLocalChange = (e) => {
    if (maxlength && e.target.value.length > maxlength) {
      setWarning(`Maximum ${maxlength} characters allowed`);
      return;
    }
    if (warning) setWarning('');
    onChange(e);
  };

  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={handleLocalChange} 
        className="w-full p-2 border rounded-lg" 
        required 
      />

      {warning && <p className="text-xs text-red-500 mt-1">{warning}</p>}
    </div>
  );
}