import React from 'react';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Accordion as TAccordion, Square } from 'tamagui';

type AccordionItem = {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  collapsible?: boolean;
  disabled?: boolean;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  // Filter the items to get the default open ones
  const defaultOpenItems = items.filter(item => item.defaultOpen).map(item => item.value);

  return (
    <TAccordion overflow="hidden" type="multiple" defaultValue={defaultOpenItems}>
      {items.map((item) => (
        <TAccordion.Item key={item.value} value={item.value} disabled={item.disabled}>
          <TAccordion.Trigger flexDirection="row" justifyContent="space-between" borderWidth={0}>
            {({ open }: { open: boolean }) => (
              <>
                {item.title}
                <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                  <ChevronDown size="$1" />
                </Square>
              </>
            )}
          </TAccordion.Trigger>
          <TAccordion.HeightAnimator animation="medium">
            <TAccordion.Content animation="medium" exitStyle={{ opacity: 0 }}>
              {item.content}
            </TAccordion.Content>
          </TAccordion.HeightAnimator>
        </TAccordion.Item>
      ))}
    </TAccordion>
  );
}
