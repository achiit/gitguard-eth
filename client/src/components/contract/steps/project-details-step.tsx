import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, DollarSign, Package, Wallet, Shield } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { ContractFormData, PaymentType } from "@/types";
import { PYUSD_CONFIG } from "@/lib/web3-escrow";
import { usePrivy } from '@privy-io/react-auth';

export default function ProjectDetailsStep() {
  const form = useFormContext<ContractFormData>();
  const { user: privyUser } = usePrivy();
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
    <div className="space-y-8">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="projectDetails.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Website Redesign & Development" 
                    {...field} 
                    className="h-11"
                  />
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
                <FormLabel>Project Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={4} 
                    placeholder="Provide a detailed description of the project, including goals, requirements, and expected outcomes..."
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="projectDetails.startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Start Date *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="h-11" />
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
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    End Date *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="projectDetails.scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What's Included *</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={4} 
                    placeholder="List all services, features, and deliverables that are included in this project..."
                    {...field} 
                    className="resize-none"
                  />
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
                <FormLabel>
                  What's Not Included
                  <span className="text-xs text-muted-foreground ml-2">(optional but recommended)</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    rows={3} 
                    placeholder="Clearly define what is NOT included to avoid scope creep..."
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Deliverables</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeliverable}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Deliverable
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {form.watch("deliverables")?.map((_, index) => (
              <Card key={index} className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-foreground">Deliverable {index + 1}</h4>
                    {form.watch("deliverables")?.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`deliverables.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deliverable Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Homepage Design Mockups" 
                              {...field} 
                              className="h-11"
                            />
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={2} 
                              placeholder="Describe what will be delivered..."
                              {...field} 
                              className="resize-none"
                            />
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
                          <FormLabel>Due Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5" />
            Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="paymentTerms.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Structure *</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value={PaymentType.FIXED} id="fixed" />
                      <div>
                        <FormLabel htmlFor="fixed" className="font-medium">Fixed Price</FormLabel>
                        <p className="text-xs text-muted-foreground">One-time payment for the entire project</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value={PaymentType.HOURLY} id="hourly" />
                      <div>
                        <FormLabel htmlFor="hourly" className="font-medium">Hourly Rate</FormLabel>
                        <p className="text-xs text-muted-foreground">Payment based on time spent</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value={PaymentType.MILESTONE} id="milestone" />
                      <div>
                        <FormLabel htmlFor="milestone" className="font-medium">Milestone Based</FormLabel>
                        <p className="text-xs text-muted-foreground">Payment upon completion of milestones</p>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="paymentTerms.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount *
                    {form.watch("paymentTerms.type") === PaymentType.HOURLY && " (per hour)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="h-11"
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
                  <FormLabel>Currency *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
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
                <FormLabel>Payment Schedule (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="e.g., 50% upfront, 50% upon completion"
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Project Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-green-900 mb-2">🎯 Project Success Tips</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Be specific about deliverables to avoid misunderstandings</li>
            <li>• Set realistic timelines with buffer time for revisions</li>
            <li>• Clearly define what's out of scope to prevent scope creep</li>
            <li>• Consider milestone payments for larger projects</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}