# ✈️ Aviation Compliance Checker

Automated FAA compliance checking for aviation maintenance logs, pilot logbooks, and aircraft documentation. This GitHub Action helps aviation professionals ensure their documentation meets Federal Aviation Regulations (14 CFR).

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Aviation%20Compliance%20Checker-blue.svg)](https://github.com/marketplace/actions/aviation-compliance-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

- **Maintenance Log Validation** (14 CFR Part 43)
  - Required field verification
  - Return to service statements
  - Annual inspection documentation
  - Airworthiness Directive (AD) compliance

- **Pilot Logbook Checking** (14 CFR Part 61)
  - Logbook entry completeness
  - Night flight time logging
  - Instrument approach documentation

- **Airworthiness Documentation** (14 CFR Part 91)
  - AROW document verification
  - Inspection currency tracking

- **Weight and Balance** (14 CFR 91.9)
  - Required data validation
  - Empty weight and CG tracking

## 🚀 Quick Start

Add this action to your workflow:

```yaml
name: Aviation Compliance Check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check Aviation Compliance
        uses: ashishjsharda/aviation-compliance-checker@v1
        with:
          files: 'logs/**/*.md,maintenance/**/*.txt'
          fail-on-violation: true
```

## 📖 Usage

### Basic Example

```yaml
- name: Aviation Compliance Check
  uses: ashishjsharda/aviation-compliance-checker@v1
  with:
    files: '**/*.md'
```

### Advanced Configuration

```yaml
- name: Aviation Compliance Check
  uses: ashishjsharda/aviation-compliance-checker@v1
  with:
    # File patterns to check (comma-separated)
    files: 'logs/**/*.md,maintenance/**/*.txt,pilot-logs/**/*.log'
    
    # Enable/disable specific checks
    check-maintenance-logs: true
    check-pilot-logs: true
    check-airworthiness: true
    check-weight-balance: true
    
    # Fail the build on violations
    fail-on-violation: true
    
    # GitHub token for PR comments
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### PR Comment Example

```yaml
- name: Aviation Compliance Check
  uses: ashishjsharda/aviation-compliance-checker@v1
  with:
    files: 'logs/**/*.md'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

This will automatically post compliance reports as PR comments.

## 📝 Input Parameters

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `files` | File patterns to check (comma-separated) | No | `**/*.md,**/*.txt,**/*.json,**/*.log` |
| `check-maintenance-logs` | Enable maintenance log checks | No | `true` |
| `check-pilot-logs` | Enable pilot logbook checks | No | `true` |
| `check-airworthiness` | Enable airworthiness checks | No | `true` |
| `check-weight-balance` | Enable weight & balance checks | No | `true` |
| `fail-on-violation` | Fail action on compliance violations | No | `false` |
| `github-token` | Token for posting PR comments | No | `${{ github.token }}` |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `violations-found` | Number of compliance violations found |
| `compliance-status` | Overall status (PASS/FAIL) |
| `report-path` | Path to detailed compliance report |

## 📋 Example File Formats

### Maintenance Log Entry

```markdown
# Maintenance Entry

Date: 01/15/2026
Aircraft: Cessna 172
Registration: N12345
Description: Annual inspection performed per 14 CFR 43 Appendix D
Signature: John Smith, A&P Certificate #123456789

Approved for return to service.
```

### Pilot Logbook Entry

```markdown
# Flight Log

Date: 01/15/2026
Aircraft: Cessna 172S
Registration: N12345
Total Time: 2.5
Night Time: 1.0
Approaches: ILS RWY 36 KCLT, RNAV RWY 18 KFAY
```

### Weight and Balance

```markdown
# Weight and Balance Data

Aircraft: N12345
Empty Weight: 1650 lbs
Center of Gravity: 39.5 inches aft of datum
Useful Load: 870 lbs
```

## 🔍 Compliance Rules

The action checks for compliance with the following FAA regulations:

- **14 CFR Part 43** - Maintenance, Preventive Maintenance, Rebuilding, and Alteration
- **14 CFR Part 61** - Certification: Pilots, Flight Instructors, and Ground Instructors
- **14 CFR Part 91** - General Operating and Flight Rules
- **14 CFR Part 39** - Airworthiness Directives

## 📊 Sample Report

```markdown
# ✈️ Aviation Compliance Report

## Summary
- **Files Checked:** 15
- **Total Violations:** 3
- **Errors:** 1 ❌
- **Warnings:** 2 ⚠️

## ❌ Failed Files

### `logs/maintenance/annual-2026.md`
❌ **MAINT-001**: Missing required field: Date of completion
   - *Regulation:* 14 CFR 43.9(a)
   - *Suggestion:* Add date field to maintenance log entry

## ⚠️ Files with Warnings

### `logs/pilot/logbook-jan-2026.md`
⚠️ **PILOT-003**: Instrument approach logged without type and runway
   - *Regulation:* 14 CFR 61.51(g)
   - *Suggestion:* Include approach type (ILS, RNAV, etc.) and runway
```

## 🛠️ Development

### Building Locally

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

### Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/ashishjsharda/aviation-compliance-checker/issues)
- **Documentation**: [Wiki]https://github.com/ashishjsharda/aviation-compliance-checker/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/ashishjsharda/aviation-compliance-checker/discussions)

## ⚠️ Disclaimer

This tool is provided for informational purposes only and does not constitute legal or regulatory advice. Always consult with certified aviation professionals and refer to current FAA regulations for official compliance requirements.

## 🙏 Acknowledgments

Built with ❤️ for the aviation community by [Ashish Sharda](https://github.com/ashishjsharda/)

Regulations based on:
- [14 CFR Part 43](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-43)
- [14 CFR Part 61](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61)
- [14 CFR Part 91](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91)

---

**Made with ✈️ by pilots, for pilots**
