'use client';
import { useState, useEffect, useRef } from "react";
import TooltipWord from "./TooltipWord";

/**
 * ToolSelectionQuestion Component
 * 
 * A multi-category tool selector that allows users to:
 * - Choose one or more tool categories
 * - Select multiple tools within each category
 * - Optionally enter a free-text tool under each category ("Other {Category}")
 * - Optionally enter global "Other Tools" outside categories
 * 
 * To use this component, add an entry to the Questions config:
 * 
 * {
 *   name: "example_tool_name",
 *   label: "Your Tool Label",
 *   type: "toolSelection",
 *   options: [
 *     {
 *       id: "option_A_id",
 *       label: "Option A",
 *       options: ["Tool A", "Tool B", "Tool C"]
 *     },
 *     {
 *       id: "option_B_id",
 *       label: "Option B",
 *       options: ["Tool A", "Tool B"]
 *     }
 *   ]
 * }
 * 
 * Notes:
 * - Selected data is serialized as a JSON string and submitted under the `name` field.
 * - Each selected category must include at least one selected tool or a non-empty "Other" entry to pass validation.
 * - Validation errors are triggered when a selected category has no tools or "Other" text.
 */
export default function ToolSelectionQuestion({ 
  name, 
  label, 
  value, 
  options, 
  onChange, 
  onValidationChange, 
  submitted, 
  setSubmitted
}) {
  const parseValue = (value, options) => {
    const parsed = value ? JSON.parse(value) : { categories: {}, otherTools: "" };

    const selectedCategories = {};
    const selectedCategoryOptions = {};

    for (const categoryLabel in parsed.categories) {
      const category = options.find(o => o.label === categoryLabel);
      if (category) {
        selectedCategories[category.id] = true;
        selectedCategoryOptions[category.id] = {
          selected: new Set(parsed.categories[categoryLabel].options || []),
          other: parsed.categories[categoryLabel].other || ""
        };
      }
    }

    return {
      selectedCategories,
      selectedCategoryOptions,
      otherTools: parsed.otherTools || ""
    };
  };
  
  const {
    selectedCategories: initialSelectedCategories,                // Category labels check box
    selectedCategoryOptions: initialSelectedCategoryOptions,      // Category options check box
    otherTools: initialOtherTools                                 // Other tools input text
  } = parseValue(value, options);

  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories);
  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState(initialSelectedCategoryOptions);
  const [otherTools, setOtherTools] = useState(initialOtherTools);

  useEffect(() => {
    const { selectedCategories, selectedCategoryOptions, otherTools } = parseValue(value, options);
    setSelectedCategories(selectedCategories);
    setSelectedCategoryOptions(selectedCategoryOptions);
    setOtherTools(otherTools);
  }, [value, options]);

  const [error, setError] = useState({ hasError: false, message: "" });
  const errorRef = useRef(null);

  const resetError = () => {
    if (submitted && error.hasError) {
      setError({ hasError: false, message: "" });
      setSubmitted(false);
      if (onValidationChange) onValidationChange(false);
    }
  };

  // Toggle a category on/off.
  const toggleCategory = (catId) => {
    resetError();
    setSelectedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Toggle an option within a category.
  const toggleOption = (catId, option) => {
    resetError();
    setSelectedCategoryOptions((prev) => {
      const catSelection = prev[catId] || { selected: new Set(), other: "" };
      const newSelected = new Set(catSelection.selected);
      if (newSelected.has(option)) {
        newSelected.delete(option);
      } else {
        newSelected.add(option);
      }
      return {
        ...prev,
        [catId]: { ...catSelection, selected: newSelected }
      };
    });
  };

  // Handle "Other" text input within a category.
  const handleCategoryOtherChange = (catId, e) => {
    const text = e.target.value;
    setSelectedCategoryOptions((prev) => {
      const catSelection = prev[catId] || { selected: new Set(), other: "" };
      return {
        ...prev,
        [catId]: { ...catSelection, other: text }
      };
    });
  };

  // Handle change for global "Other Tools" input.
  const handleOtherToolsChange = (e) => {
    setOtherTools(e.target.value);
  };

  // Whenever any of the selections change, update the parent form via onChange.
  // We serialize the answer as a JSON string that includes the data for each category plus a global "other".
  useEffect(() => {
    const answer = {
      categories: {},
      otherTools: otherTools
    };

    let isValid = true;

    Object.keys(selectedCategories).forEach((catId) => {
      if (selectedCategories[catId]) {
        const catData = selectedCategoryOptions[catId] || { selected: new Set(), other: ""};

        // Validate must have at least one option or a non-empty "other" input
        if (catData.selected.size === 0 && catData.other.trim() === "") {
          isValid = false;
        }

        // Look up the category label by using the category id (catId)
        const catItem = options.find(cat => cat.id === catId);
        const catLabel = catItem ? catItem.label : catId;

        answer.categories[catLabel] = {
          options: Array.from(catData.selected),
          other: catData.other
        };
      }
    });

    if (!isValid !== error.hasError) {
      setError({
        hasError: !isValid,
        message: !isValid 
          ? "Please select at least one tool or provide an alternative in each chosen category." 
          : ""
       })
       if (onValidationChange) onValidationChange(!isValid);
    }

    const newValue = JSON.stringify(answer);
    if (newValue !== value) {
      onChange({ target: { name, value: newValue } });
    }
  }, [selectedCategories, selectedCategoryOptions, otherTools, name, onChange, value, onValidationChange, error]);

  useEffect(() => {
    if (submitted && error.hasError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const stored = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
  
    if (stored === 'dark' || (stored === 'system' && prefersDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [submitted, error.hasError]);

  // useEffect(() => {
  //   console.log("error state:", error.hasError, "message:", error.message);
  // }, [error]);

  return (
    <div className="my-6">
      <label className="block text-black font-bold mb-2 dark:text-white">{label}</label>
      <div className="text-sm text-black mb-4 dark:text-white">
        Select a category to see available <TooltipWord word="tools and services" tooltip="Software platforms, infrastructure, or resources that support data-driven work like modeling, visualization, or storage."/>. You can pick individual tools within each category or type in a tool if it's not listed. If no category fits, enter your tool directly in "Other Tools".
      </div>
      {submitted && error.hasError && (
        <p ref={errorRef} className="text-sm text-red-600 mb-4">{error.message}</p> 
      )}
      <div className="border p-4 rounded-lg">
        {options.map((category) => (
          <div key={category.id} className="p-2">
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={!!selectedCategories[category.id]} 
                onChange={() => toggleCategory(category.id)} 
                className="form-checkbox h-4 w-4 text-black cursor-pointer flex-shrink-0"
              />
              {category.label}
            </label>
            {selectedCategories[category.id] && (
              <div className="mx-2 mt-2 px-6 space-y-2 border-l">
                {category.options.map((option) => (
                  <label key={option} className="flex items-start gap-2 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCategoryOptions[category.id]?.selected.has(option) || false}
                      onChange={() => toggleOption(category.id, option)}
                      className="form-checkbox mt-1 h-4 w-4 text-black cursor-pointer flex-shrink-0"
                    />
                    {option}
                  </label>
                ))}
                <div className="mt-2">
                  <label className="block text-sm text-black dark:text-white">
                    <span className="block">Other {category.label}:</span>
                    <input 
                      type="text" 
                      value={selectedCategoryOptions[category.id]?.other || ""} 
                      onChange={(e) => handleCategoryOtherChange(category.id, e)}
                      className="mt-1 p-2 w-full border rounded-md focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="p-4">
          <label className="block font-medium text-black dark:text-white">
            Other Tools:
            <input 
              type="text" 
              value={otherTools} 
              onChange={handleOtherToolsChange} 
              className="mt-1 p-2 w-full border rounded-md focus:outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
