import { useState } from 'react';
import { Select, Sheet, Adapt } from 'tamagui';

enum Campus {
  Bergen = "bergen",
  Oslo = "oslo",
  Trondheim = "trondheim",
  Stavanger = "stavanger",
  Undefined = "",
}

const campusOptions = [
  { label: 'Bergen', value: Campus.Bergen },
  { label: 'Oslo', value: Campus.Oslo },
  { label: 'Trondheim', value: Campus.Trondheim },
  { label: 'Stavanger', value: Campus.Stavanger },
  { label: 'Undefined', value: Campus.Undefined },
];

export function SelectCampusDemo() {
  const [selectedCampus, setSelectedCampus] = useState(Campus.Undefined);

  const handleSelectCampus = (value) => {
    setSelectedCampus(value);
  };

  return (
    <Select defaultValue={Campus.Undefined} onValueChange={handleSelectCampus}>
      <Select.Trigger>
        <Select.Value placeholder="Select a campus..." />
      </Select.Trigger>
      <Adapt when="sm" platform="touch">
        <Select.Sheet>
          <Sheet.Frame>
            {campusOptions.map((option, index) => (
              <Select.Item key={index} value={option.value} index={index}>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Sheet.Frame>
          <Sheet.Overlay />
        </Select.Sheet>
      </Adapt>
      <Select.Content>
        <Select.ScrollUpButton />
        <Select.Viewport>
          <Select.Group>
            <Select.Label>Campuses</Select.Label>
            {campusOptions.map((option, index) => (
              <Select.Item key={index} value={option.value} index={index}>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton />
      </Select.Content>
    </Select>
  );
}
