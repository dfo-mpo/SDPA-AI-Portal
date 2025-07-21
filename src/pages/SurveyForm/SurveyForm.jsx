'use client';
import { useEffect, useState } from "react";
import { Questions, SectionGroups } from "./Questions";
import InputField from "./InputField";
import TextArea from "./TextArea";
import SelectBox from "./SelectBox";
import MultiSelect from "./MultiSelect";
import MultiSelectText from "./MultiSelectText";
import RadioGroup from "./RadioGroup";
import SubmitButton from "./SubmitButton";
import Calander from "./Calander";
import ToolSelectionQuestion from "./ToolSelectionQuestion";
import TooltipWord from "./TooltipWord";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { trackEvent } from "../../utils/analytics";
import { useComponentStyles } from '../../styles/hooks/useComponentStyles';

export function SurveyForm() {
  const surveyFormStyles = useComponentStyles('surveyForm');

  const initialAnswers = Questions.reduce((acc, question) => {
    acc[question.name] = "";
    return acc;
  }, {});

  const [answers, setAnswers] = useState(initialAnswers);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Represents whether there is a validation error in the tool selection question.
  // State updates when a selected category does not have selected option.
  // If true, tool selection is invalid and the form should not be submitted.
  const [toolValidationError, setToolValidationError] = useState(false);

  // Used to control when to displat error messages after a submit attempt
  const [submitted, setSubmitted] = useState(false);
  // Change openSection to track multiple sections
  const [openSections, setOpenSections] = useState({});

  const handleSectionToggle = (id) => {
    setOpenSections(prevState => ({
      ...prevState,
      [id]: !prevState[id]  // Toggle the state of the clicked section
    }));
  };

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (toolValidationError) {
      return;
    }

    const res = await fetch("/api/storeResponse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    
    console.log(answers);

    if (res.ok) {
      setPopupMessage("Survey response saved!");
      setAnswers(initialAnswers);
    } else {
      setPopupMessage("Failed to save response.");
    }

    setShowPopup(true);
    setSubmitted(false);
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    window.location.reload();
  };
  
  // this helper function is used to render each question type with their respective fields
  const renderQuestion = (question) => {
    switch (question.type) {
      case "text":
        return <InputField 
        name={question.name} 
        label={question.label} 
        description={question.description} 
        value={answers[question.name]} 
        onChange={handleChange} 
      />;
      case "textarea":
        return <TextArea 
        name={question.name} 
        label={question.label} 
        description={question.description} 
        value={answers[question.name]} 
        onChange={handleChange} 
        required={question.required}
      />;
      case "select":
        return <SelectBox 
        name={question.name} 
        label={question.label} 
        description={question.description} 
        value={answers[question.name]} 
        onChange={handleChange} 
        options={question.options}
      />;
      case "radio":
        return <RadioGroup 
        name={question.name} 
        label={question.label} 
        description={question.description} 
        value={answers[question.name]} 
        onChange={handleChange} 
        options={question.options}
      />;
      case "multiselect":
        return <MultiSelect 
        name={question.name} 
        label={question.label} 
        description={question.description} 
        value={answers[question.name]} 
        onChange={handleChange} 
        options={question.options}
        includeOtherOptions={question.includeOtherOptions}
      />;
      case "textmultiselect":
      return (
        <MultiSelectText
          name={question.name}
          label={question.label}
          description={question.description}
          value={answers[question.name]}
          onChange={handleChange}
        />
      );
      case "toolSelection":
        return <ToolSelectionQuestion 
        name={question.name} 
        label={question.label} 
        value={answers[question.name]} 
        onChange={handleChange} 
        options={question.options} 
        onValidationChange={setToolValidationError}
        submitted={submitted}
        setSubmitted={setSubmitted}
      />;
      case "calander":
        return <Calander
          name={question.name} 
          label={question.label} 
          description={question.description} 
          value={answers[question.name]} 
          onChange={handleChange} 
        />
      default:
        return null;
    }
  };

  // useEffect(() => {
  //   console.log("submit state:", submitted);
  // }, [submitted]);

  // useEffect(() => {
  //   console.log("tool validation error state:", toolValidationError);
  // }, [toolValidationError]);
  // this is added to keep track of light and dark mode
  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
  
    if (stored === 'dark' || (stored === 'system' && prefersDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-6 px-6">
          <h1 className="text-4xl font-extrabold text-black dark:text-white mb-3">Essential Tools and Services for Data Analytics, AI, and ML Projects</h1>
          <div className="text-sm text-black dark:text-white">
            This form is meant to be use as guide to support business users in articulating and imagining the potential of using Data, Artificial Intelligence, and Machine Learning to improve productivity, efficiencies, and generate value for program and service delivery, operations, and other business processes. It is meant to help users determine the value and potential of new data innovation from a value proposition, scalability, and sustainability lens rather than a technical implementation perspective. Complete responses will help regional management along with Data and AI Scientist determine how feasible a solution could be.
          </div>
        </div>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 rounded-lg text-center" style={surveyFormStyles.popUpMessage}>
              <p className="text-lg font-semibold mb-4">{popupMessage}</p>
              <button
                onClick={() => {
                  trackEvent('PSSI AI, ML and Data Analytics Use-Case', 'Click OK', 'Popup Confirm');
                  handlePopupConfirm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-xl w-full space-y-8 border border-gray-200 dark:bg-black">
          {Object.entries(SectionGroups).map(([key, section]) => (
            <div key={key} className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle(key)} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              {section.label}
              {openSections[key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections[key] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {/* {Questions.filter(q => section.questions.includes(q.name)).map(renderQuestion)} */}
                {section.questions
                  .map(question => Questions.find(q => q.name === question))
                  .filter(Boolean)
                  .map(renderQuestion)}
              </div>
            )}
          </div>
          ))}
          
          <div className="flex justify-center mt-6">
            <SubmitButton label="Submit Survey" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurveyForm;