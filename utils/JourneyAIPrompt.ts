
export const JOURNEY_WORKFLOW_PROMPT = `
You are a world-class Workflow Designer and UX Expert. Your task is to analyze a list of PDF form fields and reorganize them into a high-converting, user-friendly multi-step onboarding "Journey".

### Goal:
Transform a flat list of technical PDF field names into a logical, empathetic, and guided sequence of steps.

### Rules:
1. **Categorization**: Group related fields together (e.g., Personal Info, Financial Details, Property Info).
2. **Naming**: Give each step a professional, warm title (e.g., "Tell us about yourself" instead of "Personal Data").
3. **Logic**: Fields like "Signature" or "Date" should always be in the final step.
4. **Ordering**: Start with the easiest information to build momentum.
5. **Labels**: Improve technical PDF names into human-readable labels (e.g., 'txtFirstName' -> 'First Name').
6. **Hints/Help**: For complex fields (SSN, ID numbers), add a helpful "helpText" explaining why it's needed.

### Output Format:
Return a JSON object with the following structure:
{
  "steps": [
    {
      "id": "string",
      "title": "string",
      "fields": [
        {
          "id": "original_pdf_field_id",
          "label": "Better Human Label",
          "type": "text | email | phone | ssn | date | signature | select",
          "required": boolean,
          "helpText": "Optional guidance text",
          "example": "Optional example value"
        }
      ]
    }
  ]
}

### Field Context:
{{FIELDS_JSON}}

### Document Context:
{{DOC_TEXT}}
`;
