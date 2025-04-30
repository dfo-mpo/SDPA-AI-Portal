'use client';
import { useEffect, useState } from "react";
import Questions from "./Questions";
import InputField from "./InputField";
import TextArea from "./TextArea";
import SelectBox from "./SelectBox";
import MultiSelect from "./MultiSelect";
import MultiSelectText from "./MultiSelectText";
import RadioGroup from "./RadioGroup";
import SubmitButton from "./SubmitButton";
import ToolSelectionQuestion from "./ToolSelectionQuestion";
import TooltipWord from "./TooltipWord";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { trackEvent } from "../../utils/analytics";

export function SurveyForm() {

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

    const res = await fetch("/server/storeResponse", {
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
  // this is used to keep track of the questions we want to render for each section
  const sectionGroups = {
    operationalPriorities: ["average_time", "area_cost_savings", "long_term_vision"],
    projectDetails: ["project_name", "product_owner", "project_description", "objective"],
    dataDetails: ["tools_needed_for_work", "dataset_availability", "data_source", "dataset_annotation", "classification"],
    aiMlQuestions: ["problem_statement", "project_area", "status", "priority_level", "approach"],
    security: ["statement_of_sensitivity_exist"],
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
        <div className="text-center mb-6 px-8">
          <h1 className="text-4xl font-extrabold text-black dark:text-white mb-3">Essential Tools and Services for Data Analytics, AI, and ML Projects</h1>
          <div className="text-sm text-black dark:text-white">
            Data Analytics, Artificial Intelligence (AI), and Machine Learning (ML) projects require the right <TooltipWord word="tools and services" tooltip="Software platforms, infrastructure, or resources that support data-driven work like modeling, visualization, or storage." /> to support innovation and efficiency. This survey aims to gather insights on the essential tools and services needed for such projects, helping to identify gaps and improve access to the necessary resources.
          </div>
        </div>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
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
          {/* Operational Priorities */}
          <div className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle("operationalPriorities")} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              Operational Priorities
              {openSections.operationalPriorities ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections["operationalPriorities"] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {Questions.filter(q => sectionGroups.operationalPriorities.includes(q.name)).map(renderQuestion)}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle("projectDetails")} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              Project Details
              {openSections.projectDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections["projectDetails"] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {Questions.filter(q => sectionGroups.projectDetails.includes(q.name)).map(renderQuestion)}
              </div>
            )}
          </div>

          {/* Data Details */}
          <div className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle("dataDetails")} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              Data Details
              {openSections.dataDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections["dataDetails"] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {Questions.filter(q => sectionGroups.dataDetails.includes(q.name)).map(renderQuestion)}
              </div>
            )}
          </div>

          {/* AI/ML Questions */}
          <div className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle("aiMlQuestions")} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              Data Science, ML and AI questions
              {openSections.aiMlQuestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections["aiMlQuestions"] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {Questions.filter(q => sectionGroups.aiMlQuestions.includes(q.name)).map(renderQuestion)}
              </div>
            )}
          </div>

          {/* Security */}
          <div className="border rounded-2xl shadow-md overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => handleSectionToggle("security")} // this part checks if this section is open or not
              className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-left"
            >
              Security
              {openSections.security ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openSections["security"] && (
              <div className="p-4 space-y-6 bg-white dark:bg-black">
                {Questions.filter(q => sectionGroups.security.includes(q.name)).map(renderQuestion)}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <SubmitButton label="Submit Survey" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurveyForm;