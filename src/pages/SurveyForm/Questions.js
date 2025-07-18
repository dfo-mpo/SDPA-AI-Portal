import TooltipWord from "./TooltipWord";

/**
 * Survey Questions Configuration
 * ------------------------------
 * This file defines the structure and metadata for each survey question displayed in the SurveyForm.
 * Each object in the `Questions` array represents a question field rendered dynamically in the form.
 *
 * Field Properties:
 * - `name` (string): Unique key used for form value binding.
 * - `label` (string): The display name shown to the user.
 * - `type` (string): Defines the form input type. Supported values:
 *     - "text": Single-line text input.
 *     - "textarea": Multi-line text area input.
 *     - "radio": Single-choice selection (uses `options` array).
 *     - "multiselect": Multiple-choice selection. Supports optional entry.
 *     - "textmultiselect": Combination of text entry and multiselect (custom implementation).
 *     - "toolSelection": Special grouped multiselect input where options are grouped by categories.
 * - `description` (string | JSX): Tooltip or guidance shown under or beside the label.
 * - `options` (string[] | groupedOption[]): Required for types like "radio", "multiselect", and "toolSelection".
 * - `includeOtherOptions` (boolean): (multiselect only) If true, an additional input ("Other:") will be displayed.
 *
 * Special Type Behaviours:
 * - `toolSelection`: Structured as categories with sub-options:
 *     {
 *       id: "data_pipelines",
 *       label: "Data Pipelines/Platforms",
 *       options: ["Databricks", "Data Factory", ...]
 *     }
 * 
 * JSX descriptions (e.g., with <TooltipWord />) are supported and rendered accordingly.
 */

