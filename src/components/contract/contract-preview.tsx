import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Contract, ContractFormData, User, TemplateType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

interface ContractPreviewProps {
  contract?: Contract | null;
  formData?: ContractFormData | null;
  userProfile?: User | null;
  readOnly?: boolean;
}

export default function ContractPreview({
  contract,
  formData,
  userProfile,
  readOnly = false,
}: ContractPreviewProps) {
  const [data, setData] = useState<any>(null);
  const methods = useForm();
  
  // Determine which data to use for preview
  useEffect(() => {
    if (contract) {
      setData(contract);
    } else if (formData) {
      setData(formData);
    } else {
      // Try to get data from the form
      const currentFormData = methods.getValues();
      if (currentFormData && Object.keys(currentFormData).length > 0) {
        setData(currentFormData);
      }
    }
  }, [contract, formData, methods]);

  // Generate PDF (placeholder function)
  const handleDownloadPDF = () => {
    alert("PDF generation would happen here in the real application");
  };

  if (!data && !userProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-10 text-gray-500">
            No preview available yet. Please fill in the contract details.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTemplateTitle = (templateType?: string) => {
    switch (templateType) {
      case TemplateType.SERVICE:
        return "GENERAL SERVICE AGREEMENT";
      case TemplateType.PROJECT:
        return "PROJECT-BASED CONTRACT";
      case TemplateType.NDA:
        return "NON-DISCLOSURE AGREEMENT";
      case TemplateType.SOW:
        return "STATEMENT OF WORK";
      default:
        return "CONTRACT";
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Contract Preview</h3>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100vh-220px)]">
          <div className="bg-white p-8 shadow-sm mx-auto max-w-3xl">
            {/* Contract Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {getTemplateTitle(data?.templateType)}
              </h2>
            </div>

            {/* Contract Introduction */}
            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-800">
                This {getTemplateTitle(data?.templateType)} (the "Agreement") is entered into as of {data?.projectDetails?.startDate ? formatDate(data.projectDetails.startDate) : "[Start Date]"} (the "Effective Date") by and between:
              </p>
              <p className="mb-4 text-sm text-gray-800">
                <span className="font-semibold">Service Provider:</span> {userProfile?.organizationName || "[Your Name]"}, having its principal place of business at {userProfile?.address || "[Your Address]"} ("Provider")
              </p>
              <p className="mb-2 text-sm text-gray-800">
                <span className="font-semibold">Client:</span> {data?.clientInfo?.name || "[Client Name]"}, having its principal place of business at {data?.clientInfo?.address || "[Client Address]"} ("Customer")
              </p>
            </div>

            {/* Services Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">1. SERVICES</h3>
              <p className="text-sm text-gray-800 mb-2">Provider will provide Customer with the following services (the "Services"):</p>
              <p className="text-sm text-gray-800">{data?.projectDetails?.description || "[Project Description]"}</p>
            </div>

            {/* Payment Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">2. PAYMENT</h3>
              <p className="text-sm text-gray-800 mb-2">
                As compensation for the Services, Customer will pay Provider {data?.paymentTerms?.amount || "[Amount]"} {data?.paymentTerms?.currency || "[Currency]"}
                {data?.paymentTerms?.type === 'hourly' ? ' per hour' : ''}
                {data?.paymentTerms?.type === 'milestone' ? ' based on milestones' : ''}.
              </p>
              <p className="text-sm text-gray-800">Payment terms: {data?.paymentTerms?.schedule || "[Payment Schedule]"}</p>
            </div>

            {/* Term Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">3. TERM</h3>
              <p className="text-sm text-gray-800">
                This Agreement will begin on {data?.projectDetails?.startDate ? formatDate(data.projectDetails.startDate) : "[Start Date]"} and continue until {data?.projectDetails?.endDate ? formatDate(data.projectDetails.endDate) : "[End Date]"}, unless terminated earlier as provided in this Agreement.
              </p>
            </div>

            {/* Intellectual Property Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">4. INTELLECTUAL PROPERTY</h3>
              <p className="text-sm text-gray-800">
                {data?.legalClauses?.intellectualProperty || "All intellectual property rights, including copyrights, patents, patent disclosures and inventions (whether patentable or not), trademarks, service marks, trade secrets, know-how and other confidential information, trade dress, trade names, logos, corporate names and domain names, together with all of the goodwill associated therewith, derivative works and all other rights in and to all documents, work product and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Provider in the course of performing the Services shall be owned by Customer. Provider hereby irrevocably assigns to Customer all right, title and interest in and to the Deliverables, including all Intellectual Property Rights therein."}
              </p>
            </div>

            {/* Confidentiality Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">5. CONFIDENTIALITY</h3>
              <p className="text-sm text-gray-800">
                {data?.legalClauses?.confidentiality || "Each party acknowledges that it will have access to certain confidential information of the other party concerning the other party's business, plans, customers, technology, and products. Confidential Information will include all information in tangible or intangible form that is marked or designated as confidential or that, under the circumstances of its disclosure, should be considered confidential. Each party agrees that it will not use in any way, for its own account or the account of any third party, except as expressly permitted by this Agreement, nor disclose to any third party (except as required by law or to that party's attorneys, accountants and other advisors as reasonably necessary), any of the other party's Confidential Information and will take reasonable precautions to protect the confidentiality of such information."}
              </p>
            </div>

            {/* Termination Section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-2">6. TERMINATION</h3>
              <p className="text-sm text-gray-800">
                {data?.legalClauses?.termination || "Either party may terminate this Agreement at any time by giving the other party 30 days' prior written notice. In the event of termination, Customer shall pay for all services rendered by Provider up to the date of termination. Upon termination, Provider shall deliver to Customer all work product, whether complete or in progress."}
              </p>
            </div>

            {/* Signatures Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">SIGNATURES</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Provider:</p>
                  <div className="border-b border-gray-300 h-12 mb-1">
                    {data?.signatures?.freelancer?.signature && (
                      <img 
                        src={data.signatures.freelancer.signature} 
                        alt="Freelancer Signature" 
                        className="h-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{userProfile?.organizationName || "[Your Name]"}</p>
                  <p className="text-xs text-gray-600">
                    Date: {data?.signatures?.freelancer?.date 
                      ? formatDate(data.signatures.freelancer.date) 
                      : "_____________"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Client:</p>
                  <div className="border-b border-gray-300 h-12 mb-1">
                    {data?.signatures?.client?.signature && (
                      <img 
                        src={data.signatures.client.signature} 
                        alt="Client Signature" 
                        className="h-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{data?.clientInfo?.name || "[Client Name]"}</p>
                  <p className="text-xs text-gray-600">
                    Date: {data?.signatures?.client?.date 
                      ? formatDate(data.signatures.client.date) 
                      : "_____________"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
