import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import { ComplianceChecker, CheckOptions } from './checker';

async function run(): Promise<void> {
  try {
    // Get inputs
    const filesInput = core.getInput('files');
    const checkMaintenanceLogs = core.getInput('check-maintenance-logs') === 'true';
    const checkPilotLogs = core.getInput('check-pilot-logs') === 'true';
    const checkAirworthiness = core.getInput('check-airworthiness') === 'true';
    const checkWeightBalance = core.getInput('check-weight-balance') === 'true';
    const failOnViolation = core.getInput('fail-on-violation') === 'true';
    const githubToken = core.getInput('github-token');

    core.info('🛫 Starting Aviation Compliance Check...');
    core.info(`Files pattern: ${filesInput}`);

    // Parse file patterns
    const filePatterns = filesInput.split(',').map(p => p.trim());

    // Create checker with options
    const options: CheckOptions = {
      checkMaintenanceLogs,
      checkPilotLogs,
      checkAirworthiness,
      checkWeightBalance
    };

    const checker = new ComplianceChecker(options);

    // Run compliance check
    const report = await checker.checkFiles(filePatterns);

    // Generate reports
    const markdownReport = checker.generateMarkdownReport(report);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'aviation-compliance-report.md');
    fs.writeFileSync(reportPath, markdownReport);
    core.info(`📄 Report saved to: ${reportPath}`);

    // Output results
    core.setOutput('violations-found', report.totalViolations);
    core.setOutput('compliance-status', report.violationsBySeverity.error > 0 ? 'FAIL' : 'PASS');
    core.setOutput('report-path', reportPath);

    // Log summary
    core.info('\n' + report.summary);

    // Post PR comment if in PR context
    if (github.context.payload.pull_request && githubToken) {
      await postPRComment(githubToken, markdownReport);
    }

    // Display detailed violations
    if (report.totalViolations > 0) {
      core.startGroup('📋 Compliance Violations');
      
      report.fileResults.forEach(fileResult => {
        if (fileResult.violations.length > 0) {
          core.info(`\n📄 ${fileResult.filename} (${fileResult.status})`);
          
          fileResult.violations.forEach(violation => {
            const icon = violation.severity === 'error' ? '❌' : 
                        violation.severity === 'warning' ? '⚠️' : 'ℹ️';
            
            const message = `${icon} [${violation.ruleId}] ${violation.message}`;
            
            if (violation.severity === 'error') {
              core.error(message, {
                file: fileResult.filename,
                title: violation.regulation
              });
            } else if (violation.severity === 'warning') {
              core.warning(message, {
                file: fileResult.filename,
                title: violation.regulation
              });
            } else {
              core.notice(message, {
                file: fileResult.filename,
                title: violation.regulation
              });
            }

            if (violation.suggestion) {
              core.info(`   💡 Suggestion: ${violation.suggestion}`);
            }
          });
        }
      });
      
      core.endGroup();
    }

    // Fail if configured and violations found
    if (failOnViolation && report.violationsBySeverity.error > 0) {
      core.setFailed(`❌ Found ${report.violationsBySeverity.error} compliance error(s)`);
    } else if (report.violationsBySeverity.error === 0 && report.totalViolations === 0) {
      core.info('✅ All files passed aviation compliance checks!');
    } else {
      core.info(`⚠️ Found ${report.totalViolations} violation(s), but not failing due to configuration`);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed: ${error.message}`);
    } else {
      core.setFailed('Action failed with unknown error');
    }
  }
}

async function postPRComment(token: string, markdown: string): Promise<void> {
  try {
    const octokit = github.getOctokit(token);
    const context = github.context;

    if (!context.payload.pull_request) {
      return;
    }

    const { owner, repo } = context.repo;
    const pull_number = context.payload.pull_request.number;

    // Check if we've already commented
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
    });

    const botComment = comments.find(
      comment => comment.user?.type === 'Bot' && 
                 comment.body?.includes('Aviation Compliance Report')
    );

    const commentBody = `${markdown}\n\n<sub>Last updated: ${new Date().toISOString()}</sub>`;

    if (botComment) {
      // Update existing comment
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: botComment.id,
        body: commentBody,
      });
      core.info('💬 Updated existing PR comment');
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: commentBody,
      });
      core.info('💬 Posted PR comment');
    }
  } catch (error) {
    core.warning(`Failed to post PR comment: ${error}`);
  }
}

run();
