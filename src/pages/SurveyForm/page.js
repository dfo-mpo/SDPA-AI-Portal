import SurveyForm from "@/components/SurveyForm";
import TooltipWord from "@/components/TooltipWord";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 p-10">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-6 px-8">
          <h1 className="text-4xl font-extrabold text-black mb-3">Essential Tools and Services for Data Analytics, AI, and ML Projects</h1>
          <div className="text-sm text-black">Data Analytics, Artificial Intelligence (AI), and Machine Learning (ML) projects require the right <TooltipWord word="tools and services" tooltip="Software platforms, infrastructure, or resources that support data-driven work like modeling, visualization, or storage."/> to support innovation and efficiency. This survey aims to gather insights on the essential tools and services needed for such projects, helping to identify gaps and improve access to the necessary resources.
          </div>
        </div>
        <SurveyForm />
      </div>
    </div>
  );
}