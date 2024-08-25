## Team Invitation Component Documentation 

**Table of Contents**

* [1. Overview](#1-overview)
* [2. Usage](#2-usage)
* [3. Implementation Details](#3-implementation-details)
    * [3.1. Components](#31-components)
    * [3.2. Functions](#32-functions)
    * [3.3. State Management](#33-state-management)
* [4. Dependencies](#4-dependencies)

### 1. Overview 

This component handles the acceptance of team invitations. It fetches invitation details from the URL parameters and processes the acceptance request using the `acceptChatInvite` function. Upon successful acceptance, the component updates the user's data and redirects to the chat view.

### 2. Usage 

This component is meant to be used within the app's navigation stack. It is invoked when a user clicks on an invitation link. The component renders a loading animation and displays a confirmation message after the invitation is accepted.

### 3. Implementation Details

#### 3.1. Components

* **MotiView:** Provides animation capabilities for the view.
* **Text:** Renders the confirmation message.
* **CheckCircle:** Displays a checkmark icon to indicate successful invitation acceptance.

#### 3.2. Functions

* **acceptChatInvite:** This function is imported from `@/lib/appwrite` and handles the logic for accepting the invitation. It sends an API request to the server with the invitation details and updates the user's data accordingly.
* **refetchUser:** This function, imported from the `auth-provider`, updates the user's data after the invitation is accepted.
* **useLocalSearchParams:** Extracts the invitation parameters from the URL.
* **useRouter:** Used for navigation to the chat view after successful acceptance.

#### 3.3. State Management

* No explicit state is used within this component.

### 4. Dependencies

* **@tamagui/lucide-icons:** Provides the CheckCircle icon.
* **expo-router:** For navigation within the app.
* **moti:** For animating the component view.
* **tamagui:** For styling and rendering the components.
* **@/lib/appwrite:** Contains the `acceptChatInvite` function.
* **@/components/context/auth-provider:** Provides the `useAuth` hook for user data management. 
