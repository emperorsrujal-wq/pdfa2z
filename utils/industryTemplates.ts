
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
    id: "medical",
    name: "Medical Policy (HIPAA)",
    description: "Standard HIPAA authorization and patient privacy disclosure for healthcare providers.",
    icon: "⚕️",
    color: "#10b981",
    steps: [
      {
        id: "patient",
        title: "Patient Rights",
        description: "Review your rights under the Health Insurance Portability and Accountability Act.",
        fields: [
          { id: "patient_name", name: "Patient Name", label: "Full Legal Name", type: "text", options: [], required: true },
          { id: "auth_release", name: "Authorization Release", label: "I authorize the release of my medical records to the specified parties.", type: "checkbox", options: [], required: true }
        ]
      },
      {
        id: "auth",
        title: "Authorization",
        description: "Specify the duration and scope of this medical authorization.",
        fields: [
          { id: "expiry", name: "Expiry Date", label: "Expiration Date", type: "date", options: [], required: true },
          { id: "signature", name: "Patient Signature", label: "Legal Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "real-estate-lease",
    name: "Residential Lease",
    description: "Standard residential lease agreement for property managers and landlords.",
    icon: "🔑",
    color: "#3b82f6",
    steps: [
      {
        id: "lease-terms",
        title: "Lease Terms",
        description: "Define the duration and financial terms of the tenancy.",
        fields: [
          { id: "rent_amount", name: "Monthly Rent", label: "Monthly Rent Amount", type: "text", options: [], required: true, validationType: "currency" },
          { id: "deposit", name: "Security Deposit", label: "Security Deposit", type: "text", options: [], required: true, validationType: "currency" },
          { id: "start_date", name: "Lease Start", label: "Lease Commencement Date", type: "date", options: [], required: true }
        ]
      },
      {
        id: "tenant-signature",
        title: "Signatures",
        description: "Execute the legal binding agreement for the property.",
        fields: [
          { id: "tenant_sig", name: "Tenant Signature", label: "Tenant Digital Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "bank-wire",
    name: "Wire Transfer Auth",
    description: "Secure authorization for international and domestic wire transfers.",
    icon: "💸",
    color: "#6366f1",
    steps: [
      {
        id: "beneficiary",
        title: "Beneficiary Info",
        description: "Details for the receiving account and financial institution.",
        fields: [
          { id: "acc_name", name: "Account Name", label: "Beneficiary Account Name", type: "text", options: [], required: true },
          { id: "iban", name: "IBAN / Acc #", label: "Account Number / IBAN", type: "text", options: [], required: true },
          { id: "swift", name: "SWIFT / BIC", label: "Bank SWIFT / BIC Code", type: "text", options: [], required: true }
        ]
      },
      {
        id: "auth-bank",
        title: "Authorization",
        description: "Verify the transfer amount and authorize the transaction.",
        fields: [
          { id: "wire_amount", name: "Transfer Amount", label: "Amount to Wire", type: "text", options: [], required: true, validationType: "currency" },
          { id: "bank_sig", name: "Authorizer Signature", label: "Account Holder Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  },
  {
    id: "insurance-claim",
    name: "Proof of Loss",
    description: "Formal insurance claim document for loss assessment and reimbursement.",
    icon: "🛡️",
    color: "#f59e0b",
    steps: [
      {
        id: "loss-details",
        title: "Loss Description",
        description: "Provide details about the incident and the damaged property.",
        fields: [
          { id: "incident_date", name: "Date of Loss", label: "Date of Incident", type: "date", options: [], required: true },
          { id: "loss_desc", name: "Damage Description", label: "Detailed Description of Loss", type: "text", options: [], required: true },
          { id: "photos", name: "Evidence Photos", label: "Damage Photos/Evidence", type: "file", options: [], required: true }
        ]
      },
      {
        id: "claim-submit",
        title: "Certification",
        description: "Certify the accuracy of the claim under penalty of perjury.",
        fields: [
          { id: "cert_sig", name: "Claimant Signature", label: "Claimant Digital Signature", type: "signature", options: [], required: true }
        ]
      }
    ]
  }
];
