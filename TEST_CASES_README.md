# Medora App - Manual Test Cases Documentation

## Overview
This document provides comprehensive manual test cases for the Medora healthcare application across different testing levels.

## File Information
- **File Name**: `Medora_Manual_Test_Cases_Complete.csv`
- **Format**: CSV (Excel-compatible)
- **Total Test Cases**: 71
- **Last Updated**: May 22, 2026

## Test Case Distribution

### By Testing Level
| Testing Level | Count | Purpose |
|--------------|-------|---------|
| **Sanity** | 5 | Quick checks to verify basic functionality works |
| **Smoke** | 10 | Critical path testing for core features |
| **Regression** | 30 | Ensure existing features still work after changes |
| **Integration** | 15 | Test interaction between different modules |
| **Performance** | 3 | Verify system performance under load |
| **Security** | 5 | Validate security controls and protections |
| **Usability** | 3 | Ensure good user experience |

### By Priority
- **Critical**: 14 test cases
- **High**: 25 test cases
- **Medium**: 29 test cases
- **Low**: 3 test cases

### By Module
- **Authentication**: 15 test cases
- **Patient**: 12 test cases
- **Doctor**: 8 test cases
- **Hospital**: 6 test cases
- **Admin**: 10 test cases
- **Security**: 8 test cases
- **Frontend-Backend Integration**: 5 test cases
- **End-to-End**: 4 test cases
- **API**: 3 test cases

## CSV Structure

The CSV file contains the following columns:

1. **Test Case ID**: Unique identifier (e.g., TC_SANITY_001)
2. **Test Level**: Testing level (Sanity, Smoke, Regression, etc.)
3. **Module**: Application module being tested
4. **Feature**: Specific feature within the module
5. **Test Scenario**: Brief description of what is being tested
6. **Test Steps**: Detailed steps to execute the test (separated by |)
7. **Test Data**: Input data required for the test
8. **Expected Result**: What should happen when test passes
9. **Priority**: Test case priority (Critical, High, Medium, Low)
10. **Status**: Current execution status (Not Executed by default)

## How to Use in Excel

### Opening the File
1. Open Microsoft Excel
2. Go to File > Open
3. Navigate to `c:\workspace\medora-app`
4. Select `Medora_Manual_Test_Cases_Complete.csv`
5. Click Open

### Recommended Excel Formatting
1. **Apply Filters**: Select header row, click Data > Filter
2. **Wrap Text**: Select columns C-H, right-click > Format Cells > Alignment > Wrap Text
3. **Adjust Column Widths**:
   - Column A (Test Case ID): 18
   - Column B (Test Level): 12
   - Column C (Module): 15
   - Column D (Feature): 15
   - Column E (Test Scenario): 30
   - Column F (Test Steps): 50
   - Column G (Test Data): 40
   - Column H (Expected Result): 40
   - Column I (Priority): 10
   - Column J (Status): 15
4. **Add Color Coding**:
   - Critical Priority: Red background
   - High Priority: Orange background
   - Medium Priority: Yellow background
   - Low Priority: Green background

### Adding Execution Details
You can add additional columns for test execution:
- **Actual Result**: What actually happened
- **Pass/Fail**: Test outcome
- **Executed By**: Tester name
- **Execution Date**: When test was run
- **Defect ID**: Link to any bugs found
- **Comments**: Additional notes

### Filtering Examples
- Show only Critical tests: Filter Priority = "Critical"
- Show Regression tests: Filter Test Level = "Regression"
- Show Patient module tests: Filter Module = "Patient"
- Show not executed tests: Filter Status = "Not Executed"

## Testing Levels Explained

### 1. Sanity Testing (5 cases)
**Purpose**: Quick verification that basic functionality works  
**When to Run**: After every build  
**Time Required**: ~15 minutes  
**Test Cases**: TC_SANITY_001 to TC_SANITY_005

Critical checks:
- API is running
- Basic login works
- Patient can view profile
- Doctor can create prescription
- Admin can view users

### 2. Smoke Testing (10 cases)
**Purpose**: Test critical paths of the application  
**When to Run**: Before detailed testing  
**Time Required**: ~30-45 minutes  
**Test Cases**: TC_SMOKE_001 to TC_SMOKE_010

Covers:
- User registration (Patient, Doctor, Hospital)
- Login and logout
- Basic CRUD operations for each role

### 3. Regression Testing (30 cases)
**Purpose**: Ensure existing features still work  
**When to Run**: After code changes, before release  
**Time Required**: ~3-4 hours  
**Test Cases**: TC_REGRESSION_001 to TC_REGRESSION_030

Covers:
- Negative scenarios
- Error handling
- Edge cases
- Security validations
- Authorization checks

### 4. Integration Testing (15 cases)
**Purpose**: Test interactions between components  
**When to Run**: After unit testing, before UAT  
**Time Required**: ~2-3 hours  
**Test Cases**: TC_INTEGRATION_001 to TC_INTEGRATION_015

