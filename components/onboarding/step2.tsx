import { YStack, Text, H3, XStack, Card, ScrollView } from 'tamagui';
import React from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { StyleSheet, Dimensions } from 'react-native';
import { MapPin, Building2, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { Models } from 'react-native-appwrite';
import DepartmentSelector from '../SelectDepartments';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

interface Step2Props {
  onNext?: () => void | Promise<void>;
  selectedCampus: Models.Document | null;
  onCampusChange: (campus: Models.Document | null) => void;
  selectedDepartments: Models.Document[];
  onDepartmentsChange: (department: Models.Document) => void;
}

export function Step2({ 
  onNext, 
  selectedCampus,
  onCampusChange,
  selectedDepartments,
  onDepartmentsChange 
}: Step2Props) {
  const [showCampusSelector, setShowCampusSelector] = React.useState(!selectedCampus);
  const { height } = Dimensions.get('window');
  const { t } = useTranslation();
  return (
    <ScrollView bounces={false}>
      <YStack width="100%" minHeight={height * 0.7} alignItems="center">
        <MotiView 
          from={{ opacity: 0, translateY: 20 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ type: 'timing', duration: 600 }}
          style={styles.container}
        >
          {/* Campus Section */}
          <YStack gap="$2" width="100%" marginBottom="$4">
            <Card 
              bordered 
              animation="quick" 
              padding="$3"
              pressStyle={{ scale: 0.98 }}
              onPress={() => setShowCampusSelector(!showCampusSelector)}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack gap="$2" alignItems="center">
                  <MapPin size={20} color="$primary" />
                  <Text fontWeight="600">
                    {selectedCampus ? selectedCampus.name : t('select-your-campus')}
                  </Text>
                </XStack>
                {showCampusSelector ? (
                  <ChevronUp size={20} color="$gray11" />
                ) : (
                  <ChevronDown size={20} color="$gray11" />
                )}
              </XStack>
            </Card>

            {showCampusSelector && (
              <MotiView
                from={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <Card elevate bordered animation="quick" padding="$4">
                  <CampusSelector 
                    onSelect={(campus) => {
                      onCampusChange(campus);
                      setShowCampusSelector(false);
                    }}
                    initialCampus={selectedCampus ?? undefined}
                  />
                </Card>
              </MotiView>
            )}
          </YStack>

          {/* Departments Section */}
          {selectedCampus && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.departmentsContainer}
            >
              <YStack gap="$2" flex={1} width="100%">
                <XStack alignItems="center" gap="$2">
                  <Building2 size={24} color="$primary" />
                  <H3>{t('select-departments')}</H3>
                </XStack>
                
                <Card 
                  elevate 
                  bordered 
                  animation="quick" 
                  padding="$4"
                  style={styles.departmentCard}
                >
                  <DepartmentSelector
                    campus={selectedCampus.$id}
                    onSelect={onDepartmentsChange}
                    selectedDepartments={selectedDepartments}
                    multiSelect
                  />
                </Card>
              </YStack>
            </MotiView>
          )}
        </MotiView>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  departmentsContainer: {
    width: '100%',
    flex: 1,
  },
  departmentCard: {
    flex: 1,
    minHeight: 400,
  }
});
