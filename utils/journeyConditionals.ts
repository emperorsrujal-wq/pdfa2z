/**
 * Conditional Field Logic for PDF Journey Builder
 * Supports showing/hiding fields based on form answers
 */

export type ConditionOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'lessOrEqual' | 'in' | 'notEquals';

export interface Condition {
  field: string;      // Field ID to check
  operator: ConditionOperator;
  value: any;         // Value to compare against
}

export interface ConditionGroup {
  conditions: Condition[];
  logic: 'AND' | 'OR';  // ALL conditions must match (AND) or ANY can match (OR)
}

/**
 * Evaluate a single condition
 */
export const evaluateCondition = (condition: Condition, formData: Record<string, any>): boolean => {
  const fieldValue = formData[condition.field];

  switch (condition.operator) {
    case 'equals':
      return String(fieldValue) === String(condition.value);

    case 'notEquals':
      return String(fieldValue) !== String(condition.value);

    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());

    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value);

    case 'lessThan':
      return Number(fieldValue) < Number(condition.value);

    case 'greaterOrEqual':
      return Number(fieldValue) >= Number(condition.value);

    case 'lessOrEqual':
      return Number(fieldValue) <= Number(condition.value);

    case 'in':
      // value should be an array of possible values
      const values = Array.isArray(condition.value) ? condition.value : [condition.value];
      return values.includes(fieldValue);

    default:
      return false;
  }
};

/**
 * Evaluate a condition group with AND/OR logic
 */
export const evaluateConditionGroup = (group: ConditionGroup, formData: Record<string, any>): boolean => {
  if (group.conditions.length === 0) return true;

  const results = group.conditions.map((condition) => evaluateCondition(condition, formData));

  if (group.logic === 'AND') {
    return results.every((r) => r === true);
  } else {
    return results.some((r) => r === true);
  }
};

/**
 * Evaluate multiple condition groups with AND logic (all groups must be satisfied)
 */
export const evaluateConditions = (groups: ConditionGroup[], formData: Record<string, any>): boolean => {
  if (groups.length === 0) return true;
  return groups.every((group) => evaluateConditionGroup(group, formData));
};

/**
 * Get all visible fields for a step based on current form data
 */
export const getVisibleFields = (
  fields: any[],
  formData: Record<string, any>,
  fieldConditions: Record<string, ConditionGroup[]>
): any[] => {
  return fields.filter((field) => {
    const conditions = fieldConditions[field.id];
    if (!conditions || conditions.length === 0) {
      return true; // No conditions = always visible
    }
    return evaluateConditions(conditions, formData);
  });
};

/**
 * Helper to create simple single-condition groups
 */
export const createSimpleCondition = (fieldId: string, operator: ConditionOperator, value: any): ConditionGroup => {
  return {
    conditions: [{ field: fieldId, operator, value }],
    logic: 'AND',
  };
};

/**
 * Example condition creators for common use cases
 */
export const conditionHelpers = {
  // Show if business type = LLC
  businessTypeLLC: (fieldId: string = 'businessType'): ConditionGroup =>
    createSimpleCondition(fieldId, 'equals', 'LLC'),

  // Show if income > threshold
  incomeAbove: (amount: number, fieldId: string = 'annualIncome'): ConditionGroup =>
    createSimpleCondition(fieldId, 'greaterThan', amount),

  // Show if country = US
  countryUS: (fieldId: string = 'country'): ConditionGroup =>
    createSimpleCondition(fieldId, 'equals', 'United States'),

  // Show if property type is residential
  propertyResidential: (fieldId: string = 'propertyType'): ConditionGroup =>
    createSimpleCondition(fieldId, 'equals', 'residential'),

  // Show if claim amount > threshold
  claimAmountHigh: (amount: number, fieldId: string = 'claimAmount'): ConditionGroup =>
    createSimpleCondition(fieldId, 'greaterThan', amount),

  // Show if marital status = married
  marriedCoupled: (fieldId: string = 'maritalStatus'): ConditionGroup =>
    createSimpleCondition(fieldId, 'in', ['Married', 'Domestic Partnership']),
};

/**
 * Validate that conditions reference existing fields
 */
export const validateConditions = (conditions: ConditionGroup[], availableFields: string[]): string[] => {
  const errors: string[] = [];

  conditions.forEach((group, groupIndex) => {
    group.conditions.forEach((condition, conditionIndex) => {
      if (!availableFields.includes(condition.field)) {
        errors.push(
          `Condition group ${groupIndex + 1}, condition ${conditionIndex + 1}: Field "${condition.field}" does not exist`
        );
      }
    });
  });

  return errors;
};
