## CreateChatScreen Component Documentation

### Table of Contents

* [Overview](#overview)
* [Usage](#usage)
* [Code Example](#code-example)

### Overview

This component, `CreateChatScreen`, is responsible for displaying the UI for creating a new chat group within the application. It leverages the `CreateChatGroup` component to handle the creation process.

### Usage

This component is used as the main screen for creating new chat groups. It renders the `CreateChatGroup` component, which provides the necessary UI elements and functionality for the user to create a new group.

### Code Example

```javascript
import { CreateChatGroup } from "@/components/chat/create-group";

export default function CreateChatScreen() {
    return <CreateChatGroup />
}
```

**Explanation:**

* **Import statement:**  Imports the `CreateChatGroup` component from the specified location.
* **Component Definition:** Defines a functional component called `CreateChatScreen`.
* **Render Method:** Returns the `CreateChatGroup` component, rendering it within the `CreateChatScreen`.

**Note:** The `CreateChatGroup` component is expected to provide the necessary UI for creating a chat group, including input fields for group name, members, etc., and a submit button to finalize the creation process. 
