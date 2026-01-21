/**
 * Aviation Compliance Rules
 * Based on FAA regulations: 14 CFR Parts 43, 61, 91
 */
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    category: 'maintenance' | 'pilot-log' | 'airworthiness' | 'weight-balance';
    severity: 'error' | 'warning' | 'info';
    regulation: string;
    check: (content: string, filename: string) => ComplianceViolation[];
}
export interface ComplianceViolation {
    ruleId: string;
    line?: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    regulation: string;
    suggestion?: string;
}
/**
 * 14 CFR Part 43 - Maintenance, Preventive Maintenance, Rebuilding, and Alteration
 */
export declare const maintenanceLogRules: ComplianceRule[];
/**
 * 14 CFR Part 61 - Pilot Logbook Requirements
 */
export declare const pilotLogRules: ComplianceRule[];
/**
 * Airworthiness Documentation Requirements
 */
export declare const airworthinessRules: ComplianceRule[];
/**
 * Weight and Balance Requirements
 */
export declare const weightBalanceRules: ComplianceRule[];
export declare const allRules: ComplianceRule[];
