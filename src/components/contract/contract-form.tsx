import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { ContractFormData, TemplateType, PaymentType, ClientInfo, ProjectDetails, Deliverable, PaymentTerms } from "@/types";
import TemplateSelector from "./template-selector";
import SignaturePad from "./signature-pad";

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

interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData, isDraft?: boolean) => void;
  onPreview: () => void;
  showPreview: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function ContractForm({
  initialData,
  onSubmit,
  onPreview,
  showPreview,
  currentStep,
  setCurrentStep,
}: ContractFormProps) {
  const [signature, setSignature] = useState<string>("");
  
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
      intellectualProperty: "All intellectual property rights, including copyrights, patents, patent disclosures and inventions (whether patentable or not), trademarks, service marks, trade secrets, know-how and other confidential information, trade dress, trade names, logos, corporate names and domain names, together with all of the goodwill associated therewith, derivative works and all other rights in and to all documents, work product and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Provider in the course of performing the Services shall be owned by Customer. Provider hereby irrevocably assigns to Customer all right, title and interest in and to the Deliverables, including all Intellectual Property Rights therein.",
      confidentiality: "Each party acknowledges that it will have access to certain confidential information of the other party concerning the other party's business, plans, customers, technology, and products. Confidential Information will include all information in tangible or intangible form that is marked or designated as confidential or that, under the circumstances of its disclosure, should be considered confidential. Each party agrees that it will not use in any way, for its own account or the account of any third party, except as expressly permitted by this Agreement, nor disclose to any third party (except as required by law or to that party's attorneys, accountants and other advisors as reasonably necessary), any of the other party's Confidential Information and will take reasonable precautions to protect the confidentiality of such information.",
      termination: "Either party may terminate this Agreement at any time by giving the other party 30 days' prior written notice. In the event of termination, Customer shall pay for all services rendered by Provider up to the date of termination. Upon termination, Provider shall deliver to Customer all work product, whether complete or in progress.",
    },
  };
  
  // Set up form with initial data or defaults
  const form = useForm<ContractFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, ...initialData },
  });
  
  // Handle form submission
  const handleSubmit = (data: ContractFormData, isDraft = false) => {
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
  
  // Add a new deliverable
  const addDeliverable = () => {
    const deliverables = form.getValues("deliverables") || [];
    form.setValue("deliverables", [
      ...deliverables,
      { name: "", description: "", dueDate: "" },
    ]);
  };
  
  // Remove a deliverable
  const removeDeliverable = (index: number) => {
    const deliverables = form.getValues("deliverables") || [];
    if (deliverables.length <= 1) return; // Keep at least one
    
    const updated = deliverables.filter((_, i) => i !== index);
    form.setValue("deliverables", updated);
  };
  
  return (
    <div className="space-y-6">
      {/* Preview button */}
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <i className="ri-eye-line"></i>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>
      
      {/* Steps progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <div className="relative">
              {/* Progress bar background */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full bg-gray-200 rounded h-1"></div>
              </div>
              {/* Progress bar filled */}
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`h-1 bg-primary-600 rounded transition-all duration-300
                    ${currentStep === 1 ? 'w-1/4' : ''}
                    ${currentStep === 2 ? 'w-2/4' : ''}
                    ${currentStep === 3 ? 'w-3/4' : ''}
                    ${currentStep === 4 ? 'w-full' : ''}
                  `}
                ></div>
              </div>
              {/* Steps */}
              <div className="relative flex justify-between">
                <div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full 
                      ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    1
                  </button>
                  <span 
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium
                      ${currentStep === 1 ? 'text-primary-600' : 'text-gray-600'}
                    `}
                  >
                    Template
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => currentStep >= 2 && setCurrentStep(2)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full 
                      ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    2
                  </button>
                  <span 
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium
                      ${currentStep === 2 ? 'text-primary-600' : 'text-gray-600'}
                    `}
                  >
                    Client Info
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => currentStep >= 3 && setCurrentStep(3)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full 
                      ${currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    3
                  </button>
                  <span 
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium
                      ${currentStep === 3 ? 'text-primary-600' : 'text-gray-600'}
                    `}
                  >
                    Project Details
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => currentStep >= 4 && setCurrentStep(4)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full 
                      ${currentStep >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    4
                  </button>
                  <span 
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium
                      ${currentStep === 4 ? 'text-primary-600' : 'text-gray-600'}
                    `}
                  >
                    Terms & Signature
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleSubmit(data))}>
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Select a Contract Template</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="templateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TemplateSelector
                          selectedTemplate={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Client Information */}
          {currentStep === 2 && (
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Client Type */}
                  <div className="mb-4">
                    <FormLabel className="text-base">Client Type</FormLabel>
                    <RadioGroup defaultValue="new" className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <FormLabel htmlFor="new" className="font-normal">New Client</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <FormLabel htmlFor="existing" className="font-normal">Existing Client</FormLabel>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientInfo.companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="clientInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientInfo.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Project Details */}
          {currentStep === 3 && (
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectDetails.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectDetails.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description*</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectDetails.startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectDetails.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="projectDetails.scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Scope*</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectDetails.outOfScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Out of Scope (Optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Deliverables section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base">Deliverables</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        onClick={addDeliverable}
                        className="text-primary-600 hover:text-primary-700 h-auto p-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Deliverable
                      </Button>
                    </div>
                    
                    {form.watch("deliverables")?.map((_, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 mb-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Deliverable {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDeliverable(index)}
                            className="h-6 w-6 text-gray-400 hover:text-gray-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name*</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description*</FormLabel>
                                <FormControl>
                                  <Textarea rows={2} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.dueDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Payment Terms */}
                  <div>
                    <FormLabel className="text-base block mb-2">Payment Terms</FormLabel>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="paymentTerms.type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex flex-wrap gap-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={PaymentType.FIXED} id="fixed" />
                                  <FormLabel htmlFor="fixed" className="font-normal">Fixed Price</FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={PaymentType.HOURLY} id="hourly" />
                                  <FormLabel htmlFor="hourly" className="font-normal">Hourly Rate</FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={PaymentType.MILESTONE} id="milestone" />
                                  <FormLabel htmlFor="milestone" className="font-normal">Milestone Based</FormLabel>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="paymentTerms.amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="paymentTerms.currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency*</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="CAD">CAD</SelectItem>
                                  <SelectItem value="AUD">AUD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="paymentTerms.schedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Schedule</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={2}
                                placeholder="e.g. 50% upfront, 50% upon completion"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Terms & Signature */}
          {currentStep === 4 && (
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Terms & Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {/* Legal clauses */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Legal Clauses</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="legalClauses.intellectualProperty"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between mb-1">
                              <FormLabel>Intellectual Property</FormLabel>
                              <Button
                                type="button"
                                variant="link"
                                className="text-xs text-primary-600 hover:text-primary-700 h-auto p-0"
                              >
                                Edit
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea rows={3} className="text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="legalClauses.confidentiality"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between mb-1">
                              <FormLabel>Confidentiality</FormLabel>
                              <Button
                                type="button"
                                variant="link"
                                className="text-xs text-primary-600 hover:text-primary-700 h-auto p-0"
                              >
                                Edit
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea rows={3} className="text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="legalClauses.termination"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between mb-1">
                              <FormLabel>Termination</FormLabel>
                              <Button
                                type="button"
                                variant="link"
                                className="text-xs text-primary-600 hover:text-primary-700 h-auto p-0"
                              >
                                Edit
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea rows={3} className="text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="button"
                        variant="link"
                        className="text-primary-600 hover:text-primary-700 flex items-center h-auto p-0 mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Custom Clause
                      </Button>
                    </div>
                  </div>
                  
                  {/* Signature section */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Your Signature</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add your signature to this contract. You can draw your signature below or type it out.
                    </p>
                    
                    <SignaturePad onSignatureCapture={handleSignatureCapture} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Form navigation buttons */}
          <div className="flex justify-between space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 1)}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex-grow"></div>
            
            {currentStep < 4 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            )}
            
            {currentStep === 4 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit(form.getValues(), true)}
                >
                  Save as Draft
                </Button>
                <Button type="submit">Create Contract</Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
