# Software Engineering Viva: Testing Documentation

This document provides a file-by-file explanation of the testing setup and strategies used in the `src/tests` directory.

## Directory Structure Overview

The `src/tests` directory is organized into several subdirectories, each with a specific purpose:

-   **`fixtures`**: Contains test utilities and helper functions.
-   **`integration`**: Holds integration tests that verify the interaction between multiple components, services, and APIs.
-   **`mocks`**: Contains mock data, API request handlers, and the mock server setup for isolating tests from external dependencies.
-   **`unit`**: Contains unit tests that test individual components, hooks, and utility functions in isolation.

## File-by-File Breakdown

---

### `src/tests/setup.ts`

-   **Purpose**: This is the global setup file for the entire test suite (using Vitest). It runs before any tests are executed.
-   **How it's tested/used**:
    -   `import '@testing-library/jest-dom'`: Extends Vitest's `expect` with DOM-specific assertion matchers like `.toBeInTheDocument()`.
    -   `server.listen()`: Before all tests start (`beforeAll`), it activates a mock server (`msw`) to intercept and mock API calls. This ensures that tests don't make actual network requests, making them faster and more reliable.
    -   `server.resetHandlers()`: After each test (`afterEach`), it resets the mock API handlers to their default state. This prevents tests from interfering with each other.
    -   `server.close()`: After all tests have finished (`afterAll`), it shuts down the mock server.
    -   **`window.matchMedia` Mock**: It mocks the `matchMedia` browser API, which is not implemented in the JSDOM test environment. This is crucial for testing responsive components that change based on screen size.

---

### `src/tests/fixtures/test-utils.tsx`

-   **Purpose**: To provide a custom `render` function for React Testing Library that wraps components in necessary context providers.
-   **How it's tested/used**:
    -   `AllTheProviders`: A wrapper component that includes `QueryClientProvider` (for `react-query`) and `BrowserRouter` (for `react-router-dom`).
    -   `customRender`: This function is exported as `render` and is used in component tests. It automatically wraps the UI being tested with `AllTheProviders`, so you don't have to manually add them in every single test file. This is essential for testing components that fetch data or use routing.

---

### `src/tests/mocks/`

This directory is central to the project's testing strategy, enabling API and data mocking.

-   **`mocks/server.ts`**: Uses `setupServer` from `msw/node` to create a mock server instance using the defined handlers.
-   **`mocks/handlers.ts`**: Defines the API request handlers for the mock server. It uses `http.get()` from `msw` to intercept a GET request to `https://api.spotify.com/v1/me` and returns a consistent JSON mock response. This allows testing of components that fetch user data without hitting the actual Spotify API.
-   **`mocks/data/bucketlist.mock.ts`**: Exports mock data objects, like `mockBucketListItem`. This ensures that tests use consistent, predictable data structures.

---

### `src/tests/integration/`

Integration tests verify that different parts of the application work together as expected.

-   **`integration/api/spotify.test.ts`**:
    -   **Purpose**: To test the application's integration with the Spotify API at the network level.
    -   **How it's tested**: It makes `fetch` requests to Spotify API endpoints. The `msw` server intercepts these requests. The tests check if the application correctly handles different HTTP responses:
        -   A successful `200 OK` response with the expected data.
        -   A `401 Unauthorized` error.
        -   A `500 Server Error`.
-   **`integration/bucketlist.test.tsx`**:
    -   **Purpose**: To test the `BucketList` page, ensuring data fetching, rendering, and different states work correctly.
    -   **How it's tested**:
        -   It renders the entire `BucketList` page component.
        -   **Mocking**: It heavily uses `vi.mock` to replace real modules with test doubles. It mocks the `useSpotifyAuth` hook, the `getBucketLists` service function, and the `useAuthStore` to control the authentication state and data returned.
        -   **Assertions**: It tests for:
            -   The page title being rendered.
            -   Correct display of items when data is returned.
            -   Display of an "empty state" message when no data is returned.
            -   Display of a "loading" state.
-   **`integration/dashboard.test.tsx`**:
    -   **Purpose**: To test the main `Dashboard` page.
    -   **How it's tested**: Similar to the bucket list test, it renders the full page and mocks its dependencies, including the Spotify API wrapper (`createSpotifyApi`) and the dashboard's data store (`useDashboardDataStore`). It verifies that the layout, loading states, and data-driven components (like top artists) are rendered correctly based on the mocked data.

---

### `src/tests/unit/`

Unit tests focus on a single, isolated "unit," such as a component, hook, or function.

-   **`unit/components/FeatureCard.test.tsx`**:
    -   **Purpose**: To test the `FeatureCard` component in isolation.
    -   **How it's tested**:
        -   It renders the component with a set of `props`.
        -   It asserts that the title, description, and icon are displayed correctly.
        -   It checks that the "Explore" link has the correct `href` attribute.
        -   **Snapshot Test**: It uses `toMatchSnapshot()` to save a "snapshot" of the component's HTML structure. If the component's UI changes unexpectedly in the future, the snapshot test will fail, alerting the developer. The snapshot is stored in `__snapshots__/FeatureCard.test.tsx.snap`.
-   **`unit/components/Navigation.test.tsx`**:
    -   **Purpose**: To test the main `Navigation` component.
    -   **How it's tested**: It mocks child components (`ThemeToggle`, `SpotifyProfileDropdown`) and stores to focus only on the `Navigation` component's own logic. It verifies that the logo, brand name, and navigation links are rendered.
-   **`unit/components/ThemeToggle.test.tsx`**:
    -   **Purpose**: To test the theme switching button.
    -   **How it's tested**: It mocks the `useTheme` hook to control the current theme (`'light'` or `'dark'`). It asserts that the button renders the correct `aria-label` for accessibility and that the `toggleTheme` function is called when the button is clicked.
-   **`unit/hooks/useTheme.test.ts`**:
    -   **Purpose**: To test the logic of the `useTheme` custom hook.
    -   **How it's tested**: It uses `renderHook` from React Testing Library to test the hook outside of a component.
        -   It checks the default initial theme.
        -   It simulates calls to `toggleTheme()` using `act()` and asserts that the theme value changes correctly.
        -   It verifies that the theme change is persisted to `localStorage` and that the `dark` class is correctly applied to the `<html>` element.
-   **`unit/store/authStore.test.ts`**:
    -   **Purpose**: To test the state logic of the Zustand `authStore`.
    -   **How it's tested**: It tests the store's reducer-like logic.
        -   It mocks the Supabase client to simulate auth events.
        -   It programmatically triggers `SIGNED_IN` and `SIGNED_OUT` events and asserts that the store's state (user, session, loading) updates as expected. `act()` and `waitFor()` are used to handle asynchronous state updates.
-   **`unit/utils/cn.test.ts`**:
    -   **Purpose**: To test the `cn` utility function, which is used for conditionally combining CSS class names.
    -   **How it's tested**: It provides various inputs to the function and asserts that the output string is correct, including how it handles merging and overriding Tailwind CSS classes.

---

### Miscellaneous

-   **`src/tests/seed-bucket-list.sql`**: This is a SQL file, not a test itself. Its purpose is to provide seed data for a database. It would be used in a testing environment that involves a real database, likely for end-to-end (E2E) tests, to ensure the database starts in a predictable state.
