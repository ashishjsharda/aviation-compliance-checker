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
export const maintenanceLogRules: ComplianceRule[] = [
  {
    id: 'MAINT-001',
    name: 'Maintenance Log Entry Required Fields',
    description: 'Maintenance records must include required information per 14 CFR 43.9',
    category: 'maintenance',
    severity: 'error',
    regulation: '14 CFR 43.9(a)',
    check: (content: string, filename: string) => {
      const violations: ComplianceViolation[] = [];
      const requiredFields = [
        { field: 'description', pattern: /description\s*:?\s*.+/i, name: 'Description of work performed' },
        { field: 'date', pattern: /date\s*:?\s*\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i, name: 'Date of completion' },
        { field: 'aircraft', pattern: /(aircraft|tail\s*number|registration)\s*:?\s*[A-Z]-?[A-Z0-9]+/i, name: 'Aircraft identification' },
        { field: 'signature', pattern: /(signature|signed\s*by|mechanic)\s*:?\s*.+/i, name: 'Signature and certificate number' }
      ];

      requiredFields.forEach(({ field, pattern, name }) => {
        if (!pattern.test(content)) {
          violations.push({
            ruleId: 'MAINT-001',
            message: `Missing required field: ${name}`,
            severity: 'error',
            regulation: '14 CFR 43.9(a)',
            suggestion: `Add ${field} field to maintenance log entry`
          });
        }
      });

      return violations;
    }
  },
  {
    id: 'MAINT-002',
    name: 'Return to Service Statement',
    description: 'Maintenance must include return to service statement',
    category: 'maintenance',
    severity: 'error',
    regulation: '14 CFR 43.9(a)(4)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const returnToServicePattern = /return(ed)?\s+to\s+service|approved\s+for\s+return/i;
      
      if (!returnToServicePattern.test(content)) {
        violations.push({
          ruleId: 'MAINT-002',
          message: 'Missing return to service statement',
          severity: 'error',
          regulation: '14 CFR 43.9(a)(4)',
          suggestion: 'Include "Approved for return to service" or equivalent statement'
        });
      }

      return violations;
    }
  },
  {
    id: 'MAINT-003',
    name: 'Annual Inspection Documentation',
    description: 'Annual inspections must reference 14 CFR 43 Appendix D',
    category: 'maintenance',
    severity: 'error',
    regulation: '14 CFR 91.409(a)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const isAnnualInspection = /annual\s+inspection/i.test(content);
      
      if (isAnnualInspection) {
        const appendixDReference = /(appendix\s+d|14\s+cfr\s+43\s+appendix\s+d)/i.test(content);
        
        if (!appendixDReference) {
          violations.push({
            ruleId: 'MAINT-003',
            message: 'Annual inspection must reference 14 CFR 43 Appendix D',
            severity: 'error',
            regulation: '14 CFR 91.409(a)',
            suggestion: 'Include reference to "14 CFR 43 Appendix D" in annual inspection entry'
          });
        }
      }

      return violations;
    }
  },
  {
    id: 'MAINT-004',
    name: 'Airworthiness Directive Compliance',
    description: 'AD compliance must be documented',
    category: 'maintenance',
    severity: 'warning',
    regulation: '14 CFR 39',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const adPattern = /\bAD\s+\d{2,4}-\d{2}-\d{2}/i;
      const hasADReference = adPattern.test(content);
      
      if (hasADReference) {
        const compliancePattern = /(complied|compliance|complies)\s+with/i;
        
        if (!compliancePattern.test(content)) {
          violations.push({
            ruleId: 'MAINT-004',
            message: 'AD reference found but compliance statement missing',
            severity: 'warning',
            regulation: '14 CFR 39',
            suggestion: 'Include statement confirming AD compliance'
          });
        }
      }

      return violations;
    }
  }
];

/**
 * 14 CFR Part 61 - Pilot Logbook Requirements
 */
