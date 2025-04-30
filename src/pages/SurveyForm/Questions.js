import TooltipWord from "./TooltipWord";

const Questions = [
    { 
      name: "average_time", 
      label: "Time and Cost", 
      type: "textmultiselect", 
      description: "For the business process that will be supported by the AI solution, what is the current average time and cost (e.g., FTEs and annual budget) required for the process?" 
    },
    { 
      name: "area_cost_savings", 
      label: "Area of Cost Savings", 
      type: "multiselect", 
      options: ["Labour", "Time", "Automation of processes", "Resource usage"], 
      description: "What areas can AI/ML help reduce costs?", 
      includeOtherOptions: true 
    },
    { 
      name: "long_term_vision", 
      label: "Long Term Vision", 
      type: "textarea", 
      description: "What's your long-term vision for how to make your processes more efficient?" 
    },
    { 
      name: "project_name", 
      label: "Project Name", 
      type: "text" 
    },
    { 
      name: "product_owner", 
      label: "Product Owner", 
      type: "text" 
    },
    { 
      name: "project_description", 
      label: "Project Description", 
      type: "textarea", 
      description:"A brief overview of the project's purpose, scope, and intended outcome." 
    },
    { 
      name: "objective", 
      label: "Objective", 
      type: "textarea", 
      description: "What the project aims to achieve or solve." 
    },
    { 
      name: "tools_needed_for_work", 
      label: "What tools/services do you currently use to fulfil this project", 
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
      name: "dataset_availability", 
      label: "Is the Dataset available and ready to use?", 
      type: "radio", 
      options: ["Yes", "No"], 
      description: "Specifies whether the dataset required for the project is already accessible and in usable condition."
    },
    { 
      name: "data_verified", 
      label: "Has the data been verified?", 
      type: "radio", 
      options: ["Yes", "No"], 
      description: ""
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
      name: "dataset_annotation", 
      label: "Is data annotation is needed?", 
      type: "radio", 
      options: ["Yes", "No", "I don't know"], 
      description: "Does your team have capacity to support data procurement?"
    },
    { 
      name: "classification", 
      label: "Classification", 
      type: "radio", 
      options: ["Unclassified", "Protected A", "Protected B", "Protected C", "Classified"], 
      description: (
        <>
          The <TooltipWord word="security or sensitivity level" tooltip="Indicates how confidential or restricted the data is, based on organizational or governmental classification."/> of the data being used in the project.
        </>
      )
    },
    { 
      name: "problem_statement", 
      label: "Problem Statement", 
      type: "textarea", 
      description: "Explains the current issues that need to be addressed and can be resolved through data analytics, A.I or M.L." 
    },
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
    // { 
    //   name: "approach", 
    //   label: "Approach - How Data Analytics, A.I, M.L can help", 
    //   type: "textarea", 
    //   description: "Describe how data analytics, artificial intelligence, or machine learning will contribute to addressing the problem or achieving the objective." 
    // },
    { 
      name: "statement_of_sensitivity_exist", 
      label: "Does a Statement of Sensitivity (SOS) exist?", 
      type: "multiselect", 
      options: ["Yes"], 
      description: "Indicates whether the data used in this project has been formally assessed for sensitivity." 
    }
  ];

  export default Questions;