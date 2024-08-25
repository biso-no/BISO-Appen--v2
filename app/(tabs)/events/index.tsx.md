## Events Screen Component Documentation

**Table of Contents:**

* [Overview](#overview)
* [Imports](#imports)
* [Component Function](#component-function)
    * [State](#state)
    * [useEffect Hook](#useeffect-hook)
    * [Conditional Rendering](#conditional-rendering)
    * [Component Structure](#component-structure)

### Overview 

This React component displays detailed information about a specific event retrieved from the Appwrite database. 

### Imports

This component utilizes the following libraries and modules:

| Import | Description |
|---|---|
| `useLocalSearchParams`, `useRouter` |  Hooks from `expo-router` to access route parameters and navigation functionality. |
| `useEffect`, `useState` | React Hooks for managing component state and side effects. |
| `MotiView` | Animated view component from the `moti` library. |
| `getDocument` | Function from the `@/lib/appwrite` module to fetch event data from Appwrite. |
| `VStack`, `H6`, `Paragraph`, `XStack`, `Card`, `Separator`, `Button`, `Text`, `View`, `Image`, `ScrollView` | UI components from the `tamagui` library. |
| `capitalizeFirstLetter` | Helper function from `@/lib/utils/helpers` to capitalize the first letter of a string. |
| `getFormattedDateFromString` | Function from `@/lib/format-time` to format a date string. |
| `Models` | Appwrite's data model definitions. |
| `MyStack` | Custom stack component from `@/components/ui/MyStack`. |
| `Frown` | Icon from the `@tamagui/lucide-icons` package. |

### Component Function 

The `EventsScreen` function represents the React component responsible for displaying the event details.

#### State

The component maintains the following state:

| State Variable | Type | Description |
|---|---|---|
| `event` | `Models.Document` | Holds the event data fetched from Appwrite. |

#### useEffect Hook

The `useEffect` hook is used to fetch the event data when the component mounts or when the event ID changes.

* **Fetch Event Data:** The `getDocument` function is called with the `event` collection name and the event ID passed as parameters. 
* **Update State:** The fetched event data is stored in the `event` state using the `setEvent` function.
* **Error Handling:**  Any errors during the fetch process are logged to the console.
* **Dependency Array:** The `useEffect` hook is dependent on the `id` parameter, ensuring data fetching happens whenever the ID changes.

#### Conditional Rendering

The component conditionally renders the event details based on the existence of the `event` data.

* **Event Not Found:** If the `event` is not available or has no ID, a "Event not found" message is displayed with a MotiView for animation.

* **Event Found:** If the `event` data is present, the component renders a `ScrollView` containing the following elements:

    * **MotiView:**  An animated view providing visual transition effects.
    * **Card:**  A `tamagui` card component that displays the event information.
    * **Image:**  An image component showing the event image.
    * **Card Header:** Contains the event image.
    * **Card Footer:** Displays the event title, campus name, and start date.
    * **Description:** If a description is available, it is displayed under the title. 

#### Component Structure

The `EventsScreen` component is structured as follows:

1. **Conditional Rendering:** Check for the presence of event data.
2. **Event Not Found:** Display an error message.
3. **Event Found:** Render the `ScrollView` with the animated card, image, and event details. 
4. **MotiView:**  Provides animation effects.
5. **Card:**  Encapsulates the event information with styling.
6. **Card Header:**  Displays the event image.
7. **Card Footer:**  Displays the event title, campus name, and start date. 
8. **Description:**  Displays the event description if available. 

This structured approach enhances the readability and maintainability of the code, making it easier to understand and modify. 
