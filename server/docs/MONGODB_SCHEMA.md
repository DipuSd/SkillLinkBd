# MongoDB Schema

This document outlines the collections used by the SkillLinkBD backend, the fields stored in each collection, and the relationships between them. All collections follow MongoDB’s default `_id` ObjectId primary key.

## Users (`users`)
Stores authentication credentials and profile information for every account.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK | Unique identifier |
| `name` | String | Required | Full name |
| `email` | String | Required, unique, lowercase | Login email |
| `password` | String | Required, hashed | Bcrypt hash (read-protected) |
| `role` | String | Enum: `client`, `provider`, `admin` | Role-based access |
| `location` | String | Optional | Service area |
| `skills` | Array[String] | Optional | Provider skill tags |
| `avatarUrl` | String | Optional | Profile image |
| `phone` | String | Optional | Contact number |
| `bio` | String | Optional, ≤ 500 chars | Profile summary |
| `experienceYears` | Number | Default 0 | Provider experience |
| `hourlyRate` | Number | Default 0 | Provider rate |
| `rating` | Number | Default 0 | Average rating |
| `totalRatings` | Number | Default 0 | Count of reviews |
| `completedJobs` | Number | Default 0 | Jobs completed |
| `postedJobs` | Number | Default 0 | Jobs posted by client |
| `status` | String | Enum: `active`, `suspended`, `banned` | Moderation state |
| `isBanned` | Boolean | Default false | Mirrors banned state |
| `lastLoginAt` | Date | Optional | Last successful login |
| `createdAt` | Date | Auto | Document creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**
- `{ role: 1, status: 1 }`
- `{ skills: 1 }`
- Unique index on `email`

## Jobs (`jobs`)
Represents microjobs posted by clients.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `client` | ObjectId | Required, FK → `users` | Job owner |
| `assignedProvider` | ObjectId | Optional, FK → `users` | Hired provider |
| `title` | String | Required |
| `description` | String | Required |
| `requiredSkill` | String | Required | Primary skill tag |
| `budget` | Number | Required ≥ 0 |
| `duration` | String | Optional | Estimated duration |
| `location` | String | Optional |
| `status` | String | Enum: `open`, `in-progress`, `completed`, `cancelled` |
| `applicantCount` | Number | Default 0 | Applicant total |
| `hiredApplication` | ObjectId | Optional, FK → `applications` | Accepted application |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ client: 1, status: 1 }`
- `{ assignedProvider: 1, status: 1 }`
- Text index on `{ title: "text", description: "text" }`

## Direct Jobs (`directjobs`)
Private, invite-only jobs initiated directly between a client and a provider.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `client` | ObjectId | Required, FK → `users` |
| `provider` | ObjectId | Required, FK → `users` |
| `title` | String | Required |
| `description` | String | Required |
| `budget` | Number | Optional ≥ 0 |
| `location` | String | Optional |
| `preferredDate` | Date | Optional |
| `notes` | String | Optional |
| `status` | String | Enum: `requested`, `in-progress`, `completed`, `declined`, `cancelled` |
| `completedAt` | Date | Optional |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ client: 1, status: 1 }`
- `{ provider: 1, status: 1 }`

## Applications (`applications`)
Tracks provider applications for jobs.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `job` | ObjectId | Required, FK → `jobs` |
| `provider` | ObjectId | Required, FK → `users` |
| `client` | ObjectId | Required, FK → `users` | Redundant for faster queries |
| `message` | String | Optional | Proposal message |
| `proposedBudget` | Number | Optional ≥ 0 |
| `status` | String | Enum: `applied`, `shortlisted`, `hired`, `completed`, `rejected`, `withdrawn` |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- Compound `{ job: 1, provider: 1 }` (unique to prevent duplicates)
- `{ job: 1 }`, `{ provider: 1 }`, `{ client: 1 }`, `{ status: 1 }`

## Conversations (`conversations`)
Metadata for chat conversations.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `participants` | Array[ObjectId] | Required, FK → `users`, size 2 | Conversation members |
| `job` | ObjectId | Optional, FK → `jobs` | Associated job |
| `lastMessage` | ObjectId | Optional, FK → `messages` |
| `unreadCount` | Map<String, Number> | Default `{}` | Per-user unread counters |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ participants: 1 }`
- `{ updatedAt: -1 }`

## Messages (`messages`)
Individual chat records.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `conversation` | ObjectId | Required, FK → `conversations` |
| `sender` | ObjectId | Required, FK → `users` |
| `body` | String | Required |
| `readBy` | Array[ObjectId] | Optional | IDs of users who read message |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ conversation: 1, createdAt: 1 }`

## Notifications (`notifications`)
Stores in-app notification events.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `recipient` | ObjectId | Required, FK → `users` |
| `title` | String | Required |
| `body` | String | Required |
| `type` | String | Enum: `info`, `accept`, `reject` |
| `link` | String | Optional | Deep link |
| `metadata` | Mixed | Optional | Additional payload |
| `isRead` | Boolean | Default false |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ recipient: 1, createdAt: -1 }`
- `{ recipient: 1, isRead: 1 }`

## Reviews (`reviews`)
Client feedback for completed jobs.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `job` | ObjectId | Required, FK → `jobs` |
| `client` | ObjectId | Required, FK → `users` |
| `provider` | ObjectId | Required, FK → `users` |
| `reviewerRole` | String | Enum: `client`, `provider` | Indicates who submitted the review |
| `rating` | Number | Required 1–5 |
| `comment` | String | Optional ≤ 500 chars |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ provider: 1, createdAt: -1, reviewerRole: 1 }`
- `{ job: 1, reviewerRole: 1 }` (unique, one review per direction per job)

## Reports (`reports`)
Moderation reports filed by users.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `_id` | ObjectId | PK |
| `reporter` | ObjectId | Required, FK → `users` |
| `reportedUser` | ObjectId | Required, FK → `users` |
| `job` | ObjectId | Optional, FK → `jobs` |
| `directJob` | ObjectId | Optional, FK → `directjobs` |
| `reason` | String | Required |
| `description` | String | Required |
| `evidenceUrl` | String | Optional |
| `status` | String | Enum: `pending`, `resolved`, `rejected` |
| `actionTaken` | String | Enum: `warning`, `suspend`, `ban`, null |
| `reviewedBy` | ObjectId | Optional, FK → `users` |
| `createdAt`, `updatedAt` | Date | Auto |

**Indexes**
- `{ reporter: 1 }`
- `{ reportedUser: 1 }`
- `{ status: 1, createdAt: -1 }`

## Relationships Overview

- **User ↔ Job**: `jobs.client` references the client account. `jobs.assignedProvider` references the hired provider.
- **User ↔ Application**: `applications.provider` and `applications.client` map the applicant and job owner.
- **Job ↔ Application**: One job can have many applications; `applications.job` stores the FK.
- **Job ↔ Review**: Reviews are unique per job/client pair and update provider ratings.
- **User ↔ Conversation/Message**: `conversations.participants` and `messages.sender` link chat participants.
- **User ↔ Notification/Report**: Recipients and moderation actors tie to accounts.

Use `mongoose` models from `server/src/models` when interacting with these collections to benefit from schema validation and helper methods (password hashing, rating recalculation, etc.).
