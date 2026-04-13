
import { Step } from "../components/PDFJourneyBuilder";

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  steps: Step[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "real-estate",
    name: "Property Finance App",
    description: "Multi-step loan application with credit check and asset verification for global markets.",
    icon: "🏠",
    color: "#3b82f6",
    steps: [
      {
        id: "applicant-info",
        title: "Primary Applicant",
        description: "Standard identity and contact verification for the primary borrower.",
        fields: [
          { id: "full_name", name: "Full Name", label: "Full Name", type: "text", options: [], required: true },
          { id: "email", name: "Email", label: "Personal Email", type: "email", options: [], required: true },
          { id: "tax_id", name: "Tax ID", label: "Tax ID / National ID", type: "text", options: [], required: true, validationType: "text" },
          { id: "dob", name: "DOB", label: "Date of Birth", type: "date", options: [], required: true }
        ]
      },
      {
        id: "property-details",
        title: "Property Focus",
        description: "Details regarding the subject property and the requested loan amount.",
        fields: [
          { id: "prop_address", name: "Property Address", label: "Subject Property Address", type: "text", options: [], required: true },
          { id: "prop_type", name: "Property Type", label: "Property Type", type: "select", options: ["Single Family", "Condo", "Townhouse", "Multi-Family"], required: true },
          { id: "purchase_price", name: "Purchase Price", label: "Sales Price / Estimated Value", type: "text", options: [], required: true, validationType: "currency" },
          { id: "down_payment", name: "Down Payment", label: "Down Payment / Equity", type: "text", options: [], required: true, validationType: "currency" }
        ]
      },
      {
        id: "income",
        title: "Financial Profile",
        description: "Verified income sources to establish your debt-to-income ratio.",
        fields: [
          { id: "annual_income", name: "Annual Income", label: "Gross Annual Income", type: "text", options: [], required: true, validationType: "currency" },
          { id: "employer", name: "Employer", label: "Current Employer Name", type: "text", options: [], required: true },
          { id: "years_exp", name: "Years Experience", label: "Years in Current Field", type: "text", options: ["< 2 Years", "2-5 Years", "5-10 Years", "10+ Years"], required: true }
        ]
      },
      {
        id: "assets",
        title: "Asset Verification",
        description: "Liquid assets and bank account declarations for closing costs.",
        fields: [
          { id: "bank_balance", name: "Bank Balance", label: "Total Liquidity (Savings/Checking)", type: "text", options: [], required: true, validationType: "currency" },
          { id: "other_assets", name: "Other Assets", label: "Retirement / Investment / Other", type: "text", options: [], required: false, validationType: "currency" }
        ]
      },
      {
        id: "co-app",
        title: "Co-Applicant (Optional)",
        description: "If you are applying with a spouse or partner, provide their details here.",
        fields: [
          { id: "has_co_app", name: "Has Co-App", label: "Will there be a co-applicant?", type: "checkbox", options: [], required: false },
          { id: "co_full_name", name: "Co-App Name", label: "Co-Applicant Full Name", type: "text", options: [], required: false },
          { id: "co_tax_id", name: "Co-App ID", label: "Co-Applicant National ID", type: "text", options: [], required: false, validationType: "text" }
        ]
      },
      {
        id: "disclosures",
        title: "Declarations",
        description: "Standard regulatory and government monitoring disclosures.",
        fields: [
          { id: "citizenship", name: "Citizenship", label: "Are you a citizen of this country?", type: "select", options: ["Yes", "No"], required: true },
          { id: "bankrupt", name: "Bankruptcy", label: "Any bankruptcy in last 7 years?", type: "checkbox", options: [], required: true },
          { id: "lawsuit", name: "Lawsuit", label: "Are you a party to a lawsuit?", type: "checkbox", options: [], required: true }
        ]
      },
      {
        id: "sign-submit",
        title: "Submission",
        description: "Sign and authorize the credit pull and application review.",
        fields: [
          { id: "signature", name: "Authorization Signature", label: "Digital Signature", type: "signature", options: [], required: true },
          { id: "consent", name: "Electronic Consent", label: "I consent to electronic delivery of disclosures.", type: "checkbox", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "healthcare",
    name: "Patient Intake",
    description: "Privacy-compliant medical history and intake for clinics and hospitals.",
    icon: "🏥",
    color: "#10b981",
    steps: [
      {
        id: "patient-info",
        title: "Patient Information",
        description: "Standard personal and contact details for the patient.",
        fields: [
          { id: "full_name", name: "Full Name", label: "Legal Name", type: "text", options: [], required: true },
          { id: "dob", name: "Date of Birth", label: "Birthday", type: "date", options: [], required: true },
          { id: "gender", name: "Gender", label: "Gender", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"], required: true }
        ]
      },
      {
        id: "insurance",
        title: "Insurance Coverage",
        description: "Primary and secondary insurance provider details.",
        fields: [
          { id: "provider", name: "Primary Provider", label: "Insurance Carrier", type: "text", options: [], required: true },
          { id: "policy_id", name: "Policy ID", label: "Member ID / Account #", type: "text", options: [], required: true },
          { id: "ins_card", name: "Insurance Card", label: "Photo of ID/Card", type: "file", options: [], required: true }
        ]
      },
      {
        id: "medical-history",
        title: "Medical History",
        description: "Previous conditions and current medications for doctor review.",
        fields: [
          { id: "conditions", name: "Known Conditions", label: "Pre-existing Conditions", type: "text", options: [], required: false },
          { id: "medications", name: "Medications", label: "Current Medications & Dosages", type: "text", options: [], required: false },
          { id: "allergies", name: "Allergies", label: "Allergies (Medication/Food)", type: "text", options: [], required: true }
        ]
      },
      {
        id: "consent",
        title: "Consent & Privacy",
        description: "Electronic authorization for treatment and privacy policies.",
        fields: [
          { id: "privacy", name: "Privacy Consent", label: "I acknowledge receipt of the privacy notice.", type: "checkbox", options: [], required: true },
          { id: "signature", name: "Signature", label: "Patient Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "hr",
    name: "Employment Contract",
    description: "Standard onboarding agreement with direct deposit and tax info.",
    icon: "👔",
    color: "#6366f1",
    steps: [
      {
        id: "employee",
        title: "Employee Details",
        description: "New hire contact and background information.",
        fields: [
          { id: "full_name", name: "Full Name", label: "Full Name", type: "text", options: [], required: true },
          { id: "tax_id", name: "Tax ID", label: "National ID / Tax Number", type: "text", options: [], required: true, validationType: "text" }
        ]
      },
      {
        id: "banking",
        title: "Direct Deposit",
        description: "Bank account details for payroll distribution.",
        fields: [
          { id: "bank_name", name: "Bank Name", label: "Financial Institution", type: "text", options: [], required: true },
          { id: "account_num", name: "Account Number", label: "Account #", type: "text", options: [], required: true },
          { id: "bank_code", name: "Bank Code", label: "Sort Code / Routing (ABA) #", type: "text", options: [], required: true }
        ]
      },
      {
        id: "contract",
        title: "Agreement",
        description: "Review and sign the professional employment terms.",
        fields: [
          { id: "signature", name: "Signature", label: "Employee Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "finance",
    name: "Credit Application",
    description: "SBA/Business inquiry for lending and credit facilities.",
    icon: "💳",
    color: "#ec4899",
    steps: [
      {
        id: "business-info",
        title: "Business Profile",
        description: "Entity details and tax identification for the borrower.",
        fields: [
          { id: "legal_name", name: "Entity Name", label: "Business Legal Name", type: "text", options: [], required: true },
          { id: "tax_id", name: "Tax ID", label: "Tax ID (EIN/VAT/ABN)", type: "text", options: [], required: true }
        ]
      },
      {
        id: "request",
        title: "Loan Request",
        description: "Purpose and amount of the requested funding.",
        fields: [
          { id: "amount", name: "Loan Amount", label: "Requested Capital", type: "text", options: [], required: true, validationType: "currency" },
          { id: "purpose", name: "Purpose", label: "Use of Funds", type: "select", options: ["Working Capital", "Equipment", "Real Estate", "Inventory"], required: true }
        ]
      },
      {
        id: "verify",
        title: "Verification",
        description: "Identity and revenue verification for underwriting.",
        fields: [
          { id: "bank_stmt", name: "Bank Statements", label: "Last 3 Months Statements", type: "file", options: [], required: true },
          { id: "guarantor", name: "Guarantor Signature", label: "Personal Guarantee Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "consulting",
    name: "Service Agreement",
    description: "B2B consulting contract with SOW and hourly rate setup.",
    icon: "🤝",
    color: "#8b5cf6",
    steps: [
      {
        id: "parties",
        title: "Parties",
        description: "Identify the client and the consultant for this agreement.",
        fields: [
          { id: "client_name", name: "Client Name", label: "Client/Company Name", type: "text", options: [], required: true },
          { id: "consultant", name: "Consultant Name", label: "Consultant Professional Name", type: "text", options: [], required: true }
        ]
      },
      {
        id: "scope",
        title: "Scope of Work",
        description: "Define the deliverables and project timeline.",
        fields: [
          { id: "sow", name: "Deliverables", label: "Description of Services", type: "text", options: [], required: true },
          { id: "rate", name: "Hourly Rate", label: "Agreed Rate (per hr)", type: "text", options: [], required: true, validationType: "currency" }
        ]
      },
      {
        id: "sign",
        title: "Authorization",
        description: "Legally binding electronic signatures for both parties.",
        fields: [
          { id: "signature", name: "Client Signature", label: "Authorized Representive", type: "signature", options: [], required: true }
        ]
      }
    ]
  }
];
