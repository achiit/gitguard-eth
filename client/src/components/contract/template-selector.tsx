import { TemplateOption, TemplateType } from "@/types";

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onChange: (templateType: TemplateType) => void;
}

// Template options data
const templates: TemplateOption[] = [
  {
    id: TemplateType.SERVICE,
    title: "General Service Agreement",
    description: "A standard agreement for ongoing freelance services.",
    bestFor: "Ongoing work relationships, retainers, and service-based offerings"
  },
  {
    id: TemplateType.PROJECT,
    title: "Project-Based Contract",
    description: "A comprehensive agreement for fixed-scope projects.",
    bestFor: "One-time projects with clear deliverables and fixed pricing"
  },
  {
    id: TemplateType.NDA,
    title: "Non-Disclosure Agreement",
    description: "A legal document to protect confidential information.",
    bestFor: "Protecting sensitive information before starting project discussions"
  },
  {
    id: TemplateType.SOW,
    title: "Statement of Work",
    description: "A detailed document outlining work requirements and deliverables.",
    bestFor: "Complex projects requiring detailed specifications and milestones"
  }
];

export default function TemplateSelector({ 
  selectedTemplate, 
  onChange 
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div 
          key={template.id}
          className={`
            relative border rounded-lg p-4 transition-colors cursor-pointer
            ${selectedTemplate === template.id 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'}
          `}
          onClick={() => onChange(template.id)}
        >
          <input 
            type="radio" 
            id={`template-${template.id}`} 
            name="template" 
            checked={selectedTemplate === template.id}
            onChange={() => onChange(template.id)}
            className="absolute top-4 right-4 h-4 w-4 text-primary-600 focus:ring-primary-500" 
          />
          <label htmlFor={`template-${template.id}`} className="block cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">{template.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="text-xs text-gray-500 flex items-center">
              <i className="ri-file-list-3-line mr-1"></i>
              Best for: {template.bestFor}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
}
