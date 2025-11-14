# 📈 Analytics Service

High-performance backend service for capturing and analyzing website analytics events using an asynchronous, queue-based architecture.

## 🚀 Features

-   **High-Speed Ingestion:** Sub-10ms response times for event capture.
-   **Asynchronous Processing:** Uses **Bull (Redis-backed)** for decoupled ingestion and processing.
-   **Scalable Architecture:** Ingestion API handles traffic spikes by queuing events, processed reliably by a Background Worker.
-   **Analytics Reporting:** Provides aggregated statistics like total views, unique users, and top paths.
-   **Reliability:** Automatic retry mechanism on processing failures (3 attempts with exponential backoff).
-   **Performance:** Queue processes 1000+ events/second.

---

## Important 
**You must first install redis for this** 
- Link[https://www.memurai.com/thanks-for-downloading?version=windows-redis]

## 🏗️ Architecture

The system uses an asynchronous, message-queue pattern to ensure fast response times for event ingestion.

### Architecture Decision: Asynchronous Processing with Bull + Redis

-   **Queue System:** Bull (Redis-backed) for asynchronous event processing.
-   **Why:** Decouples the **Ingestion API** from slow database writes, ensuring extremely fast response times.
-   **Flow:** **Ingestion API** (fast) → **Redis Queue** → **Background Worker** (slow/reliable) → **MongoDB**.

### Components

1.  **Ingestion API** (Port 3000): Validates incoming events and instantly queues them for processing.
2.  **Background Worker:** Continuously processes the event queue and persists the data to MongoDB.
3.  **Reporting API** (Port 3000): Queries and aggregates analytics data from MongoDB for reporting.

---

## 💾 Database Schema

The analytics data is stored in the `Events` collection in MongoDB.

### `Events` Collection Schema

| Field          | Type     | Description                                        |
| :------------- | :------- | :------------------------------------------------- |
| `site_id`      | `String` | Unique identifier for the website/client.          |
| `event_type`   | `String` | Type of event (e.g., "page_view", "click").        |
| `path`         | `String` | The URL path where the event occurred.             |
| `user_id`      | `String` | Unique identifier for the user.                    |
| `timestamp`    | `Date`   | The time the event occurred (indexed for queries). |
| `processed_at` | `Date`   | Timestamp when the worker persisted the event.     |

### Indexes

To optimize reporting and data retrieval, the following compound indexes are used:

-   `site_id` + `timestamp` (Compound Index)
-   `site_id` + `user_id` (Compound Index)

---

## 🛠️ Setup and Installation

### Prerequisites

You must have the following running locally:

-   **Node.js** 14+
-   **MongoDB** running on `localhost:27017`
-   **Redis** running on `localhost:6379`

### Environment Variables

To run this project, create a .env ironment file in the root directory and add the following variables:

-   **PORT**=3000
-   **MONGODB_URI**=mongodb://localhost:27017/analytics
-   **REDIS_HOST**=localhost
-   **REDIS_PORT**=6379
-   **NODE_ENV**=development

### Installation Steps

1. **Clone the repository:**

    ```bash
    git clone https://github.com/harshal20m/Analytics-service-assignment.git
    cd analytics-service
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

### Starting the Services

You will need three separate terminals to run all necessary services.

1. **Start MongoDB:**

    ```bash
    mongod
    ```

2. **Start Redis:**

    ```bash
    redis-server
    ```

3. **Start the API Server (Terminal 1):**

    - Runs both the Ingestion and Reporting APIs.

    ```bash
    npm run dev
    ```

4. **Start the Background Worker (Terminal 2):**

    - Picks up jobs from the Redis queue.

    ```bash
    npm run worker
    ```

5. **Run both simultaneously:**

    ```bash
    npm run dev:all
    ```

---

## ⚙️ API Usage

The service exposes two primary endpoints: `/api/event` for ingestion and `/api/stats` for reporting.

### 1. POST `/api/event` (Ingestion)

Used to send a new analytics event.

| Parameter    | Type     | Required | Description                        |
| :----------- | :------- | :------- | :--------------------------------- |
| `site_id`    | `String` | Yes      | ID of the client website.          |
| `event_type` | `String` | Yes      | Type of event (e.g., "page_view"). |
| `path`       | `String` | Yes      | Path of the page.                  |
| `user_id`    | `String` | Yes      | User's unique identifier.          |
| `timestamp`  | `Date`   | Yes      | ISO 8601 timestamp of the event.   |

**Example Request (Terminal 3):**

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-abc-123",
    "event_type": "page_view",
    "path": "/pricing",
    "user_id": "user-xyz-789",
    "timestamp": "2025-11-13T19:30:01Z"
  }'
```

**Example Response:**

```bash
{
  "success": true,
  "message": "Event received"
}
```

### 2. GET `/api/stats` (Reporting)

Retrieves aggregated analytics data for a specific site and date.
Parameter Type Required
Description site_id String Yes ID of the client website.
date String Yes Date in YYYY-MM-DD format.

**Example Request:**

```Bashcurl
 "http://localhost:3000/api/stats?site_id=site-abc-123&date=2025-11-13"
```

**Example Response:**

```Plaintext
{
  "site_id": "site-abc-123",
  "date": "2025-11-13",
  "total_views": 1450,
  "unique_users": 212,
  "top_paths": [
    { "path": "/pricing", "views": 700 },
    { "path": "/blog/post-1", "views": 500 },
    { "path": "/", "views": 250 }
  ]
}
```
