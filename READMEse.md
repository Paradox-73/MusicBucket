# MusicBucket Project Report

**Prepared by: Team: Betala Ke Dost**
*   Kanav Bhardwaj (IMT2023024)
*   Aarpeet Chandrasekhar (IMT2023011)
*   Bhavya Jain (IMT2023050)
*   Suryans Dash (IMT2023041)

## Project Overview

MusicBucket is a comprehensive music discovery and tracking platform designed to integrate with Spotify. It aims to provide users with an engaging platform for discovering, organizing, and tracking music using features like bucket lists, dashboards, road trip playlists, and tier-making tools. This document focuses on the currently implemented core features: Dashboard, Bucket List, Road Trip Mixtape, and Tier Maker.

The project repository can be found on GitHub: [https://github.com/Paradox-73/MusicBucket](https://github.com/Paradox-73/MusicBucket)

## Implemented Features

### 1. Dashboard Analytics (Dashboard Insights)

**Description:**
*   Display user's Spotify profile summary and key statistics.
*   Show top artists, tracks, and genres across time ranges (4 weeks, 6 months, all time).
*   Visualize trends with charts for repeated songs, library growth, and decade distribution.
*   Analyze user's "music personality" and taste profile.
*   Include playlist-based metrics and highlight niche vs mainstream preferences.
*   Present achievements based on listening patterns.

**Key Technical Implementation:**
*   Comprehensive visualization of listening patterns across different timeframes.
*   Detailed analysis of music taste including metrics like danceability, tempo, energy, and more.
*   Achievement tracking to celebrate musical exploration milestones.

### 2. Music Bucket Lists (Bucket List Management)

**Description:**
*   Create, rename, and delete personal bucket lists with descriptions and optional cover images.
*   Add Spotify items (artists, albums, tracks, playlists, podcasts) to lists via search.
*   Mark items as listened/unlistened and add personal notes.
*   Filter, sort, and reorder items within each list.
*   Import liked songs or playlists directly from Spotify.
*   Make lists public or private, and share via unique URLs.
*   Invite collaborators to edit shared lists.
*   Backup and restore data locally and receive reminder notifications.

**Key Technical Implementation:**
*   Create and manage personalized music bucket lists across different categories.
*   Filter and organize by artists, albums, genres, tracks, podcasts, and playlists.
*   Share your bucketlists with the community.


### 3. Road Trip Mixtape (RoadTrip)

**Description:**
*   Accept start and destination inputs to define a travel route.
*   Use Mapbox API to display route and waypoints.
*   Generate a Spotify playlist based on location-specific artists and genres.
*   Allow editing of playlist details before saving to Spotify.
*   Display route map and playlist information in a unified view.

**Key Technical Implementation:**
*   Create location-based mixtapes using MapBox API integration.
*   Discover local artists along your planned route.
*   Generate playlists based on geographical music trends.

### 4. Tier Maker

**Description:**
*   Create new tier lists for artists, albums, or tracks.
*   Customize tier rows (names, colors, order).
*   Add Spotify items via search or existing library.
*   Drag and drop items between tiers or reorder within tiers.
*   Save, share, and download tier lists as PNG images.
*   Toggle privacy options (public/private) and generate shareable links.

## Technical Stack

*   **Frontend**: React.js
*   **Styling**: Tailwind CSS
*   **API Integrations**: Spotify Web API, MapBox API
*   **Backened & Database**: Supabase (BaaS, PostgreSQL, Realtime, Auth)
*   **Testing**: Vitest, React Testing Library, MSW (Mock Service Worker), Cypress

## Setup Instructions

To get the MusicBucket application running locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Paradox-73/MusicBucket.git
    cd MusicBucket
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    *   MusicBucket relies on external APIs. You will need API keys for Spotify, MapBox, and Supabase.
    *   Create a `.env` file in the root directory (e.g., by copying `.env.example`) and populate it with your respective API keys and configurations.
    *   **Note:** After running `npm run dev` for the first time, you may need to navigate to the application in your browser. This initial access is crucial for the application to register with Spotify and potentially obtain necessary API tokens. Ensure your Spotify API Redirect URIs are correctly configured (e.g., `http://localhost:5173/callback`).

4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    This will start the application locally, typically accessible at `http://localhost:5173` or a similar address.

## Deployed Version & Access

A deployed version of MusicBucket is available at:
[https://music-bucket-five.vercel.app/](https://music-bucket-five.vercel.app/)

To access the full functionality of the deployed version, particularly features integrating with the Spotify API, you will need to be manually added to the project's Spotify Developer Dashboard (because we are using free developer version and only 25 manually added users are allowed). Please contact Kanav Bhardwaj IMT2023024 and provide the email and username associated with your Spotify account. Once added, you will be able to log in and use the application.

## Running Tests

The project includes a comprehensive test suite covering unit, integration, and end-to-end scenarios. All tests are currently passing, ensuring the stability and correctness of the application.

To run the full test suite, use the default command:
```bash
npm test
```
**Output Example (npm test):**
```
 Test Files  9 passed (9)
      Tests  30 passed (30)
   Start at  20:58:01
   Duration  4.40s
 PASS  Waiting for file changes...
```

Specific test categories can also be run individually:

### Testing Strategy

The project employs a comprehensive testing strategy to ensure code quality, functionality, and reliability. This strategy is designed so that anyone can run the full suite of tests without needing any secret API keys or complex environment setup.

#### Core Principles

1.  **Independence**: Tests do not rely on live external services (like Spotify or Mapbox). This makes them fast, prevents failures from network issues or API outages, and ensures consistent results.
2.  **Automation**: The entire test suite can be run with a single command (`npm test`) and is integrated into our CI/CD pipeline (`.github/workflows/test.yml`) to catch issues automatically.
3.  **Security**: By not requiring API keys for testing, we avoid the risk of exposing secrets.

#### How We Test Without API Keys: Mocking

We use a technique called **mocking** to simulate the behavior of external APIs. When the application tries to make a network request during a test, our test environment intercepts the call and provides a predefined, local "mock" response.

*   **For Unit & Integration Tests (Vitest)**: We use **Mock Service Worker (MSW)**.
    *   **What it does**: Before tests run, a mock server is initialized (`src/tests/setup.ts`). This server intercepts API calls made by our components.
    *   **How it works**: Instead of calling the real Spotify API, it finds a matching request handler in `src/tests/mocks/handlers.ts` and returns the fake data specified there. This allows us to test how our components render with different kinds of data or how they handle API errors, all without a network connection.

*   **For End-to-End Tests (Cypress)**: We use Cypress's built-in `cy.intercept()` command.
    *   **What it does**: This command lets us define mock responses for any API endpoint directly within an E2E test.
    *   **How it works**: When Cypress runs a test that simulates a user action (like clicking a button that fetches data), `cy.intercept()` catches the API call and provides a mock response. This allows us to verify entire user flows from start to finish in a controlled and predictable environment.

#### How to Run the Tests

The following commands can be used to run the different types of tests.

*   **`npm test`**: Runs all unit and integration tests. This is the main command for checking the health of the application's logic.
    **Output Example (npm test):**
    ```
     Test Files  9 passed (9)
          Tests  30 passed (30)
       Start at  20:58:01
       Duration  4.40s
     PASS  Waiting for file changes...
    ```

*   **`npm run test:unit`**: Runs only the unit tests, which verify individual functions and components in isolation.
    **Output Example (npm run test:unit):**
    ```
     Test Files  6 passed (6)
          Tests  20 passed (20)
       Start at  20:58:16
       Duration  2.63s
    ```

*   **`npm run test:integration`**: Runs only the integration tests, which check that different parts of the application work together correctly.
    **Output Example (npm run test:integration):**
    ```
     Test Files  3 passed (3)
          Tests  10 passed (10)
       Start at  20:58:30
       Duration  2.77s
    ```

*   **`npm run test:e2e`**: Runs the end-to-end tests using Cypress. **Note**: The development server must be running in a separate terminal (`npm run dev`) before executing this command.
    **Output Example (npm run test:e2e):**
    ```
      ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
      │ Tests:        1                                                                                │
      │ Passing:      1                                                                                │
      │ Failing:      0                                                                                │
      │ Pending:      0                                                                                │
      │ Skipped:      0                                                                                │
      │ Screenshots:  0                                                                                │
      │ Video:        false                                                                            │
      │ Duration:     6 seconds                                                                        │
      │ Spec Ran:     example.cy.ts                                                                    │
      └────────────────────────────────────────────────────────────────────────────────────────────────┘
        √  All specs passed!                        00:06        1        1        -        -        -
    ```
