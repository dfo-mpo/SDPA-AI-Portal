import React from "react";

export default function MultiSelectText({ name, label, description, value = {}, onChange }) {
  const handleChange = (field, val) => {
    onChange({
      target: {
        name,
        value: {
          ...value,
          [field]: val
        }
      }
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      {description && (
        <p className="text-sm text-gray-600 dark:text-white mb-2">{description}</p>
      )}
      
      {/* Estimated Time */}
      <div className="mb-4 flex items-center space-x-2">
        <span className="text-gray-800 dark:text-white">Estimated time: </span>
        <input
          type="text"
          className="p-2 border rounded-md w-24 focus:outline-none"
          value={value.timeAmount || ""}
          onChange={(e) => handleChange("timeAmount", e.target.value)}
          placeholder="e.g. 2"
        />
        <select
          className="p-2 border rounded-md focus:outline-none"
          value={value.timeUnit || "weeks"}
          onChange={(e) => handleChange("timeUnit", e.target.value)}
        >
          <option value="hrs">hrs</option>
          <option value="weeks">weeks</option>
          <option value="months">months</option>
        </select>
      </div>

      {/* Estimated Cost */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-800 dark:text-white">Estimated cost: $</span>
        <input
          type="text"
          className="p-2 border rounded-md w-32 focus:outline-none"
          value={value.cost || ""}
          onChange={(e) => handleChange("cost", e.target.value)}
          placeholder="e.g. 1000"
        />
      </div>
    </div>
  );
}

