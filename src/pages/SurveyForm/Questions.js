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
 *       - "maxlength": The number of character limit. Value must be a number.
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
    name: "project_title",
    label: "Project Title",
    type: "text",
    maxlength: "20",
    description: "Enter a short, cleat name that describes this use case."
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
    description: "Who would benefit from or be affected by this solution (e.g., internal teams, scientists, Indigenous communities, officers, Canadians)?"
  },
  { 
    name: "areas_of_impact_on_business", 
    label: "Areas of impact on business", 
    type: "multiselect", 
    options: ["Labour", "Time", "Automation of processes", "Resource usage"], 
    description: "Try to estimate how it would affect time, cost, revenue, customer satisfaction, etc.", 
    includeOtherOptions: true 
  },
  // { 
  //   name: "priority_level", 
  //   label: "Priority Level", 
  //   type: "radio", 
  //   options: ["Low", "Medium", "High"], 
  //   description: "The level of urgency or importance assigned to the project." 
  // },
  
  // TBS Questions
  {
    name: "tbs_service_inventory_id",
    label: "TBS Service Inventory ID",
    type: "text",
    description: "Identifies the unique number assigned to a service in the GC Service Inventory. Leave blank if not applicable"
  },
  {
    name: "tbs_government_organization",
    label: "TBS Government Organization (Fisheries and Oceans Canada)",
    type: "text",
    description: "Identifies the department or agency responsible for the AI system"
  },
  {
    name: "tbs_ai_system_primary_users",
    label: "TBS AI system primary users",
    type: "text",
    description: "Identifies whether the primary users of the AI system are GC employees, members of the public, both, or neither "
  },
  {
    name: "tbs_developed_by",
    label: "TBS Developed By",
    type: "text",
    description: "Identifies the developer of the system. If more than one option applies but parts of system were procured, please choose \"vendor\" and state vendor name in column H. Choose \"other\" for systems involving non-vendor external developers (e.g.,academia, civil society) "
  },
  {
    name: "tbs_vendor_name",
    label: "TBS Vendor name",
    type: "text",
    description: "Provides the name of the vendor from whom the AI system was procured. If no vendor, state \"Not applicable\" "
  },
  {
    name: "tbs_status_date",
    label: "TBS status date",
    type: "text",
    description: "Identifies the calendar year the AI system entered this status: e.g., if pilot began in 2021, or system was retired in 2019 "
  },
  {
    name: "tbs_ai_system_capabilities",
    label: "TBS AI system capabilities",
    type: "text",
    description: "Identifies the capabilities of the AI system. Max 300 characters "
  },
  {
    name: "tbs_automated_decision_system",
    label: "TBS Automated decision system",
    type: "text",
    description: "Identifies whether the AI system makes administrative decisions or related assessments about clients. For information on definition of an automated decision system, please see Directive on Automated Decision Making "
  },
  {
    name: "tbs_algorithmic_impact_assessment",
    label: "TBS Algorithmic impact assessment",
    type: "text",
    description: "Provides the unique number assigned to completed Algorithmic Impact Assessments (AIA) on the Open Government Portal. If this does not apply, state \"Not applicable.\" "
  },
  {
    name: "tbs_data_sources",
    label: "TBS data sources",
    type: "text",
    description: "Describes the sources of the data used to train and as inputs for the AI system. Give names of datasets if available, or describe type and source of data used. "
  },
  {
    name: "tbs_involves_personal_information",
    label: "TBS involves personal information",
    type: "text",
    description: "Identifies whether the AI system uses or creates personal information",
  },
  {
    name: "tbs_personal_information_banks",
    label: "TBS personal information banks",
    type: "text",
    description: "Identifies the Personal Information Banks associated with the activity. If no PIB exists, please state \"Not applicable\" "
  },
  {
    name: "tbs_notification_of_ai",
    label: "TBS Notification of AI",
    type: "text",
    description: "Identifies whether users are notified that they are interacting with an AI system "
  },
  {
    name: "tbs_access_to_information_request",
    label: "TBS Access to information request",
    type: "text",
    description: "Identifies any access to information request number relating to the AI system "
  },
  {
    name: "tbs_system_results",
    label: "TBS system results",
    type: "text",
    description: "Describes the expected or actual results of the implementation of the AI system. Max 500 characters including spaces "
  },

  { 
    name: "strategic_alignment", 
    label: "Strategic Alignment to DFO", 
    type: "subtitle", 
    description: "Select all that apply:" 
  },
  { 
    name: "fisheries_and_aquaculture", 
    label: "Fisheries and Aquaculture", 
    type: "multiselect", 
    options: ["Sustainable management of Canadian fisheries", "Sustainable aquaculture", "Safe access to harbours", "Protection from unlawful exploitation", "Improved scientific advice for fisheries", "Indigenous outcomes in fisheries/aquaculture"], 
  },
  { 
    name: "aquatic_ecosystems", 
    label: "Aquatic Ecosystems", 
    type: "multiselect", 
    options: ["Protection of oceans and ecosystems", "Science for ecosystem decision-making", "Indigenous outcomes in ecosystem protection"], 
  },
  { 
    name: "justification_for_strategic_alignment", 
    label: "Justification for Strategic Alignment:", 
    type: "textarea", 
    description: "Explain why this use case supports the selected DFO priorities:" 
  },
  { 
    name: "feasibility", 
    label: "Feasibility", 
    type: "multiselect", 
    options: ["Data is available and usable", "Required AI methods are technically mature", "Internal or external expertise can support this", "Budget or funding is feasible", "Tools, infrastructure, or platforms are accessible", "Legal or policy issues are manageable", "Stakeholder or partner support is realistic", "Implementation can begin within 6-12 months"],
    description: "Check all that apply to reflect readiness and ease of implementation:" 
  },
  { 
    name: "justification_for_feasibility", 
    label: "Justification for Feasibility:", 
    type: "textarea", 
    description: "Explain the key enablers or challenges for implementation:" 
  },
  { 
    name: "tools_needed_for_work", 
    label: "What tools/services do you currently use to fulfil this project", 
    type: "toolSelection", 
    options: [
      {
        id: "None",
        label: "None - still in ideation/planning",
        boldTitle: true,
        includeOtherOptions: false
      },
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


  // { 
  //   name: "project_area", 
  //   label: "Select the focus areas of your current or planned projects", 
  //   type: "multiselect", 
  //   options: ["Data Analytics", "Artificial Intelligence (AI)"] 
  // },
  {
    name: "success_outcomes",
    label: "",
    type: "textarea",
    description: "If AI was selected, what outcome would success look like for addressing your business problem with AI? (Try to make this measurable: faster processes, better decisions, more sales, etc.)",
    required: false
  },
  // {
  //   name: "ai_capability_used",
  //   label: "AI Capability Used",
  //   type: "multiselect",
  //   options: ["Estimate (e.g., effort, time, cost)", "Forecast (e.g., trends, ocean conditions)", "Compare (e.g., rank or score options)", "Detect (e.g., patterns, anomalies)", "Identify (e.g., classify images or signals)", "Discover (e.g., find new patterns or clusters)", "Generate (e.g., summaries, recommendations)", "Act (e.g., automate responses or control systems)"],
  //   description: "Select the main type of AI functionality this idea applies:",
  //   includeOtherOptions: true 
  // },
  { 
    name: "phase", 
    label: "Phase", 
    type: "radio", 
    options: ["Ideation/Planning", "Proof of Concept", "Pilot / Proof of Value (i.e., field test)", "Production"], 
    description: "Indicates the current maturity or stage of the project." 
  },
  { 
    name: "status", 
    label: "Status", 
    type: "radio", 
    options: ["To-do", "In Progress", "Delivered", "Pause", "Blocked", "Closed "], 
    description: "" 
  },
  { 
    name: "data_annotation_support", 
    label: "Data Annotation Support", 
    type: "radio", 
    options: ["Yes", "No", "I don't know"], 
    description: "In most instances, we will require training in ML models and therefore we will require experts to label and annotate datasets. Does your team have the capacity to support with data annotation?"
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
    label: "Does a Statement of Sensitivity (SoS) exist?", 
    type: "radio", 
    options: ["Yes", "No"], 
    description: "Indicates whether the data used in this project has been formally assessed for sensitivity." 
  },

  // {
  //   name: "risks_area",
  //   label: "",
  //   type: "multiselect",
  //   options: ["Privacy or data protection", "Fairness or bias", "Transparency or explainability", "Indigenous data sovereignty", "Environmental impact", "Legal or regulatory ris"],
  //   description: "Select all applicable areas of concern",
  //   includeOtherOptions: true
  // },
  {
    name: "risks_level",
    label: "Justification for Risk Level",
    type: "textarea",
    description: "Describe any potential risks",
    required: false
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
      "project_title",
      "use_case_overview",
      "business_problem",
      "who_is_affected",
      "areas_of_impact_on_business",
      // "priority_level",
      "tbs_service_inventory_id",
      "tbs_government_organization",
      "tbs_ai_system_primary_users",
      "tbs_developed_by",
      "tbs_vendor_name",
      "tbs_status_date",
      "tbs_ai_system_capabilities",
      "tbs_automated_decision_system",
      "tbs_algorithmic_impact_assessment",
      "tbs_data_sources",
      "tbs_involves_personal_information",
      "tbs_personal_information_banks",
      "tbs_notification_of_ai",
      "tbs_access_to_information_request",
      "tbs_system_results",
      
      "strategic_alignment",
      "fisheries_and_aquaculture",
      "aquatic_ecosystems",
      "justification_for_strategic_alignment",
      "feasibility",
      "justification_for_feasibility",
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
      // "project_area", 
      "success_outcomes",
      // "ai_capability_used",
      "phase", 
      "status", 
      "data_annotation_support",
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
  risks: {
    label: "Risks",
    questions: [
      // "risks_area",
      "risks_level"
    ],
  },
};
