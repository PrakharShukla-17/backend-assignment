# Waygood Backend Assignment

**Submitted By:** Prakhar Shukla
**College:** Institute of Engineering and Technology (IET), Lucknow

---

# Overview

This project is a backend implementation for a study-abroad platform that helps students:

* Discover universities and programs
* Receive personalized program recommendations
* Manage university applications
* Track application progress
* Receive AI-powered shortlist summaries

The implementation focuses on secure authentication, MongoDB aggregation pipelines, application workflow management, caching, performance optimization, authorization, and automated testing.

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* Jest
* Supertest
* OpenRouter (LLM Integration)

---

# Setup Instructions

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=
MONGODB_URI_TEST=

JWT_SECRET=
JWT_EXPIRES_IN=7d

CACHE_TTL_SECONDS=300

OPENROUTER_API_KEY=
```

---

## Start Development Server

```bash
npm run dev
```

---

## Seed Database

Populate development database:

```bash
npm run seed
```

Populate test database:

```bash
npm run seed:test
```

---

## Run Tests

```bash
npm test
```

---

# Sample Credentials

After running the seed script:

```text
aarav@example.com / Candidate123!
sara@example.com / Candidate123!
counselor@example.com / Candidate123!
```

---

# API Features

## Authentication

### Endpoints

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Features

* JWT-based authentication
* Password hashing using bcrypt
* Protected profile endpoint
* Student and counselor role support
* Duplicate email prevention
* Input validation

---

## University Discovery

### Endpoint

```text
GET /api/universities
```

### Features

* Country filtering
* Partner type filtering
* Scholarship filtering
* Search support
* Pagination
* Sorting

### Popular Universities

```text
GET /api/universities/popular
```

Cached for improved performance.

---

## Program Discovery

### Endpoint

```text
GET /api/programs
```

### Filters

* Country
* Degree level
* Field
* Intake
* Budget
* Scholarship availability
* Search query

### Sorting

* Relevance
* Tuition (Ascending)
* Tuition (Descending)

### Pagination

Pagination metadata included in responses.

---

## Recommendation Engine

### Endpoint

```text
GET /api/recommendations/:studentId
```

### Implementation

Recommendations are generated using MongoDB Aggregation Pipelines.

### Recommendation Factors

* Preferred country
* Field alignment
* Budget compatibility
* Preferred intake
* IELTS eligibility

### Returned Data

* Match score
* Matching reasons
* Ranked recommendations

---

## Application Workflow

### Create Application

```text
POST /api/applications
```

### Update Status

```text
PATCH /api/applications/:id/status
```

### Features

* Duplicate application prevention
* Intake validation
* Status transition validation
* Timeline/history tracking

### Supported Statuses

```text
draft
submitted
under-review
offer-received
visa-processing
enrolled
rejected
```

### Valid Status Transitions

```text
draft -> submitted

submitted -> under-review | rejected

under-review -> offer-received | rejected

offer-received -> visa-processing | rejected

visa-processing -> enrolled | rejected
```

Every status change automatically creates a timeline entry.

---

# Bonus Features

## AI-Powered Shortlist Summaries

### Endpoint

```text
GET /api/ai/shortlist-summary/:studentId
```

### Implementation

The endpoint combines:

* Student profile information
* Recommendation engine results
* Large Language Model (LLM) analysis through OpenRouter

The student's profile and recommended programs are sent to the LLM, which generates personalized guidance.

### AI Response Includes

* Personalized shortlist summary
* Program fit explanations
* Profile weaknesses
* Recommended next steps

### Example Response Structure

```json
{
  "success": true,
  "data": {
    "shortlistSummary": "...",
    "recommendations": [
      {
        "program": "...",
        "reason": "..."
      }
    ],
    "profileWeaknesses": [
      "..."
    ],
    "nextSteps": [
      "..."
    ]
  }
}
```

### Notes

* Uses OpenRouter-compatible models
* Returns structured JSON
* Frontend-friendly response format
* Handles missing API configuration gracefully

---

## Role-Based Authorization

Role-based access control was implemented using middleware.

### Supported Roles

```text
student
counselor
```

### Authorization Rules

Students can:

* Register
* Login
* Browse programs
* Receive recommendations
* Create applications

Counselors can:

* Update application statuses

This prevents students from modifying application workflow states.

---

## Rate Limiting

Global API rate limiting was added using `express-rate-limit`.

### Configuration

```text
100 requests per IP
15 minute window
```

### Benefits

* Protects login endpoints from brute-force attacks
* Prevents API abuse
* Improves production readiness

Exceeded limits return:

```text
429 Too Many Requests
```

---

# Assumptions & Design Decisions

## Application Uniqueness

Applications are considered unique by:

```text
(Student, Program, Intake)
```

This allows students to apply for different intake cycles of the same program while preventing duplicate submissions for the same intake.

---

## Recommendation Architecture

Recommendation scoring is performed inside MongoDB using aggregation pipelines.

Recommendation explanations are generated separately to keep aggregation focused on ranking and scoring.

---

## Intake Validation

Applications can only be created for intakes explicitly offered by the selected program.

---

## Authentication

Passwords are never stored in plaintext.

All passwords are hashed using bcrypt before persistence.

---

# Performance Optimizations

## Caching

The provided in-memory cache service was retained for simplicity.

### Cached Endpoints

```text
GET /api/universities/popular
GET /api/dashboard
```

### Tradeoff

For large-scale production deployments, Redis would be preferred because it supports:

* Distributed caching
* Shared cache across instances
* Persistence across restarts

---

## MongoDB Aggregation

Recommendations are generated using aggregation pipelines instead of application-side filtering.

Benefits:

* Reduced memory usage
* Reduced data transfer
* Improved scalability

---

## MongoDB Indexes

### Program Collection

Indexes:

```text
country
degreeLevel
field
tuitionFeeUsd
```

---

### University Collection

Search-related indexes:

```text
name
country
city
```

---

### Application Collection

Indexes:

```text
student
program
status
intake
```

### Compound Unique Constraint

```text
(student, program, intake)
```

Prevents duplicate applications.

---

# Testing

Automated tests were implemented using Jest and Supertest.

## Covered Flows

### Authentication

* User registration
* JWT generation validation

### Application Workflow

* Application creation
* Draft status initialization

### Edge Cases

* Duplicate application prevention

Run tests:

```bash
npm test
```

---

# Project Structure

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── scripts/
├── utils/
└── tests/
```

### Architecture Notes

* Controller-Service separation
* Middleware-based authentication and authorization
* MongoDB aggregation for recommendations
* Centralized error handling
* Reusable caching service
* AI integration isolated in dedicated service layer

---

# Future Improvements

* Redis-based distributed caching
* Dockerization
* CI/CD pipeline integration
* AI-powered SOP review
* Scholarship matching recommendations
* Multi-turn AI counseling assistant
* Advanced analytics dashboard
* Email notifications and reminders

---