Covers:
- End-to-end workflows
- Frontend-backend integration
- Cross-module interactions
- Data flow verification

### 5. Performance Testing (3 cases)
**Purpose**: Verify system performance  
**When to Run**: Before major releases  
**Time Required**: ~1-2 hours  
**Test Cases**: TC_PERFORMANCE_001 to TC_PERFORMANCE_003

Covers:
- Concurrent user logins
- Bulk operations
- Large dataset handling

### 6. Security Testing (5 cases)
**Purpose**: Validate security controls  
**When to Run**: Regularly, especially before release  
**Time Required**: ~1-2 hours  
**Test Cases**: TC_SECURITY_001 to TC_SECURITY_005

Covers:
- SQL injection protection
- XSS protection
- CORS policy
- Password encryption
- JWT token security

### 7. Usability Testing (3 cases)
**Purpose**: Ensure good user experience  
**When to Run**: After UI changes  
**Time Required**: ~30-45 minutes  
**Test Cases**: TC_USABILITY_001 to TC_USABILITY_003

Covers:
- Navigation
- Form validations
- Mobile responsiveness

## Test Execution Workflow

### Recommended Execution Order
1. **Sanity Tests** (5 tests) - Run first to verify build is testable
2. **Smoke Tests** (10 tests) - Run next to verify core functionality
3. **Regression Tests** (30 tests) - Comprehensive testing of all features
4. **Integration Tests** (15 tests) - End-to-end scenarios
5. **Performance Tests** (3 tests) - Load and performance verification
6. **Security Tests** (5 tests) - Security validation
7. **Usability Tests** (3 tests) - User experience validation

### Test Cycle Estimation
- **Quick Smoke**: ~1 hour (Sanity + Smoke)
- **Standard Cycle**: ~6-8 hours (Sanity + Smoke + Regression)
- **Complete Cycle**: ~10-12 hours (All tests)

## Module-Specific Test Cases

### Authentication Module (15 tests)
- Registration flows (Patient, Doctor, Hospital)
- Login scenarios (valid, invalid, empty)
- Logout functionality
- JWT token validation
- Security tests (SQL injection, XSS)

### Patient Module (12 tests)
- Profile management
- Appointment booking
- Appointment viewing and cancellation
- Prescription viewing
- Authorization checks

### Doctor Module (8 tests)
- Prescription creation
- Prescription viewing
- Patient prescription history
- Authorization validations

### Hospital Module (6 tests)
- Doctor management
- Doctor approval/rejection
- Status-based filtering

### Admin Module (10 tests)
- User management
- Hospital management
- Patient management
- Doctor management
- View and verification operations

## Key Features Tested

### 1. User Management
- Registration for all user types
- Login/logout
- Profile operations
- Role-based access control

### 2. Appointment Management
- Booking appointments
- Viewing appointments
- Cancelling appointments
- Concurrent booking handling

### 3. Prescription Management
- Creating prescriptions
- Viewing prescriptions
- Patient-doctor prescription linking

### 4. Authorization & Security
- Role-based access control
- JWT token validation
- SQL injection protection
- XSS protection
- Password encryption

### 5. Data Integrity
- Cross-module data consistency
- Cascade operations
- Error handling

## Notes for Testers

### Test Data Requirements
- Valid patient credentials: patient1 / password123
- Valid doctor credentials (after registration and approval)
- Valid hospital credentials
- Admin credentials for admin tests

### Environment Setup
- Backend API running on http://localhost:8080
- Frontend running on http://localhost:4200
- Database with test data loaded (test-data.sql)

### Common Issues to Watch For
- JWT token expiration (tokens expire after set time)
- Doctor approval required before doctor operations
- Appointment date/time must be in future
- Cross-origin requests (CORS)
- Concurrent booking conflicts

### Test Data Management
- Create test users for each role before testing
- Clean up test data between test cycles
- Use consistent test data for regression testing
- Backup database before large-scale testing

## Defect Tracking

When a test fails, document:
1. **Test Case ID**: Which test failed
2. **Steps to Reproduce**: Exact steps that led to failure
3. **Expected Result**: What should have happened
4. **Actual Result**: What actually happened
5. **Screenshots**: Visual evidence
6. **Console Logs**: Any error messages
7. **Environment**: Browser, OS, API version

## Maintenance

### Updating Test Cases
- Review and update test cases after each release
- Add new test cases for new features
- Remove obsolete test cases
- Update test data as application evolves

### Version Control
- Keep test cases in version control
- Track changes to test scenarios
- Document updates in commit messages

## Contact & Support

For questions about test cases or testing strategy:
- Review API documentation: `backend/app/API_IMPLEMENTATION.md`
- Check TODO list: `backend/TODO.md`
- Refer to development guide: `frontend/DEVELOPMENT.md`

---

**Document Version**: 1.0  
**Created**: May 22, 2026  
**Author**: Test Automation Team  
**Status**: Active
