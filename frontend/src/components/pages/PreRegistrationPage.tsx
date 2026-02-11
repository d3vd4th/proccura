import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    Label,
} from '@/components/atoms';
import { registrationAPI, PreRegistrationData, InvitationVerify } from '@/api/registration';

type PageState = 'loading' | 'form' | 'success' | 'error';

export const PreRegistrationPage = () => {
    const { token } = useParams<{ token: string }>();
    const [pageState, setPageState] = useState<PageState>('loading');
    const [invitation, setInvitation] = useState<InvitationVerify | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState<PreRegistrationData>({
        business_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        gst_number: '',
        pan_number: '',
        business_type: '',
        products_services: '',
    });

    useEffect(() => {
        if (!token) {
            setErrorMessage('Invalid invitation link');
            setPageState('error');
            return;
        }

        const verifyToken = async () => {
            try {
                const data = await registrationAPI.verify(token);
                setInvitation(data);
                setFormData((prev) => ({
                    ...prev,
                    business_name: data.business_name,
                    email: data.email,
                }));
                setPageState('form');
            } catch (error: any) {
                setErrorMessage(
                    error.response?.data?.detail || 'This invitation link is invalid or has expired.'
                );
                setPageState('error');
            }
        };

        verifyToken();
    }, [token]);

    const updateField = (field: keyof PreRegistrationData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsSubmitting(true);
        try {
            await registrationAPI.submit(token, formData);
            setPageState('success');
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.detail || 'Failed to submit registration. Please try again.'
            );
            setPageState('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, label: 'Business Info' },
        { number: 2, label: 'Address' },
        { number: 3, label: 'Additional Details' },
    ];

    // Loading State
    if (pageState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying your invitation...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (pageState === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Unable to Proceed</h2>
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success State
    if (pageState === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Registration Complete!</h2>
                        <p className="text-muted-foreground mb-2">
                            Thank you for registering as a vendor.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your application is under review. You'll receive an email once it's approved.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form State
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full mb-4">
                        <Building2 className="h-5 w-5" />
                        <span className="font-semibold">Proccura</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Vendor Pre-Registration</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome <strong>{invitation?.business_name}</strong>! Please complete your registration.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, idx) => (
                        <div key={step.number} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(step.number)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep === step.number
                                        ? 'bg-primary text-primary-foreground'
                                        : currentStep > step.number
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                    {currentStep > step.number ? '✓' : step.number}
                                </span>
                                {step.label}
                            </button>
                            {idx < steps.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 ${currentStep > step.number ? 'bg-green-300' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].label}</CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Enter your business contact information'}
                            {currentStep === 2 && 'Enter your business address'}
                            {currentStep === 3 && 'Provide additional business details (optional fields marked)'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Business Info */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Business Name *</Label>
                                        <Input
                                            id="business_name"
                                            value={formData.business_name}
                                            onChange={(e) => updateField('business_name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person *</Label>
                                        <Input
                                            id="contact_person"
                                            placeholder="Full name of primary contact"
                                            value={formData.contact_person}
                                            onChange={(e) => updateField('contact_person', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Address */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line1">Address Line 1 *</Label>
                                        <Input
                                            id="address_line1"
                                            placeholder="Street address, building name"
                                            value={formData.address_line1}
                                            onChange={(e) => updateField('address_line1', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line2">Address Line 2</Label>
                                        <Input
                                            id="address_line2"
                                            placeholder="Floor, suite, area (optional)"
                                            value={formData.address_line2 || ''}
                                            onChange={(e) => updateField('address_line2', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => updateField('state', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="postal_code">Postal Code *</Label>
                                            <Input
                                                id="postal_code"
                                                value={formData.postal_code}
                                                onChange={(e) => updateField('postal_code', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country *</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => updateField('country', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Additional Details */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gst_number">GST Number</Label>
                                            <Input
                                                id="gst_number"
                                                placeholder="22AAAAA0000A1Z5"
                                                value={formData.gst_number || ''}
                                                onChange={(e) => updateField('gst_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pan_number">PAN Number</Label>
                                            <Input
                                                id="pan_number"
                                                placeholder="AAAAA0000A"
                                                value={formData.pan_number || ''}
                                                onChange={(e) => updateField('pan_number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business_type">Business Type</Label>
                                        <select
                                            id="business_type"
                                            value={formData.business_type || ''}
                                            onChange={(e) => updateField('business_type', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Select type...</option>
                                            <option value="Manufacturer">Manufacturer</option>
                                            <option value="Distributor">Distributor</option>
                                            <option value="Wholesaler">Wholesaler</option>
                                            <option value="Retailer">Retailer</option>
                                            <option value="Service Provider">Service Provider</option>
                                            <option value="Contractor">Contractor</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="products_services">Products / Services Offered</Label>
                                        <textarea
                                            id="products_services"
                                            placeholder="Describe the products or services you provide..."
                                            value={formData.products_services || ''}
                                            onChange={(e) => updateField('products_services', e.target.value)}
                                            rows={4}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                {currentStep > 1 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                    >
                                        Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Registration'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    By registering, you agree to our terms of service. Your information will be reviewed by the procurement team.
                </p>
            </div>
        </div>
    );
};