export const pilotLogRules: ComplianceRule[] = [
  {
    id: 'PILOT-001',
    name: 'Logbook Entry Required Fields',
    description: 'Pilot logbook entries must contain required information per 14 CFR 61.51',
    category: 'pilot-log',
    severity: 'error',
    regulation: '14 CFR 61.51(b)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const requiredFields = [
        { field: 'date', pattern: /date\s*:?\s*\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i, name: 'Date' },
        { field: 'aircraft', pattern: /(aircraft|make|model)\s*:?\s*.+/i, name: 'Aircraft make and model' },
        { field: 'registration', pattern: /(tail|registration|N\s*number)\s*:?\s*[A-Z]-?[A-Z0-9]+/i, name: 'Aircraft registration' },
        { field: 'flight-time', pattern: /(total\s+time|flight\s+time|duration)\s*:?\s*\d+\.?\d*/i, name: 'Total flight time' }
      ];

      requiredFields.forEach(({ field, pattern, name }) => {
        if (!pattern.test(content)) {
          violations.push({
            ruleId: 'PILOT-001',
            message: `Missing required field: ${name}`,
            severity: 'error',
            regulation: '14 CFR 61.51(b)',
            suggestion: `Add ${field} to logbook entry`
          });
        }
      });

      return violations;
    }
  },
  {
    id: 'PILOT-002',
    name: 'Night Flight Time Logging',
    description: 'Night time must be logged if operation occurred after sunset',
    category: 'pilot-log',
    severity: 'warning',
    regulation: '14 CFR 61.51(b)(3)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const nightPattern = /night/i;
      const nightTimePattern = /(night\s+time|night\s+flight)\s*:?\s*\d+\.?\d*/i;
      
      if (nightPattern.test(content) && !nightTimePattern.test(content)) {
        violations.push({
          ruleId: 'PILOT-002',
          message: 'Night operation indicated but night time not logged',
          severity: 'warning',
          regulation: '14 CFR 61.51(b)(3)',
          suggestion: 'Log night flight time separately'
        });
      }

      return violations;
    }
  },
  {
    id: 'PILOT-003',
    name: 'Instrument Approach Logging',
    description: 'Instrument approaches must include location and type',
    category: 'pilot-log',
    severity: 'warning',
    regulation: '14 CFR 61.51(g)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const approachPattern = /(approach|approaches|IAP)/i;
      
      if (approachPattern.test(content)) {
        const approachDetailsPattern = /(ILS|VOR|RNAV|GPS|LOC|NDB)\s+(RWY)?\s*\d{1,2}[LRC]?/i;
        
        if (!approachDetailsPattern.test(content)) {
          violations.push({
            ruleId: 'PILOT-003',
            message: 'Instrument approach logged without type and runway',
            severity: 'warning',
            regulation: '14 CFR 61.51(g)',
            suggestion: 'Include approach type (ILS, RNAV, etc.) and runway'
          });
        }
      }

      return violations;
    }
  }
];

/**
 * Airworthiness Documentation Requirements
 */
export const airworthinessRules: ComplianceRule[] = [
  {
    id: 'AROW-001',
    name: 'AROW Document Checklist',
    description: 'Aircraft must have required documents (AROW)',
    category: 'airworthiness',
    severity: 'error',
    regulation: '14 CFR 91.203',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const documents = [
        { name: 'Airworthiness Certificate', pattern: /airworthiness\s+certificate/i },
        { name: 'Registration', pattern: /(registration|n-number)/i },
        { name: 'Operating Limitations', pattern: /(operating\s+limitations|pilot\s+operating\s+handbook|POH)/i },
        { name: 'Weight and Balance', pattern: /weight\s+(and|&)\s+balance/i }
      ];

      documents.forEach(({ name, pattern }) => {
        if (!pattern.test(content)) {
          violations.push({
            ruleId: 'AROW-001',
            message: `Missing AROW document reference: ${name}`,
            severity: 'error',
            regulation: '14 CFR 91.203',
            suggestion: `Ensure ${name} is documented and current`
          });
        }
      });

      return violations;
    }
  },
  {
    id: 'INSP-001',
    name: 'Inspection Currency',
    description: 'Annual inspection must be current',
    category: 'airworthiness',
    severity: 'error',
    regulation: '14 CFR 91.409(a)',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const annualPattern = /annual\s+inspection/i;
      
      if (annualPattern.test(content)) {
        const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
        const match = content.match(datePattern);
        
        if (match) {
          const inspectionDate = new Date(match[1]);
          const today = new Date();
          const daysSinceInspection = (today.getTime() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceInspection > 365) {
            violations.push({
              ruleId: 'INSP-001',
              message: 'Annual inspection appears to be out of date',
              severity: 'error',
              regulation: '14 CFR 91.409(a)',
              suggestion: 'Annual inspection must be completed within preceding 12 calendar months'
            });
          }
        }
      }

      return violations;
    }
  }
];

/**
 * Weight and Balance Requirements
 */
export const weightBalanceRules: ComplianceRule[] = [
  {
    id: 'WB-001',
    name: 'Weight and Balance Data',
    description: 'Current weight and balance data must be available',
    category: 'weight-balance',
    severity: 'error',
    regulation: '14 CFR 91.9',
    check: (content: string) => {
      const violations: ComplianceViolation[] = [];
      const wbPattern = /weight\s+(and|&)\s+balance/i;
      
      if (wbPattern.test(content)) {
        const requiredData = [
          { name: 'Empty Weight', pattern: /empty\s+weight\s*:?\s*\d+/i },
          { name: 'CG Location', pattern: /(center\s+of\s+gravity|CG)\s*:?\s*\d+\.?\d*/i },
          { name: 'Useful Load', pattern: /useful\s+load\s*:?\s*\d+/i }
        ];

        requiredData.forEach(({ name, pattern }) => {
          if (!pattern.test(content)) {
            violations.push({
              ruleId: 'WB-001',
              message: `Missing weight and balance data: ${name}`,
              severity: 'error',
              regulation: '14 CFR 91.9',
              suggestion: `Include ${name} in weight and balance documentation`
            });
          }
        });
      }

      return violations;
    }
  }
];

export const allRules = [
  ...maintenanceLogRules,
  ...pilotLogRules,
  ...airworthinessRules,
  ...weightBalanceRules
];
