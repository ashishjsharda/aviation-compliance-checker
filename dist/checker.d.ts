import { ComplianceViolation } from './rules';
export interface CheckOptions {
    checkMaintenanceLogs: boolean;
    checkPilotLogs: boolean;
    checkAirworthiness: boolean;
    checkWeightBalance: boolean;
}
export interface ComplianceReport {
    totalFiles: number;
    filesChecked: number;
    totalViolations: number;
    violationsBySeverity: {
        error: number;
        warning: number;
        info: number;
    };
    fileResults: FileComplianceResult[];
    summary: string;
}
export interface FileComplianceResult {
    filename: string;
    violations: ComplianceViolation[];
    status: 'PASS' | 'FAIL' | 'WARNING';
}
export declare class ComplianceChecker {
    private options;
    private rules;
    constructor(options: CheckOptions);
    private loadRules;
    checkFiles(filePatterns: string[]): Promise<ComplianceReport>;
    private findFiles;
    private checkFile;
    private determineStatus;
    private generateReport;
    generateMarkdownReport(report: ComplianceReport): string;
}
