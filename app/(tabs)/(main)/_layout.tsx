import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';

export default function MainLayout() {
  const theme = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: theme.background?.val || '#FFFFFF'
        },
        // Improve performance by reducing animation duration
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      {/* Add other screens that should be part of this stack but not appear as tabs */}
      <Stack.Screen
        name="explore/events/index"
        options={{
          title: 'Events',
        }}
      />
      <Stack.Screen
        name="explore/products/index"
        options={{
          title: 'BISO Shop',
        }}
      />
      <Stack.Screen
        name="explore/units/index"
        options={{
          title: 'Units',
        }}
      />
      <Stack.Screen
        name="explore/expenses/index"
        options={{
          title: 'Reimbursements',
        }}
      />
      <Stack.Screen
        name="explore/volunteer/index"
        options={{
          title: 'Job Board',
        }}
      />
    </Stack>
  );
}

