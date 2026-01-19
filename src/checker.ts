import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import {
  ComplianceRule,
  ComplianceViolation,
  maintenanceLogRules,
  pilotLogRules,
  airworthinessRules,
  weightBalanceRules
} from './rules';

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

export class ComplianceChecker {
  private rules: ComplianceRule[] = [];

  constructor(private options: CheckOptions) {
    this.loadRules();
  }

  private loadRules(): void {
    if (this.options.checkMaintenanceLogs) {
      this.rules.push(...maintenanceLogRules);
    }
    if (this.options.checkPilotLogs) {
      this.rules.push(...pilotLogRules);
    }
    if (this.options.checkAirworthiness) {
      this.rules.push(...airworthinessRules);
    }
    if (this.options.checkWeightBalance) {
      this.rules.push(...weightBalanceRules);
    }
  }

  async checkFiles(filePatterns: string[]): Promise<ComplianceReport> {
    const files = await this.findFiles(filePatterns);
    const fileResults: FileComplianceResult[] = [];

    for (const file of files) {
      const result = await this.checkFile(file);
      fileResults.push(result);
    }

    return this.generateReport(fileResults);
  }

  private async findFiles(patterns: string[]): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
        nodir: true
      });
      allFiles.push(...matches);
    }

    return [...new Set(allFiles)];
  }

  private async checkFile(filename: string): Promise<FileComplianceResult> {
    const content = fs.readFileSync(filename, 'utf-8');
    const violations: ComplianceViolation[] = [];

    for (const rule of this.rules) {
      try {
        const ruleViolations = rule.check(content, filename);
        violations.push(...ruleViolations);
      } catch (error) {
        console.error(`Error checking rule ${rule.id} on ${filename}:`, error);
      }
    }

    const status = this.determineStatus(violations);

    return {
      filename,
      violations,
      status
    };
  }

  private determineStatus(violations: ComplianceViolation[]): 'PASS' | 'FAIL' | 'WARNING' {
    const hasErrors = violations.some(v => v.severity === 'error');
    const hasWarnings = violations.some(v => v.severity === 'warning');

    if (hasErrors) return 'FAIL';
    if (hasWarnings) return 'WARNING';
    return 'PASS';
  }

  private generateReport(fileResults: FileComplianceResult[]): ComplianceReport {
    const totalViolations = fileResults.reduce((sum, r) => sum + r.violations.length, 0);
    const violationsBySeverity = {
      error: 0,
      warning: 0,
      info: 0
    };

    fileResults.forEach(result => {
      result.violations.forEach(violation => {
        violationsBySeverity[violation.severity]++;
      });
    });

    const failedFiles = fileResults.filter(r => r.status === 'FAIL').length;
    const warningFiles = fileResults.filter(r => r.status === 'WARNING').length;
    const passedFiles = fileResults.filter(r => r.status === 'PASS').length;

    let summary = `Aviation Compliance Check Complete\n\n`;
    summary += `Files Checked: ${fileResults.length}\n`;
    summary += `✅ Passed: ${passedFiles}\n`;
    summary += `⚠️  Warnings: ${warningFiles}\n`;
    summary += `❌ Failed: ${failedFiles}\n\n`;
    summary += `Total Violations: ${totalViolations}\n`;
    summary += `  - Errors: ${violationsBySeverity.error}\n`;
    summary += `  - Warnings: ${violationsBySeverity.warning}\n`;
    summary += `  - Info: ${violationsBySeverity.info}\n`;

    return {
      totalFiles: fileResults.length,
      filesChecked: fileResults.length,
      totalViolations,
      violationsBySeverity,
      fileResults,
      summary
    };
  }

  generateMarkdownReport(report: ComplianceReport): string {
    let markdown = '# ✈️ Aviation Compliance Report\n\n';
    
    markdown += '## Summary\n\n';
    markdown += `- **Files Checked:** ${report.filesChecked}\n`;
    markdown += `- **Total Violations:** ${report.totalViolations}\n`;
    markdown += `- **Errors:** ${report.violationsBySeverity.error} ❌\n`;
    markdown += `- **Warnings:** ${report.violationsBySeverity.warning} ⚠️\n`;
    markdown += `- **Info:** ${report.violationsBySeverity.info} ℹ️\n\n`;

    // Group results by status
    const failedFiles = report.fileResults.filter(r => r.status === 'FAIL');
    const warningFiles = report.fileResults.filter(r => r.status === 'WARNING');
    const passedFiles = report.fileResults.filter(r => r.status === 'PASS');

    if (failedFiles.length > 0) {
      markdown += '## ❌ Failed Files\n\n';
      failedFiles.forEach(file => {
        markdown += `### \`${file.filename}\`\n\n`;
        file.violations.forEach(v => {
          const icon = v.severity === 'error' ? '❌' : v.severity === 'warning' ? '⚠️' : 'ℹ️';
          markdown += `${icon} **${v.ruleId}**: ${v.message}\n`;
          markdown += `   - *Regulation:* ${v.regulation}\n`;
          if (v.suggestion) {
            markdown += `   - *Suggestion:* ${v.suggestion}\n`;
          }
          markdown += '\n';
        });
      });
    }

    if (warningFiles.length > 0) {
      markdown += '## ⚠️ Files with Warnings\n\n';
      warningFiles.forEach(file => {
        markdown += `### \`${file.filename}\`\n\n`;
        file.violations.forEach(v => {
          markdown += `⚠️ **${v.ruleId}**: ${v.message}\n`;
          markdown += `   - *Regulation:* ${v.regulation}\n`;
          if (v.suggestion) {
            markdown += `   - *Suggestion:* ${v.suggestion}\n`;
          }
          markdown += '\n';
        });
      });
    }

    if (passedFiles.length > 0) {
      markdown += '## ✅ Passed Files\n\n';
      passedFiles.forEach(file => {
        markdown += `- \`${file.filename}\`\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
    markdown += '*Generated by [Aviation Compliance Checker](https://github.com/marketplace/actions/aviation-compliance-checker)*\n';

    return markdown;
  }
}