export const Questions = [
  {
    name: "contact_name",
    label: "Contact Name",
    type: "text"
  },
  {
    name: "contact_email",
    label: "Contact Email",
    type: "text"
  },
  {
    name: "contact_branch_sector",
    label: "Contact Branch/Sector",
    type: "text"
  },
  {
    name: "use_case_overview",
    label: "Project Description and Objective",
    type: "textarea",
    description: "Brief overview of potential program or service delivery, operations, or business process impacted being explored as a use case"
  },
  {
    name: "business_problem",
    label: "",
    type: "textarea",
    description: "What business problem or opportunity are you trying to address? (Tip: Focus on challenges that impact productivity, efficiency, or cost for operations or stakeholders.)"
  },
  {
    name: "who_is_affected",
    label: "",
    type: "textarea",
    description: "Who is affected by this problem? (Departments, teams, partners, stakeholders, public, etc.)"
  },
  { 
    name: "areas_of_impact_on_business", 
    label: "Areas of impact on business", 
    type: "multiselect", 
    options: ["Labour", "Time", "Automation of processes", "Resource usage"], 
    description: "Try to estimate how it would affect time, cost, revenue, customer satisfaction, etc.", 
    includeOtherOptions: true 
  },
  { 
    name: "priority_level", 
    label: "Priority Level", 
    type: "radio", 
    options: ["Low", "Medium", "High"], 
    description: "The level of urgency or importance assigned to the project." 
  },
  { 
    name: "tools_needed_for_work", 
    label: "Optional: What tools/services do you currently use to fulfil this project", 
    type: "toolSelection", 
    options: [
      {
        id: "data_pipelines",
        label: "Data Pipelines/Platforms",
        options: [
          "Databricks",
          "Data Factory",
          "Dataiku",
          "SageMaker",
          "MS Fabric"
        ]
      },
      {
        id: "bi_tools",
        label: "Mathematical Modelling and Business Intelligence Tools",
        options: [
          "PowerBI",
          "Tableau",
          "SPSS",
          "Matlab",
          "Salesforce"
        ]
      },
      {
        id: "ai_ml_libraries",
        label: "AI and ML Technical Stack (e.g. libraries, services, tools, platforms)",
        options: [
          "Computer Vision (open CV, CNN)",
          "GenAI (GPT, LLama, Bloom, Aya23)",
          "AzureML Studio",
          "Azure AI Services (OpenAI, Computer Vision, AI Search, Language service - Translator, Document Intelligence, Container Registry)",
          "Huggingface",
          "QuPath"
        ]
      },
      {
        id: "web_frontend",
        label: "Web Front-end",
        options: [
          "Static Web",
          "WebApps",
          "Figma",
          "Next.js",
          "React"
        ]
      },
      {
        id: "coding_tools",
        label: "Coding Tools",
        options: [
          "Sublime",
          "VSCode",
          "React Developer Tools",
          "PyCharm",
          "Jupyter notebook",
          "R Studio",
          "Anaconda"
        ]
      },
      {
        id: "storage_space",
        label: "Storage Space",
        options: [
          "SharePoint",
          "Data Lake",
          "External hard drives",
          "Oracle DB",
          "Azure Data Storage",
          "Postgres"
        ]
      },
      {
        id: "mockup_visualization",
        label: "Mockup and Visualization Tools",
        options: [
          "Figma",
          "Balsamiq Wireframe",
          "Miro",
          "Lucid",
          "Microsoft Visio"
        ]
      },
      {
        id: "code_repos",
        label: "Code Repos",
        options: [
          "Github",
          "DevOps"
        ]
      },
      {
        id: "spatial_tools",
        label: "Spatial Tools",
        options: [
          "Arc GIS Online"
        ]
      }
    ]
  },


  { 
    name: "is_dataset_available", 
    label: "Is the data available and ready to use?", 
    type: "radio", 
    options: ["Yes", "No"], 
    description: "Specifies whether the data required for the project is readily accessible."
  },
  {
    name: "available_data_info",
    label: "What kinds of information or data do you have or are currently used (if any)?",
    type: "textarea",
    description: "You don't need technical details—just describe what the data or information is."
  },
  { 
    name: "data_source", 
    label: "Data Source", 
    type: "multiselect", 
    options: ["SharePoint", "Local HD", "Oracle Database", "AWS", "Azure Storage"], 
    description: "Where the data used in the project is currently stored or accessed from.", 
    includeOtherOptions: true 
  },
  {
    name: "data_type",
    label: "Data Type",
    type: "multiselect",
    options: ["Spreadsheets", "CRMs", "Emails", "Customer Support Platforms", "Word documents", "PDFs", "Shape files"],
    description: "What are the stored data types? Are there existing tools, systems, or documents involved with this information or data?",
    includeOtherOptions: true 
  },
  { 
    name: "classification", 
    label: "Classification", 
    type: "radio", 
    options: ["Unclassified", "Protected A", "Protected B", "Protected C", "Secret", "Not yet determined"], 
    description: "Indicate governmental classification"
  },


  { 
    name: "project_area", 
    label: "Select the focus areas of your current or planned projects", 
    type: "multiselect", 
    options: ["A) Data Analytics", "B) Artificial Intelligence (AI)"] 
  },
  {
    name: "success_outcomes",
    label: "",
    type: "textarea",
    description: "If B) was selected, what outcome would success look like for addressing your business problem with AI? (Try to make this measurable: faster processes, better decisions, more sales, etc.)",
    required: false
  },
  { 
    name: "status", 
    label: "Status", 
    type: "radio", 
    options: ["Ideation/Planning", "Proof of Concept", "Pilot", "Production"], 
    description: "Indicates the current maturity or stage of the project." 
  },
  { 
    name: "is_dataset_annotation_needed", 
    label: "Is data annotation needed?", 
    type: "radio", 
    options: ["Yes", "No", "I don't know"], 
    description: "In most instances, we will require training in ML models and therefore we will require experts to label and annotate datasets. Does your team have the capacity to support or assist with data annotation?"
  },
  {
    name: "time_sensitive",
    label: "Is this project time-sensitive?",
    type: "radio",
    options: ["Yes", "No"],
    description: ""
  },
  {
    name: "time_sensitive_deadline",
    label: "",
    type: "calander",
    description: "If yes, is there a specific deadline?"
  },


  { 
    name: "statement_of_sensitivity_exist", 
    label: "Does a Statement of Sensitivity (SOS) exist?", 
    type: "radio", 
    options: ["Yes", "No"], 
    description: "Indicates whether the data used in this project has been formally assessed for sensitivity." 
  },
];

// this is used to keep track of the questions we want to render for each section
export const SectionGroups = {
  projectDetails: {
    label: "Project Details",
    questions: [
      "contact_name",
      "contact_email",
      "contact_branch_sector",
      "use_case_overview",
      "business_problem",
      "who_is_affected",
      "areas_of_impact_on_business",
      "priority_level",
      "tools_needed_for_work",
    ],
  },
  dataDetails: {
    label: "Data Details",
    questions: [
      "is_dataset_available", 
      "available_data_info",
      "data_source", 
      "data_type",
      "classification",
    ],
  },
  aiMlQuestions: {
    label: "Data Science, ML and AI",
    questions: [
      "project_area", 
      "success_outcomes",
      "status", 
      "is_dataset_annotation_needed",
      "time_sensitive",
      "time_sensitive_deadline",
      
    ],
  },
  security: {
    label: "Security",
    questions: [
      "statement_of_sensitivity_exist"
    ],
  },
};
