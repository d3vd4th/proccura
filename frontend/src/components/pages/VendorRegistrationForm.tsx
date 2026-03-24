import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { useToast } from '@/components/atoms/toast';
import { VendorPortalService } from '@/lib/api/vendorPortal';

export function VendorRegistrationForm() {
    const [domains, setDomains] = useState<string[]>([]);
    const [questionnaires, setQuestionnaires] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<Record<string, string>>({});

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await VendorPortalService.getAssignedQuestionnaires();
            setQuestionnaires(data);
            setDomains(Object.keys(data));
            
            // Pre-fill existing responses
            const initialResponses: Record<string, string> = {};
            Object.values(data).flat().forEach((q: any) => {
                if (q.response) {
                    initialResponses[q.assignment_id] = q.response;
                }
            });
            setResponses(initialResponses);
            
        } catch (error) {
            console.error("Failed to load questionnaires", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (assignmentId: string, value: string) => {
        setResponses(prev => ({ ...prev, [assignmentId]: value }));
    };

    const handleNext = () => {
        if (currentStep < domains.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const submitPayload = {
                responses: Object.entries(responses).map(([assignmentId, response]) => ({
                    assignment_id: assignmentId,
                    response
                }))
            };
            
            await VendorPortalService.submitQuestionnaires(submitPayload);
            toast.success("Questionnaires submitted successfully", "Success");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit questionnaires", "Error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (domains.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to Vendor Registration</CardTitle>
                    <CardDescription>You have no questionnaires assigned at this time.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const currentDomain = domains[currentStep];
    const currentQuestions = questionnaires[currentDomain] || [];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Stepper Header */}
            <div className="flex justify-between items-center mb-8">
                {domains.map((domain, index) => (
                    <div key={domain} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
                            ${index === currentStep ? 'bg-primary text-primary-foreground' : 
                              index < currentStep ? 'bg-primary/60 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {index + 1}
                        </div>
                        <span className="text-sm mt-2 font-medium">{domain}</span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{currentDomain}</CardTitle>
                    <CardDescription>Please answer all questions in this category.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentQuestions.map((q) => (
                        <div key={q.assignment_id} className="space-y-2">
                            <Label htmlFor={q.assignment_id}>
                                {q.question}
                                {q.attachment_required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            
                            {q.type === 'yes_no' ? (
                                <select 
                                    id={q.assignment_id}
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                                    value={responses[q.assignment_id] || ''}
                                    onChange={(e) => handleInputChange(q.assignment_id, e.target.value)}
                                >
                                    <option value="" disabled>Select an option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            ) : (
                                <Input 
                                    id={q.assignment_id}
                                    disabled={q.status === 'Completed'}
                                    value={responses[q.assignment_id] || ''}
                                    onChange={(e) => handleInputChange(q.assignment_id, e.target.value)}
                                    placeholder="Your answer..."
                                />
                            )}
                            
                            {q.attachment_required && (
                                <Input type="file" disabled={q.status === 'Completed'} />
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
                <Button 
                    variant="outline" 
                    onClick={handlePrevious} 
                    disabled={currentStep === 0}
                >
                    Previous
                </Button>
                
                {currentStep === domains.length - 1 ? (
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}
