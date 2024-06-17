import React, { useEffect, useState } from 'react';
import type { SizeTokens } from 'tamagui';
import { Label, Separator, Switch, XStack } from 'tamagui';
import { createSubscriber, deleteSubscriber, updateSubscription, fetchSubscription } from '@/lib/appwrite';
import { useAppwriteAccount } from './context/auth-context';

interface Props {
  label: string;
  topic: string;
  size: SizeTokens;
}

export function SwitchWithLabel(props: Props) {
  const id = `switch-${props.topic}`
  const { data } = useAppwriteAccount();
  const [checked, setChecked] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) {
      return;
    }

    const fetchInitialSubscription = async () => {
      try {
        const response = await fetchSubscription(data, { topic: props.topic });
        if (response) {
          setChecked(response.subscribed);
        }
      } catch (error) {
        console.error('Error fetching initial subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSubscription();
  }, [data, props.topic]);

  const onChange = async () => {
    if (data) {
      setLoading(true);
      try {
        if (checked) {
          // Unsubscribe
          await deleteSubscriber(props.topic, id);
          await updateSubscription(data.$id, props.topic, false);
        } else {
          // Subscribe
          await createSubscriber(props.topic, data);
          await updateSubscription(data.$id, props.topic, true);
        }
        setChecked(!checked);
      } catch (error) {
        console.error('Error updating subscription:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Label>Loading...</Label>; // You might want to use a spinner or some other loading indicator
  }

  return (
    <XStack width={200} alignItems="center" gap="$4">
      <Label
        paddingRight="$0"
        minWidth={90}
        justifyContent="flex-end"
        size={props.size}
        htmlFor={id}
      >
        {props.label}
      </Label>
      <Separator minHeight={20} vertical />
      <Switch id={id} size={props.size} checked={checked} onCheckedChange={onChange}>
        <Switch.Thumb animation="quicker" />
      </Switch>
    </XStack>
  );
}
