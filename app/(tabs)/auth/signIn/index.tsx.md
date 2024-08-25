## Login Screen Component Documentation

This document provides an internal overview of the `LoginScreen` component.

### Table of Contents

* [Overview](#overview)
* [Component Structure](#component-structure)
    * [State Management](#state-management)
    * [Refs](#refs)
    * [Functions](#functions)
    * [UI Elements](#ui-elements)
* [User Flow](#user-flow)
* [Dependencies](#dependencies)
* [Notes](#notes)

### Overview 

The `LoginScreen` component handles the user authentication process. It allows users to enter their email address and receive a verification code, which is then used to verify their identity.

### Component Structure

#### State Management

| State Variable | Description |
|---|---|
| `step` | Tracks the current step in the authentication process (0: email input, 1: OTP input) |
| `email` | Stores the user's entered email address |
| `userId` | Stores the user's ID received from Appwrite after successful email submission |
| `codes` | Stores an array of 6 strings representing the entered OTP digits |
| `errorMessages` | Stores an array of error messages to display to the user |

#### Refs

| Ref | Description |
|---|---|
| `refs` | An array of refs to the input fields in the OTP component |

#### Functions

| Function | Description |
|---|---|
| `handleEmailSubmit` | Sends the email to the Appwrite backend to initiate the OTP verification process |
| `handleGoBack` | Returns the user to the email input step |
| `handleOtpSubmit` | Verifies the user's entered OTP with Appwrite and redirects to the home page if successful |
| `onChangeCode` | Handles changes in the OTP input fields, updating the `codes` state and managing focus |

#### UI Elements

| Element | Description |
|---|---|
| `MyStack` | Provides the basic layout and styling for the component |
| `MotiView` | Animates the visibility of the email input and OTP input sections |
| `Text` | Displays text information to the user |
| `Input` | Takes user input for the email address |
| `Button` | Provides interactive buttons for sending the code and submitting the OTP |
| `OTP` | Custom component for displaying and managing OTP input |
| `YStack` | Organizes elements vertically with spacing |
| `XGroup` | Organizes elements horizontally with spacing |

### User Flow

1. **Initial State:** The screen starts with the email input section visible.
2. **Email Input:** The user enters their email address and clicks "Send code."
3. **OTP Verification:** The backend sends an OTP to the entered email address. The screen transitions to the OTP input section.
4. **OTP Input:** The user enters the 6-digit OTP received via email. 
5. **OTP Verification:** The user clicks "Sign in." The entered OTP is verified against the one sent by the backend.
6. **Successful Verification:** If the verification is successful, the user is redirected to the home page.
7. **Failed Verification:** If the verification fails, an error message is displayed. The user can try again or go back to the email input step.

### Dependencies

| Dependency | Description |
|---|---|
| `react` |  Provides core React functionalities |
| `tamagui` | Provides UI components and styling |
| `@/lib/appwrite` | Provides functions for interacting with the Appwrite backend |
| `expo-router` | Provides navigation capabilities within the Expo app |
| `@/components/ui/otp` | Provides the custom OTP input component |
| `react-native` | Provides native components |
| `@/components/ui/MyStack` | Provides a custom stack component |
| `moti` | Provides animation functionalities |
| `@/components/context/auth-provider` | Provides authentication context and related functionalities |

### Notes

* The `signIn` and `verifyOtp` functions are not included in this documentation as they are assumed to be handled by the `@/lib/appwrite` module.
* The `refetchUser` function is used to update the user's profile information after successful login.
* The `push` function from `expo-router` is used to navigate to the home page.
* The `OTPInput` component is a custom component that handles input and validation of the OTP.