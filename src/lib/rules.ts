/**
 * Transaction Rules - Main Export
 *
 * Central export file for all transaction rule functionality
 */

export * from "./rule-builder";
// Builder and validation
export {
	createRuleBuilder,
	parseRule,
	RuleBuilder,
	ruleToJson,
	validateRule,
} from "./rule-builder";
export * from "./rule-examples";

// Examples and patterns
export {
	exampleRules,
	getExampleRulesAsJson,
	rulePatterns,
	ruleTemplates,
} from "./rule-examples";
// Types
export type {
	FieldName,
	LogicOperator,
	NumericCondition,
	NumericOperator,
	RuleCondition,
	StringCondition,
	StringOperator,
	TransactionDirection,
	TransactionRule,
	ValidationError,
	ValidationResult,
} from "./rule-types";
// Re-export everything for convenience
export * from "./rule-types";
export {
	ERROR_CODES,
	NUMERIC_FIELDS,
	NUMERIC_OPERATORS,
	STRING_FIELDS,
	STRING_OPERATORS,
} from "./rule-types";
