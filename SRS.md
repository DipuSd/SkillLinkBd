# 🧑‍🔧 Local Skill & Microjob Matchup System  
### Software Requirements Specification (SRS)

---

## 1. Introduction

### 1.1 Purpose
This document describes the full Software Requirements Specification (SRS) for the **Local Skill & Microjob Matchup System**, a web-based platform that connects local skilled workers (providers) with clients who need short-term jobs or services in Bangladesh.  

The platform ensures job visibility, transparent hiring, secure communication, rule-based job matching, and administrative moderation to maintain trust and safety.

---

### 1.2 Scope
The system enables:
- **Providers** to register, showcase skills, and apply for microjobs.  
- **Clients** to post, manage, and review local job opportunities.  
- **Admins** to monitor activity, manage users, and handle misconduct reports.

Core modules:
- Job & provider recommendation engine  
- Role-based dashboards  
- Job posting, application, and management  
- Real-time chat & notifications  
- Rating, review, and reporting system  
- Admin moderation (ban/suspend users)  

The project will include a **React (Tailwind)** frontend, **Node.js (Express)** backend, and **MongoDB or PostgreSQL** database.

---

### 1.3 Overview
Main roles:
1. **Client** – Posts and manages job listings, hires providers, and provides reviews.  
2. **Provider** – Applies for suitable jobs, manages tasks, and tracks earnings.  
3. **Admin** – Monitors the platform, manages user reports, and enforces rules.

---

## 2. System Description

### 2.1 Background
Bangladesh’s informal labor force includes millions of workers skilled in fields like plumbing, tailoring, tuition, design, and repair — yet they lack access to structured digital job marketplaces.  
This system provides a digital bridge to connect these workers with local clients efficiently and transparently.

---

### 2.2 Problem Statement
Challenges include:
- Skilled individuals lack consistent job opportunities.  
- Clients struggle to find trusted local providers.  
- No structured platform ensures reliability or fairness.  
- No existing system manages user misconduct or fraud.

**Solution:**  
A web-based system connecting clients and providers through skill- and location-based matching, with rating, reporting, and admin moderation features.

---

### 2.3 Motivation
- Empower local workforce with digital access.  
- Simplify microjob hiring and management.  
- Promote transparency through ratings and reporting.  
- Provide real-world, scalable, and portfolio-worthy web application experience.

---

## 3. System Features

### 3.1 Recommendation Engine
- Suggests jobs to providers and providers to clients based on skills, distance, and previous interactions.  
- Uses deterministic rules and profile data; no external machine-learning services are required.

### 3.2 Role-Based Dashboards
- **Provider Dashboard:** Job recommendations, applied jobs, earnings, and reviews.  
- **Client Dashboard:** Posted jobs, applicants, and spending summary.  
- **Admin Dashboard:** Platform stats, user reports, and moderation tools.

### 3.3 Real-Time Chat and Notifications
- In-app messaging between providers and clients after application or hire.  
- Notifications for job updates, messages, and important alerts.

### 3.4 Ratings and Reviews
- Clients can rate providers after job completion.  
- Ratings affect provider visibility and credibility.

### 3.5 User Reporting & Admin Moderation
- Clients and providers can **report** suspicious or abusive users.  
- Reports include reason, description, and optional evidence (text or file).  
- Admins can **review**, **warn**, **suspend**, or **ban** users.  
- System logs report details for accountability.

### 3.6 Job Management System
- Job lifecycle: **Open → In Progress → Completed → Reviewed**.  
- Clients can edit or cancel open jobs.  
- Providers can mark tasks as completed.

### 3.7 Direct Invitations
- Clients can search the provider catalog and send invite-only job requests without publishing a listing.
- Providers review, accept/decline, work, and close these invitations from a dedicated workspace.

---

## 4. Functional Requirements

