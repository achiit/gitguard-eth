import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Stepper, MobileStepper, type Step } from "@/components/ui/stepper";
import { ButtonLoader } from "@/components/ui/loader";
import { 
  FileText, 
  Users, 
  Briefcase, 
  PenTool, 
  ChevronLeft, 
  ChevronRight,
  Save,
  Send,
  Eye,
  EyeOff
} from "lucide-react";
import { ContractFormData, TemplateType, PaymentType } from "@/types";
import TemplateSelector from "./template-selector";
import ClientInfoStep from "./steps/client-info-step";
import ProjectDetailsStep from "./steps/project-details-step";
import TermsSignatureStep from "./steps/terms-signature-step";

// Form validation schema
const formSchema = z.object({
  templateType: z.nativeEnum(TemplateType),
  clientInfo: z.object({
    name: z.string().min(1, { message: "Client name is required" }),
    companyName: z.string().min(1, { message: "Company name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  projectDetails: z.object({
    title: z.string().min(1, { message: "Project title is required" }),
    description: z.string().min(1, { message: "Project description is required" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    scope: z.string().min(1, { message: "Project scope is required" }),
    outOfScope: z.string().optional(),
  }),
  deliverables: z.array(
    z.object({
      name: z.string().min(1, { message: "Deliverable name is required" }),
      description: z.string().min(1, { message: "Deliverable description is required" }),
      dueDate: z.string().optional(),
    })
  ).min(1, { message: "At least one deliverable is required" }),
  paymentTerms: z.object({
    type: z.nativeEnum(PaymentType),
    amount: z.number().min(1, { message: "Amount is required" }),
    currency: z.string().min(1, { message: "Currency is required" }),
    schedule: z.string().optional(),
    deposit: z.number().optional(),
  }),
  legalClauses: z.record(z.string()),
});

interface ContractStepperFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData, isDraft?: boolean) => void;
  onPreview: () => void;
  showPreview: boolean;
  isSubmitting?: boolean;
}

const steps: Step[] = [
  {
    id: "template",
    title: "Template",
    description: "Choose contract type",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "client",
    title: "Client Info",
    description: "Client details",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "project",
    title: "Project Details",
    description: "Scope & deliverables",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "terms",
    title: "Terms & Signature",
    description: "Legal terms & sign",
    icon: <PenTool className="w-5 h-5" />,
  },
];

export default function ContractStepperForm({
  initialData,
  onSubmit,
  onPreview,
  showPreview,
  isSubmitting = false,
}: ContractStepperFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [signature, setSignature] = useState<string>("");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Default values
  const defaultValues: Partial<ContractFormData> = {
    templateType: TemplateType.SERVICE,
    clientInfo: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
    },
    projectDetails: {
      title: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      scope: "",
      outOfScope: "",
    },
    deliverables: [
      {
        name: "",
        description: "",
        dueDate: "",
      },
    ],
    paymentTerms: {
      type: PaymentType.FIXED,
      amount: 0,
      currency: "USD",
      schedule: "",
    },
    legalClauses: {
      intellectualProperty: "All intellectual property rights, including copyrights, patents, patent disclosures and inventions (whether patentable or not), trademarks, service marks, trade secrets, know-how and other confidential information, trade dress, trade names, logos, corporate names and domain names, together with all of the goodwill associated therewith, derivative works and all other rights in and to all documents, work product and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Provider in the course of performing the Services shall be owned by Customer.",
      confidentiality: "Each party acknowledges that it will have access to certain confidential information of the other party concerning the other party's business, plans, customers, technology, and products. Confidential Information will include all information in tangible or intangible form that is marked or designated as confidential or that, under the circumstances of its disclosure, should be considered confidential.",
      termination: "Either party may terminate this Agreement at any time by giving the other party 30 days' prior written notice. In the event of termination, Customer shall pay for all services rendered by Provider up to the date of termination.",
    },
  };

  // Set up form with initial data or defaults
  const form = useForm<ContractFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, ...initialData },
    mode: "onChange",
  });

  const { formState: { errors, isValid } } = form;

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues();
    
    try {
      switch (currentStep) {
        case 0: // Template
          await z.object({ templateType: z.nativeEnum(TemplateType) }).parseAsync({
            templateType: values.templateType,
          });
          return true;
        case 1: // Client Info
          await z.object({
            clientInfo: z.object({
              name: z.string().min(1),
              companyName: z.string().min(1),
              email: z.string().email(),
              phone: z.string().optional(),
              address: z.string().optional(),
            }),
          }).parseAsync({ clientInfo: values.clientInfo });
          return true;
        case 2: // Project Details
          await z.object({
            projectDetails: z.object({
              title: z.string().min(1),
              description: z.string().min(1),
              startDate: z.string().min(1),
              endDate: z.string().min(1),
              scope: z.string().min(1),
              outOfScope: z.string().optional(),
            }),
            deliverables: z.array(
              z.object({
                name: z.string().min(1),
                description: z.string().min(1),
                dueDate: z.string().optional(),
              })
            ).min(1),
            paymentTerms: z.object({
              type: z.nativeEnum(PaymentType),
              amount: z.number().min(1),
              currency: z.string().min(1),
              schedule: z.string().optional(),
              deposit: z.number().optional(),
            }),
          }).parseAsync({
            projectDetails: values.projectDetails,
            deliverables: values.deliverables,
            paymentTerms: values.paymentTerms,
          });
          return true;
        case 3: // Terms & Signature
          return true; // This step is always valid
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Handle next step
  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Trigger form validation to show errors
      await form.trigger();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle step click
  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      await handleNext();
    }
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    const isValid = await form.trigger();
    if (!isValid && !isDraft) return;

    const data = form.getValues();
    
    // Add signature if available
    if (signature) {
      data.signatures = {
        freelancer: {
          signature,
          date: new Date().toISOString(),
        },
      };
    }
    
    onSubmit(data, isDraft);
  };

  // Handle signature capture
  const handleSignatureCapture = (signatureData: string) => {
    setSignature(signatureData);
  };

  // Check if we can proceed to next step
  const canProceed = async () => {
    return await validateCurrentStep();
  };

  return (
    <div className="space-y-8">
      {/* Header with preview toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Contract</h1>
          <p className="text-muted-foreground mt-1">
            Complete all steps to create your professional contract
          </p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          allowClickableSteps={true}
          className="mb-8"
        />
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          variant="progress"
          className="mb-6"
        />
      </div>

      {/* Step Content */}
      <Form {...form}>
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Template Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <TemplateSelector
                  selectedTemplate={form.watch("templateType")}
                  onChange={(template) => form.setValue("templateType", template)}
                />
              </div>
            )}

            {/* Step 2: Client Information */}
            {currentStep === 1 && (
              <ClientInfoStep />
            )}

            {/* Step 3: Project Details */}
            {currentStep === 2 && (
              <ProjectDetailsStep />
            )}

            {/* Step 4: Terms & Signature */}
            {currentStep === 3 && (
              <TermsSignatureStep 
                onSignatureCapture={handleSignatureCapture}
                signature={signature}
              />
            )}
          </CardContent>
        </Card>
      </Form>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {/* Save as Draft */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <ButtonLoader variant="default" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </Button>

          {/* Next/Submit */}
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
              variant="success"
            >
              {isSubmitting ? (
                <ButtonLoader variant="white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Create & Send Contract
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileStepper
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onBack={handlePrevious}
          variant="dots"
        />
      </div>
    </div>
  );
}