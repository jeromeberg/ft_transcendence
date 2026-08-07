# Database Schema

**PK**: Primary Key – **FK**: Foreign Key – **Cascade delete**: record is automatically deleted when the referenced record is deleted. – **?** Optional

### User

| **Field**             | **Type**                        |
|-----------------------|---------------------------------|
| id                    | Integer PK                      |
| username              | String, unique                  |
| email                 | String?, unique                 |
| role                  | Enum (USER, MOD)                |
| passwordHash          | String?                         |
| avatarUrl             | String?                         |
| bio                   | String?                         |
| language              | Enum (EN, FR, ES)               |
| status                | Enum (ONLINE, IN_GAME, OFFLINE) |
| createdAt / updatedAt | DateTime                        |

### OAuthAccount

| **Field**  | **Type**   |
|------------|------------|
| id         | Integer PK                          |
| provider   | Enum (GOOGLE, QuaranteDeux, GITHUB) |
| providerId | String                              |
| userId     | FK → User (cascade delete)          |

Unique on `(provider, providerId)`.

### Achievement

| **Field**   | **Type**       |
|-------------|----------------|
| id          | Integer PK     |
| key         | String, unique |
| label       | String         |
| description | String         |
| icon        | String?        |

### UserAchievement

| **Field**     | **Type**                          |
|---------------|-----------------------------------|
| id            | Integer PK                        |
| userId        | FK → User (cascade delete)        |
| achievementId | FK → Achievement (cascade delete) |
| unlockedAt    | DateTime                          |

### Friendship

| **Field**   | **Type**                                |
|-------------|-----------------------------------------|
| id          | Integer PK                              |
| initiatorId | FK → User (cascade delete)              |
| receiverId  | FK → User (cascade delete)              |
| status      | Enum (PENDING, ACCEPTED, BLOCKED)       |
| createdAt   | DateTime                                |

### Message

| **Field**  | **Type**                   |
|------------|----------------------------|
| id         | Integer PK                 |
| content    | String                     |
| senderId   | FK → User (cascade delete) |
| receiverId | FK → User (cascade delete) |
| sentAt     | DateTime                   |

### Match

| **Field**   | **Type**                                         |
|-------------|--------------------------------------------------|
| id          | Integer PK                                       |
| quoteId     | FK → Quote (restrict delete)                     |
| startedAt   | DateTime                                         |
| endedAt     | DateTime?                                        |
| status      | Enum (WAITING, IN_PROGRESS, FINISHED, CANCELLED) |

### MatchResult

| **Field**   | **Type**                             |
|-------------|--------------------------------------|
| id          | Integer PK                           |
| matchId     | FK → Match (cascade delete)          |
| userId      | FK → User? (cascade delete)          |
| kind        | String, default "user"               |
| displayName | String?                              |
| avatarUrl   | String?                              |
| wpm         | Float?                               |
| position    | Int?                                 |
| nbPlayers   | Int?                                 |
| nbBots      | Int?                                 |
| accuracy    | Float?                               |
| finishedAt  | DateTime?                            |

Unique on `(matchId, userId)`. `userId` is optional and `kind` distinguishes real users from bots/guests in results.

### Quote

| **Field** | **Type**                           |
|-----------|------------------------------------|
| id        | Integer PK                         |
| active    | Boolean                            |
| text      | String                             |
| creatorId | FK → User? (set null on delete)    |
| type      | String?                            |
| createdAt | DateTime?                          |

### Notification

| **Field**   | **Type**                         |
|-------------|----------------------------------|
| id          | Integer PK                       |
| recipientId | FK → User (cascade delete)       |
| actorId     | FK → User? (set null on delete)  |
| type        | Enum                             |
| sourceType  | Enum?                            |
| sourceId    | Int?                             |
| title       | String?                          |
| content     | String?                          |
| payload     | Json?                            |
| createdAt   | DateTime                         |
| readAt      | DateTime?                        |
| archivedAt  | DateTime?                        |

Unique on `(recipientId, type, sourceType, sourceId)` for dedup (a given source only ever produces one notification of a given type per recipient). Indexed on `(recipientId, createdAt desc)`, `(recipientId, readAt)`, and `(recipientId, type, createdAt desc)` for feed/unread-count queries. `sourceType`/`sourceId` point back at the record that triggered the notification (e.g. a `Message` or `Friendship` row); `actorId` is the user who caused it, nullable for system notifications.
