import React from 'react';
import { Text, YStack, H6, XStack, ScrollView, Card, Separator, Button, YGroup } from 'tamagui';
import { MyStack } from '@/components/ui/MyStack';
import type { Attachment } from './stepper';
import { formatDate } from '@/lib/format-time';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';

interface OverviewScreenProps {
  formData: {
    bank_account: string;
    campus: string;
    department: string;
    expenseAttachments: Attachment[];
    description: string;
    prepayment_amount: number;
    total: number;
    status: string;
  };
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({ formData }) => {
  return (
    <MyStack space="$4" padding="$4">
      <ScrollView>
        <YStack space="$4">
          <H6 fontWeight="bold">Expense Overview</H6>
          <Card padding="$4" bordered>
            <Text>Bank Account: {formData.bank_account}</Text>
          </Card>

          <Card padding="$4" bordered space="$2">
            <Text>Campus: {capitalizeFirstLetter(formData.campus)}</Text>
            <Separator />
            <Text>Department: {formData.department}</Text>
          </Card>

          <Card padding="$4" bordered>
            <Text>Description: {formData.description}</Text>
          </Card>

        {formData.prepayment_amount > 0 && (
          <Card padding="$4" bordered space="$2">
            <Text>Prepayment Amount: {formData.prepayment_amount} kr</Text>
            <Separator />
            <Text>Total Amount: {formData.total} kr</Text>
            <Separator />
          </Card>
        )}
        {formData.prepayment_amount === 0 && (
          <Card padding="$4" bordered space="$2">
            <Text>Total Amount: {formData.total} kr</Text>
          </Card>
        )}
          <YStack space="$4">
            <H6>Expense Attachments</H6>
            {formData.expenseAttachments.map((attachment, index) => (
              <Card key={index} padding="$4" bordered>
                <YGroup space="$2">
                    <YGroup.Item>
                <XStack space="$4" alignItems="center">
                  <Text>Amount: {attachment.amount} kr</Text>
                  <Separator />
                  <Text>Date: {formatDate(new Date(attachment.date))}</Text>
                </XStack>
                </YGroup.Item>
                <Separator />
                <YGroup.Item>
                  <Text>Description: {attachment.description}</Text>
                </YGroup.Item>
                </YGroup>
              </Card>
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </MyStack>
  );
};

export default OverviewScreen;
