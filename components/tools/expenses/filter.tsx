import { Filter } from "@tamagui/lucide-icons";
import { Text, Button, Sheet, Label, XGroup } from "tamagui";
import { CustomSelect } from "@/components/ui/select";
import { useState } from "react";

interface FilterOption {
  name: string;
  value: string;
}

interface FilterConfig {
  filterType: string;
  options: FilterOption[];
  label: string;
  initialSelected: string;
}

interface ExpenseFilterProps {
  onFilterChange: (filterType: string, value: string) => void;
  filtersConfig: FilterConfig[];
}

export function ExpenseFilter({ onFilterChange, filtersConfig }: ExpenseFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(
    filtersConfig.reduce((acc, filter) => ({ ...acc, [filter.filterType]: filter.initialSelected }), {})
  );

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));
    onFilterChange(filterType, value);
  };

  return (
    <>
      <Button
        icon={Filter}
        onPress={() => setOpen(true)}
        bordered
        size="$4"
      >
        <Text fontSize={18}>Filter</Text>
      </Button>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame
          padding="$4"
          borderRadius="$2"
          backgroundColor="$background"
        >
          <Sheet.ScrollView flex={1} space="$4">
            {filtersConfig.map((filter) => (
              <XGroup key={filter.filterType} space="$4">
                <Label>{filter.label}</Label>
                <CustomSelect
                  items={filter.options}
                  onValueChange={(value) => handleFilterChange(filter.filterType, value)}
                  initialSelected={selectedFilters[filter.filterType]}
                  label={`Filter by ${filter.label.toLowerCase()}`}
                />
              </XGroup>
            ))}
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}