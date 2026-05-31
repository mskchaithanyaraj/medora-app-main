# Medora App - Test Cases Quick Reference

## 📊 Overview
- **Total Test Cases**: 71
- **File**: `Medora_Manual_Test_Cases_Complete.csv`
- **Format**: Excel-compatible CSV

## 📋 Test Distribution

### By Testing Level
| Level | Count | Description |
|-------|-------|-------------|
| Sanity | 5 | Basic functionality verification |
| Smoke | 10 | Critical path testing |
| Regression | 30 | Ensure existing features work |
| Integration | 15 | Component interaction testing |
| Performance | 3 | Load and performance tests |
| Security | 5 | Security validation |
| Usability | 3 | User experience testing |

### By Priority
- **Critical**: 12 (Must execute before release)
- **High**: 25 (Important for quality)
- **Medium**: 28 (Should be tested)
- **Low**: 6 (Nice to have)

## 🎯 Quick Start

### 1. Open in Excel
```
File > Open > Select "Medora_Manual_Test_Cases_Complete.csv"
```

### 2. Recommended Execution Order
1. Sanity Tests (TC_SANITY_001 to TC_SANITY_005)
2. Smoke Tests (TC_SMOKE_001 to TC_SMOKE_010)
3. Regression Tests (TC_REGRESSION_001 to TC_REGRESSION_030)
4. Integration Tests (TC_INTEGRATION_001 to TC_INTEGRATION_015)
5. Performance Tests (TC_PERFORMANCE_001 to TC_PERFORMANCE_003)
6. Security Tests (TC_SECURITY_001 to TC_SECURITY_005)
7. Usability Tests (TC_USABILITY_001 to TC_USABILITY_003)

### 3. Time Estimates
- **Quick Smoke**: ~1 hour (Sanity + Smoke)
- **Standard Cycle**: ~6-8 hours (Sanity + Smoke + Regression)
- **Full Cycle**: ~10-12 hours (All tests)

## 🔍 Test Case Format

Each test case includes:
- **Test Case ID**: Unique identifier (e.g., TC_SANITY_001)
- **Test Level**: Testing category
- **Module**: Application module (Authentication, Patient, Doctor, etc.)
- **Feature**: Specific feature being tested
- **Test Scenario**: What is being verified
- **Test Steps**: How to execute the test (steps separated by |)
- **Test Data**: Required input data
- **Expected Result**: What should happen
- **Priority**: Test importance level
- **Status**: Execution status

## 📦 Module Coverage

### Authentication (15 tests)
- User registration (Patient, Doctor, Hospital)
- Login/logout functionality
- Security validations

### Patient (12 tests)
- Profile management
- Appointment booking/viewing
- Prescription viewing

### Doctor (8 tests)
- Prescription creation
- Patient prescription history
- Authorization checks

### Hospital (6 tests)
- Doctor management
- Approval/rejection workflows

### Admin (10 tests)
- User management
- Hospital/Patient/Doctor viewing

### Security (8 tests)
- SQL injection protection
- XSS protection
- CORS policy
- JWT validation

## 🛠️ Excel Tips

### Apply Filters
```
Select header row → Data tab → Filter
```

### Add Execution Columns
Add these columns after Status:
- Actual Result
- Pass/Fail
- Executed By
- Execution Date
- Defect ID
- Comments

### Color Code Priority
- Critical → Red background
- High → Orange background
- Medium → Yellow background
- Low → Green background

### Filter Examples
- Show Critical tests: `Filter Priority = "Critical"`
- Show Regression: `Filter Test Level = "Regression"`
- Show Patient tests: `Filter Module = "Patient"`

## 🔐 Test Prerequisites

### Environment
- Backend API: http://localhost:8080
- Frontend: http://localhost:4200
- Database with test data loaded

### Test Users
- Patient: patient1 / password123
- Doctor: (register and get approved)
- Hospital: (register via API)
- Admin: (default admin credentials)

## ⚡ Critical Test Cases (Must Execute)

### Sanity Level (5 tests)
- TC_SANITY_001: API health check
- TC_SANITY_002: Basic login
- TC_SANITY_003: Patient profile view
- TC_SANITY_004: Doctor prescription create
- TC_SANITY_005: Admin view users

### Integration Critical (4 tests)
- TC_INTEGRATION_001: Complete patient journey
- TC_INTEGRATION_002: Complete doctor journey
- TC_INTEGRATION_003: Complete hospital journey
- TC_INTEGRATION_004: Complete admin journey
- TC_INTEGRATION_008: Role-based access verification

### Security Critical (2 tests)
- TC_SECURITY_001: SQL injection protection
- TC_SECURITY_004: Password encryption

## 📈 Test Execution Tracking

### Status Values
- **Not Executed**: Test not yet run
- **Passed**: Test executed successfully
- **Failed**: Test did not meet expected results
- **Blocked**: Cannot execute due to dependency
- **In Progress**: Currently being executed

### Defect Severity
- **Critical**: System crash, data loss
- **High**: Major functionality broken
- **Medium**: Feature partially working
- **Low**: Minor issue, cosmetic

## 📞 Support

- API Documentation: `backend/app/API_IMPLEMENTATION.md`
- Development Guide: `frontend/DEVELOPMENT.md`
- Detailed Test Guide: `TEST_CASES_README.md`

---

**Version**: 1.0  
**Date**: May 22, 2026  
**Status**: Active
