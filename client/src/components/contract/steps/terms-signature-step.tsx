import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, AlertTriangle, PenTool } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { ContractFormData } from "@/types";
import SignaturePad from "../signature-pad";

interface TermsSignatureStepProps {
  onSignatureCapture: (signature: string) => void;
  signature: string;
}

export default function TermsSignatureStep({ 
  onSignatureCapture, 
  signature 
}: TermsSignatureStepProps) {
  const form = useFormContext<ContractFormData>();
  const legalClauses = [
    {
      key: "intellectualProperty",
      title: "Intellectual Property Rights",
      icon: <Shield className="w-4 h-4" />,
      description: "Defines ownership of work created during the project",
      required: true,
    },
    {
      key: "confidentiality",
      title: "Confidentiality Agreement",
      icon: <FileText className="w-4 h-4" />,
      description: "Protects sensitive information shared during the project",
      required: true,
    },
    {
      key: "termination",
      title: "Termination Clause",
      icon: <AlertTriangle className="w-4 h-4" />,
      description: "Outlines conditions for ending the contract early",
      required: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Legal Clauses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            Legal Terms & Clauses
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and customize the legal terms for your contract. These clauses protect both you and your client.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {legalClauses.map((clause, index) => (
            <div key={clause.key}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {clause.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      {clause.title}
                      {clause.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">{clause.description}</p>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name={`legalClauses.${clause.key}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScrollArea className="h-32 w-full border rounded-md">
                        <Textarea
                          {...field}
                          rows={6}
                          className="border-0 resize-none focus-visible:ring-0"
                          placeholder={`Enter ${clause.title.toLowerCase()} terms...`}
                        />
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {index < legalClauses.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Terms (Optional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add any additional terms or conditions specific to this project.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="legalClauses.additionalTerms"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Add any additional terms, conditions, or special requirements for this project..."
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="w-5 h-5" />
            Your Digital Signature
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign the contract digitally. This signature will be legally binding and will appear on the final contract.
          </p>
        </CardHeader>
        <CardContent>
          <SignaturePad
            onSignatureCapture={onSignatureCapture}
          />
        </CardContent>
      </Card>

      {/* Contract Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">📋 Contract Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Template:</span>
              <span className="ml-2 text-blue-800 capitalize">
                {form.watch("templateType")?.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Client:</span>
              <span className="ml-2 text-blue-800">
                {form.watch("clientInfo.name")} ({form.watch("clientInfo.companyName")})
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Project:</span>
              <span className="ml-2 text-blue-800">
                {form.watch("projectDetails.title")}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Value:</span>
              <span className="ml-2 text-blue-800">
                {form.watch("paymentTerms.amount")} {form.watch("paymentTerms.currency")}
                {form.watch("paymentTerms.type") === 'hourly' && '/hour'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Duration:</span>
              <span className="ml-2 text-blue-800">
                {form.watch("projectDetails.startDate")} to {form.watch("projectDetails.endDate")}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Deliverables:</span>
              <span className="ml-2 text-blue-800">
                {form.watch("deliverables")?.length || 0} items
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">⚖️ Legal Notice</h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                By signing this contract, you agree to all terms and conditions outlined above. 
                This contract will be legally binding once both parties have signed. 
                Please review all terms carefully before proceeding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}