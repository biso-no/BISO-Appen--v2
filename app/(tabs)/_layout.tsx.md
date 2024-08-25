## TabLayout Component Documentation

This document provides an overview of the `TabLayout` component, including its functionalities and implementation details.

### Table of Contents

| Section | Description |
|---|---|
| **Introduction** | Overview of the TabLayout component and its purpose. |
| **Code Overview** | A breakdown of the code structure and key components. |
| **State Management** | Details about the state variables used in the component. |
| **Component Functions** | Explanations of the various functions used in the component. |
| **Styling** | Description of the component's styling and associated stylesheet. |

### Introduction

The `TabLayout` component is a React Native component designed to provide a tab-based navigation interface within the application. It dynamically generates tabs based on the user's authentication status and the current route.

### Code Overview

The `TabLayout` component utilizes various libraries and components, including:

* **React:** The core framework for building user interfaces.
* **React Native:** The library for building native mobile apps with JavaScript.
* **Expo:** Provides tools and services for building cross-platform mobile apps.
* **Tamagui:** A styling library for React Native that provides themed components and utility functions.
* **Lucide Icons:** A library of customizable icons for React Native.
* **Expo Router:** A library for managing navigation within the app.
* **Expo Notifications:** A library for managing push notifications and background tasks.
* **Appwrite:** A backend-as-a-service platform used for managing user data and notifications.
* **ChatProvider:** A context provider for managing chat-related functionalities.
* **CampusProvider:** A context provider for managing campus-related data.
* **React Navigation:** A library for managing navigation between screens.
* **MaskedView:** A library for creating masked views with gradients.
* **LinearGradient:** A library for creating linear gradients.

### State Management

The `TabLayout` component maintains the following state variables:

| Variable | Type | Description |
|---|---|---|
| `notificationCount` | Number | Stores the number of unread notifications. |
| `channels` | Array of Notifications.NotificationChannel | Stores the notification channels available on the device. |
| `pushToken` | String | Stores the user's push notification token. |
| `response` | NotificationResponse | Stores the latest notification response received from the device. |
| `notification` | Notifications.Notification | Stores the latest notification received from the device. |
| `image` | String | Stores the URL of the user's avatar image. |

### Component Functions

The `TabLayout` component implements several functions, including:

* **`handleRegistrationError`:** Displays an error message if there is an issue with push notification registration.
* **`profileIcon`:** Renders the profile icon based on user authentication and avatar availability.
* **`chatIcon`:** Renders a chat icon with a gradient overlay.
* **`bellIcon`:** Renders a notification bell icon with a badge indicating unread notifications.
* **`eventIcon`:** Renders an event icon with a gradient overlay.
* **`generateScreens`:** Generates the tab screens dynamically based on the user's authentication status and the current route.
* **`getIconForRoute`:** Returns the appropriate icon for a given route.

### Styling

The `TabLayout` component utilizes the `styles` object to apply styling to various elements. Key styles include:

* **`badge`:** Styles the badge for unread notification count.
* **`badgeText`:** Styles the text within the notification badge.

The `TabLayout` component also uses the `tamagui` library for styling and theming. 
