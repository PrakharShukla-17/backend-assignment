# Waygood Candidate Assignment

Submitted by: Prakhar Shukla
College: IET Lucknow



# Waygood Candidate Assignment

## Overview

This project is a backend implementation for a study-abroad platform that helps students discover universities and programs, receive personalized recommendations, manage applications, and track their application journey.

The implementation focuses on secure authentication, advanced program discovery, MongoDB aggregation pipelines, application workflow management, caching, performance optimization, and automated testing.

---

## Setup Instructions

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Start the development server:

```bash
npm run dev
```

---

## Seed Data

Populate the development database with sample data:

```bash
npm run seed
```

Populate the test database:

```bash
npm run seed:test
```

---

## Running Tests

```bash
npm test
```

---

## Environment Variables

```env
MONGODB_URI=
MONGODB_URI_TEST=
JWT_SECRET=
JWT_EXPIRES_IN=
CACHE_TTL_SECONDS=
PORT=
```

---

## Sample Credentials

After running the seed script:

```text
aarav@example.com / Candidate123!
sara@example.com / Candidate123!
counselor@example.com / Candidate123!
```

---

# Implemented Features

## Authentication

Implemented secure authentication using JWT and bcrypt.

Endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Features:

* JWT-based authentication
* Password hashing using bcrypt
* Protected profile endpoint
* Student and counselor role support
* Input validation and duplicate email prevention

---

## University Discovery

Implemented filtering, sorting, search, and pagination.

Supported filters:

* Country
* Partner Type
* Scholarship Availability
* Search Query

Supported sorting:

* Popularity
* Ranking
* Name

Pagination metadata included in responses.

---

## Program Discovery

Implemented advanced filtering and pagination.

Supported filters:

* Country
* Degree Level
* Field
* Intake
* Budget / Tuition Fee
* Scholarship Availability
* Search Query

Supported sorting:

* Relevance
* Tuition Ascending
* Tuition Descending

Pagination metadata included in responses.

---

## Recommendation Engine

Implemented recommendations using MongoDB Aggregation Pipelines.

Recommendation factors:

* Preferred country
* Field of interest alignment
* Budget compatibility
* Preferred intake availability
* IELTS requirement eligibility

Recommendations return:

* Match score
* Matching reasons
* Top-ranked programs

Aggregation is used for scoring and ranking while recommendation explanations are generated in the application layer.

---

## Application Workflow

Implemented:

```text
POST  /api/applications
PATCH /api/applications/:id/status
```

Features:

* Duplicate application prevention
* Intake validation
* Status transition validation
* Timeline/history tracking

Supported statuses:

```text
draft
submitted
under-review
offer-received
visa-processing
enrolled
rejected
```

Valid transitions:

```text
draft -> submitted

submitted -> under-review | rejected

under-review -> offer-received | rejected

offer-received -> visa-processing | rejected

visa-processing -> enrolled | rejected
```

Every status change automatically creates a timeline entry for auditing and progress tracking.

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

Reasons for recommendations are generated in the application layer to keep aggregation logic focused on filtering, ranking, and scoring.

---

## Intake Validation

Students can only create applications for intakes explicitly offered by the selected program.

---

## Authentication

Passwords are never stored in plaintext.

All passwords are hashed using bcrypt before persistence.

---

# Performance Optimizations

## Caching Strategy

The provided in-memory cache service was retained for simplicity and ease of local setup.

Cached endpoints:

```text
GET /api/universities/popular
GET /api/dashboard
```

Cache responses include hit/miss metadata for easier debugging and verification.

### Tradeoff

For a production-scale deployment, Redis would be preferred because cached data could be shared across multiple backend instances and survive application restarts.

---

## MongoDB Aggregation

Program recommendations use MongoDB aggregation pipelines to perform scoring and ranking within the database instead of transferring large datasets to the application layer.

This reduces unnecessary application-side processing.

---

## MongoDB Indexes

### Program

Index:

```text
country
degreeLevel
field
tuitionFeeUsd
```

Optimizes program discovery queries.

---

### University

Text Index:

```text
name
country
city
```

Optimizes search functionality.

---

### Application

Indexes:

```text
student
program
status
intake
```

Used for application lookups and filtering.

Compound Unique Index:

```text
(student, program, intake)
```

Prevents duplicate applications while allowing applications across different intake cycles.

---

# Testing

Automated tests were added using Jest and Supertest.

Covered flows:

### Authentication

* User registration
* JWT generation validation

### Application Workflow

* Application creation
* Draft status initialization

### Edge Cases

* Duplicate application prevention

Run tests using:

```bash
npm test
```

---

# Future Improvements

Potential enhancements:

* Redis-based distributed caching
* Role-based authorization middleware
* AI-assisted study planning
* Advanced recommendation scoring and weighting
* Rate limiting and API security enhancements
* Docker support
* CI/CD integration
* Recommendation explanation enrichment
* Analytics dashboards for counselors

---

## Architecture Notes

The project follows a layered structure:

```text
controllers/
services/
middleware/
models/
routes/
utils/
```

Key architectural decisions:

* Business logic separated from routing
* MongoDB aggregation used for recommendation scoring
* Middleware-based authentication
* Centralized error handling
* Reusable in-memory caching service
* Automated tests covering critical workflows

```
```
