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
  // { 
  //   name: "estimation_time_and_cost", 
  //   label: "Estimation: Time and Cost", 
  //   type: "textmultiselect", 
  //   description: "For the business process that will be supported by the AI solution, what is the current average time and cost (e.g., FTEs and annual budget) required for the process?" 
  // },
  { 
    name: "areas_of_impact_on_business", 
    label: "Areas of impact on business", 
    type: "multiselect", 
    options: ["Labour", "Time", "Automation of processes", "Resource usage"], 
    description: "Try to estimate how it would affect time, cost, revenue, customer satisfaction, etc.", 
    includeOtherOptions: true 
  },
  // { 
  //   name: "long_term_vision", 
  //   label: "Long Term Vision", 
  //   type: "textarea", 
  //   description: "What's your long-term vision for how to make your processes more efficient?" 
  // },
  // { 
  //   name: "project_name", 
  //   label: "Project Name", 
  //   type: "text" 
  // },
  // { 
  //   name: "product_owner", 
  //   label: "Product Owner", 
  //   type: "text" 
  // },
  // { 
  //   name: "project_description", 
  //   label: "Project Description and Objective", 
  //   type: "textarea", 
  //   description:"A brief overview of the project's purpose, objective, and intended outcome." 
  // },
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
    label: "Is the Dataset available and ready to use?", 
    type: "radio", 
    options: ["Yes", "No"], 
    description: "Specifies whether the dataset required for the project is readily accessible."
  },
  // { 
  //   name: "data_verified", 
  //   label: "Has the data been verified?", 
  //   type: "radio", 
  //   options: ["Yes", "No"], 
  //   description: ""
  // },
  { 
    name: "data_source", 
    label: "Data Source", 
    type: "multiselect", 
    options: ["SharePoint", "Local HD", "Oracle Database", "AWS", "Azure Storage"], 
    description: "Where the data used in the project is currently stored or accessed from.", 
    includeOtherOptions: true 
  },
  { 
    name: "is_dataset_annotation_needed", 
    label: "Is data annotation needed?", 
    type: "radio", 
    options: ["Yes", "No", "I don't know"], 
    description: "In most instances, we will require training in ML models and therefore we will require experts to label and annotate datasets. Does your team have the capacity to support data procurement?"
  },
  { 
    name: "classification", 
    label: "Classification", 
    type: "radio", 
    options: ["Unclassified", "Protected A", "Protected B", "Protected C", "Secret"], 
    description: (
      <>
        The <TooltipWord word="security or sensitivity level" tooltip="Indicates how confidential or restricted the data is, based on organizational or governmental classification."/> of the data being used in the project.
      </>
    )
  },
  // { 
  //   name: "problem_statement", 
  //   label: "Problem Statement", 
  //   type: "textarea", 
  //   description: "Describe how data analytics, artificial intelligence, or machine learning will contribute to addressing the problem or achieving the objective." 
  // },
  { 
    name: "project_area", 
    label: "Select the focus areas of your current or planned projects", 
    type: "multiselect", 
    options: ["Data Analytics", "Artificial Intelligence (AI)", "Machine Learning (ML)"] 
  },
  { 
    name: "status", 
    label: "Status", 
    type: "radio", 
    options: ["Pre-PoC", "Proof of Concept", "Pilot", "Production"], 
    description: "Indicates the current maturity or stage of the project." 
  },
  { 
    name: "priority_level", 
    label: "Priority Level", 
    type: "radio", 
    options: ["Low", "Medium", "High"], 
    description: "The level of urgency or importance assigned to the project." 
  },
  { 
    name: "statement_of_sensitivity_exist", 
    label: "Does a Statement of Sensitivity (SOS) exist?", 
    type: "multiselect", 
    options: ["Yes"], 
    description: "Indicates whether the data used in this project has been formally assessed for sensitivity." 
  },

  // Understanding the Business Context
  {
    name: "user_name",
    label: "Name",
    type: "text"
  },
  {
    name: "user_email",
    label: "Email",
    type: "text"
  },
  {
    name: "user_branch_sector",
    label: "Branch/Sector",
    type: "text"
  },
  {
    name: "use_case_overview",
    label: "Project Description and Objective",
    type: "textarea",
    description: "Brief overview of potential program or service delivery, operations, or business process impacted being explored as a use case"
  },
  
  // Understanding the Business Context
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
    name: "consequences_of_inaction",
    label: "",
    type: "textarea",
    description: "What are the consequences of not addressing this problem? (Consider expenses, missed opportunities, increased risk, etc.)"
  },

  // Expected Goals & Outcomes
  {
    name: "success_outcomes",
    label: "",
    type: "textarea",
    description: "What outcome would success look like for addressing your business problem? (Try to make this measurable: faster processes, better decisions, more sales, etc.)"
  },
  {
    name: "ai_ml_contribution",
    label: "",
    type: "textarea",
    description: "How do you think data, artificial intelligence, and/or machine learning could improve the current way of working? (Think in terms of efficiency, productivity, accuracy, personalization, automation, etc.)"
  },

  // Inputs & Resources
  {
    name: "available_data_info",
    label: "What kinds of information or data do you have or are currently used (if any)?",
    type: "textarea",
    description: "You don't need technical details—just describe what the data or information is and where it comes from."
  },
  {
    name: "data_format",
    label: "Data Format",
    type: "textarea",
    description: (
      <>
      <b>Are there existing tools, systems, or documents involved with this information or data?</b> (E.g., spreadsheets, CRMs, emails, customer support platforms.)
      </>
    )
  },
  // {
  //   name: "data_quality_scope",
  //   label: "How much high-quality and verifiable data and/or information can be accessed or provided?",
  //   type: "textarea"
  // },

  // AI Potential (Guided Imagination)
  {
    name: "expected_goals",
    label: "Expected Goals & Outcomes",
    type: "textarea",
    description: (
      <>
        <b>If AI could help with this problem, what would you imagine it doing?</b> 
        <br/>E.g., automatically flagging issues, summarizing feedback, answering questions, etc.
      </>
    )
  },
  // {
  //   name: "ai_interaction_with_people",
  //   label: "Would the solution need to interact with people? If yes, how?",
  //   type: "textarea",
  //   description: "Chatbots, suggestions to users, automated emails, etc."
  // },

  // Value & Feasibility
  // {
  //   name: "business_impact_if_successful",
  //   label: "If successful, what would be the impact on the business?",
  //   type: "textarea",
  //   description: "Try to estimate how it would affect time, cost, revenue, customer satisfaction, etc."
  // },
  // {
  //   name: "scalability",
  //   label: "Is this problem something others also experience?",
  //   type: "radio",
  //   options: ["Yes", "No", "I don't know"],
  //   description: "Helps identify scalable or repeatable use cases."
  // },
  {
    name: "time_sensitive",
    label: "Is this project time-sensitive?",
    type: "radio",
    options: ["Yes", "No"],
    description: ""
  },
  {
    name: "what_related_to_time_sensitive",
    label: "",
    type: "calander",
    description: "If yes, is there a specific deadline?"
  }
];

// this is used to keep track of the questions we want to render for each section
export const SectionGroups = {
  projectDetails: {
    label: "Project Details",
    questions: [
      "user_name",
      "user_email",
      "user_branch_sector",
      "use_case_overview",
      "business_problem",
      "who_is_affected",
      "consequences_of_inaction",
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
      "data_format",
      "classification",
    ],
  },
  aiMlQuestions: {
    label: "Data Science, ML and AI questions",
    questions: [
      "expected_goals",
      "ai_ml_contribution", 
      "success_outcomes",
      "project_area", 
      "status", 
      "is_dataset_annotation_needed",
      "areas_of_impact_on_business",
      "time_sensitive",
      "what_related_to_time_sensitive",
      
    ],
  },
  security: {
    label: "Security",
    questions: [
      "statement_of_sensitivity_exist"
    ],
  },
};
