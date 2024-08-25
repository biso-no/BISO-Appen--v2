## ChatScreen Component Documentation

**Table of Contents**

* [Overview](#overview)
* [Usage](#usage)
* [Code Breakdown](#code-breakdown)

### Overview

The `ChatScreen` component is responsible for rendering a chat window for a specific chat group. It utilizes the `expo-router` library to access route parameters and pass them to the `ChatWindow` component.

### Usage

To use the `ChatScreen` component, you need to define a route in your `app.config.js` file. For example:

```javascript
export default {
  ...
  router: {
    ...
    routes: [
      {
        name: "chat",
        path: "/chat/:id",
        component: () => ChatScreen,
      },
    ],
  },
};
```

This route definition allows users to navigate to the chat screen with a specific chat group ID using a URL like `/chat/123`. The `id` parameter will be passed to the `ChatScreen` component.

### Code Breakdown

```javascript
import { useLocalSearchParams } from "expo-router"; // Import useLocalSearchParams hook
import { ChatWindow } from "@/components/chat/chat-window"; // Import ChatWindow component

export default function ChatScreen() { // Define ChatScreen component
    const params = useLocalSearchParams<{ id: string }>(); // Get route parameters using useLocalSearchParams

    if (!params.id) { // Check if chat group ID is available
        return null; // Return null if no ID is found
    }

    return <ChatWindow chatGroupId={params.id} />; // Render ChatWindow component with chat group ID
}
```

**Explanation:**

* **Import statements:**
    * `useLocalSearchParams`: This hook is imported from the `expo-router` library and used to access route parameters.
    * `ChatWindow`: This component is imported from the `@/components/chat/chat-window` module and responsible for rendering the actual chat window.
* **`ChatScreen` function:**
    * `params`: This variable stores the route parameters extracted using `useLocalSearchParams`. The type annotation `<{ id: string }>` specifies that the parameters should contain a key named `id` with a string value.
    * `if (!params.id) { ... }`: This conditional statement checks if the `id` parameter is present in the route parameters. If not, it returns `null`, indicating that the component should not be rendered.
    * `return <ChatWindow chatGroupId={params.id} />;`: If the `id` parameter is present, the `ChatWindow` component is rendered. The `chatGroupId` prop is set to the value of the `id` parameter. 

**Summary:**

The `ChatScreen` component uses the `useLocalSearchParams` hook to extract the chat group ID from the route parameters. It then passes this ID to the `ChatWindow` component, allowing it to display the chat content for the specified chat group. This approach ensures that the correct chat window is rendered based on the URL used to access the screen. 