| **ID** | **Requirement** | **Description** |
|--------|------------------|----------------|
| FR-1 | **User Registration & Authentication** | Secure signup/login for Clients, Providers, and Admins with JWT authentication and password encryption. |
| FR-2 | **Profile Management** | Users can update name, skills, location, photo, and contact details. Providers list multiple skills. |
| FR-3 | **Job Posting & Management** | Clients create, edit, and manage job listings with title, description, location, skill, duration, and budget. |
| FR-4 | **Job Application & Hiring** | Providers apply to jobs; clients review applicants and hire based on profile and ratings. |
| FR-5 | **Recommendation Engine** | System recommends best matches using skills, distance, and history heuristics. |
| FR-6 | **Chat System** | Real-time communication between clients and providers after job application or hire. |
| FR-7 | **Notifications System** | Real-time notifications for job updates, chat messages, ratings, and admin actions. |
| FR-8 | **Rating & Review System** | Clients leave reviews post-job; providers can view average rating in profile. |
| FR-9 | **User Reporting System** | Clients and providers can report users; reports stored for admin review. |
| FR-10 | **Admin Moderation** | Admin can review reports, suspend or ban users, and issue warnings. |
| FR-11 | **Dashboard Visualization** | Displays jobs, earnings, performance stats, and user activity per role. |

---

## 5. Non-Functional Requirements

| **ID** | **Requirement** | **Description** |
|--------|------------------|----------------|
| NFR-1 | **Usability** | Intuitive, mobile-responsive interface using Tailwind CSS. |
| NFR-2 | **Performance** | Optimize queries and API responses; load main pages in under 3 seconds. |
| NFR-3 | **Security** | Passwords hashed, JWT auth, input validation, and rate limiting. |
| NFR-4 | **Scalability** | Backend supports 1000+ concurrent users. |
| NFR-5 | **Reliability** | Database redundancy and error handling for uptime >99%. |
| NFR-6 | **Maintainability** | Modular structure for easy updates and feature extensions. |
| NFR-7 | **Localization** | English & Bangla language support. |
| NFR-8 | **Data Privacy** | No personal data exposed publicly; users control visibility. |

---

## 6. Database Design (Simplified)

### **User Table**
- user_id (PK)  
- name  
- email  
- password (hashed)  
- role (client/provider/admin)  
- location  
- skills (array for providers)  
- rating (float)  
- is_banned (boolean)  
- created_at  

### **Job Table**
- job_id (PK)  
- client_id (FK → User)  
- title  
- description  
- required_skill  
- budget  
- duration  
- location  
- status (open/in-progress/completed)  
- created_at  

### **Application Table**
- application_id (PK)  
- job_id (FK)  
- provider_id (FK)  
- proposal_message  
- status (applied/hired/completed)  
- applied_at  

### **Chat Table**
- chat_id (PK)  
- sender_id (FK)  
- receiver_id (FK)  
- message  
- timestamp  

### **Review Table**
- review_id (PK)  
- job_id (FK)  
- client_id (FK)  
- provider_id (FK)  
- rating  
- comment  
- created_at  

### **Report Table**
- report_id (PK)  
- reporter_id (FK → User)  
- reported_user_id (FK → User)  
- reason (string)  
- description (text)  
- evidence_url (optional)  
- status (pending/resolved/rejected)  
- action_taken (warning/suspend/ban)  
- reviewed_by (admin_id)  
- created_at  

---

## 7. Frontend Module Overview

1. **Landing Page** – Hero, how it works, top skills, testimonials.  
2. **Auth Pages** – Login, Register (Client/Provider), Forgot Password.  
3. **Client Dashboard** – Post job, manage applicants, view analytics.  

## 9. Technologies

| Layer | Technology |
|-------|-------------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js (Express.js) |
| Database | MongoDB or PostgreSQL |
| Auth | JWT (JSON Web Token) |
| Recommendation Engine | Rule-based matching (skills, history) |
| Deployment | Vercel / Render / Railway |

---

## 10. Expected Outcome
- Secure, functional web platform connecting clients and local providers.  
- Job matching, rating, and communication features.  
- Fully functional admin moderation system for trust and safety.  
- A project with real-world depth and scalability suitable for academic grading and portfolios.

---

## 11. Future Enhancements
- Payment integration (bKash/Nagad).  
- Mobile app (React Native).  
- Skill verification and identity badges.  
- Machine learning–based provider reputation scoring.

---

**End of Document**
