import { useState, useEffect } from "react";

/**
 * MultiSelect Component
 * 
 * A controlled checkbox group that allows multiple selections from a given list of options.
 * Optionally includes an "Other" input for custom user-defined entries.
 * 
 * To use this component, add an entry to the Questions config:
 * 
 * {
 *   name: "example_question_name",
 *   label: "Your Question Label",
 *   type: "multiselect",
 *   options: ["Option A", "Option B", "Option C"],
 *   description: "Optional helper text shown below the label.",
 *   includeOtherOptions: true // Optional: Adds a 'Other' input
 * }
 * 
 * Notes:
 * - If `includeOtherOptions` is true, any free-text value entered will be added as: "Other: your text".
 */
export default function MultiSelect({ name, label, description, value, onChange, options, includeOtherOptions = false }) {
  const parseValue = (value) => {
    return Array.isArray(value)
      ? value.find((v) => v.startsWith("Other: "))?.replace("Other: ", "") || ""
      : "";
  };

  const [other, setOther] = useState(() => parseValue(value));

  useEffect(() => {
    setOther(parseValue(value));
  }, [value]);

  const handleCheckboxChange = (option) => {
    let newSelection = new Set(value || []);
    if (newSelection.has(option)) {
      newSelection.delete(option);
    } else {
      newSelection.add(option);
    }
    onChange({ target: { name, value: Array.from(newSelection) } });
  };
  
  const handleOtherBlur = () => {
    const selectedValues = new Set(
      Array.isArray(value) ? value.filter(v => options.includes(v)) : []
    );
  
    if (other.trim() !== "") {
      selectedValues.add(`Other: ${other.trim()}`);
    }
  
    onChange({ target: { name, value: Array.from(selectedValues) } });
  };
  

  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (<div className="text-sm text-black mb-4 dark:text-white">{description}</div>)}
      <div className="">
        <div className="flex flex-wrap gap-6">
          {options.map((option, index) => (
            <label key={index} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={value?.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="form-checkbox h-4 w-4 text-black cursor-pointer flex-shrink-0"
              />
              <span className="ml-2 text-gray-800 dark:text-white">{option}</span>
            </label>
          ))}
        </div>
        {includeOtherOptions && (
        <div className="mt-4">
          <label className="block font-medium text-black dark:text-white">
            <span className="block">Other:</span>
            <input
              type="text"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              onBlur={handleOtherBlur}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none"
            />
          </label>
        </div>
        )}
      </div>
    </div>
  );
}
