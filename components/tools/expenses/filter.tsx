import { Filter } from "@tamagui/lucide-icons";
import { Text, Button, Sheet, Label, XGroup } from "tamagui";
import { CustomSelect } from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "@/i18n";

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
  const { t } = useTranslation();
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
        <Text fontSize={18}>{t('filter')}</Text>
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
          <Sheet.ScrollView flex={1} gap="$4">
            {filtersConfig.map((filter) => (
              <XGroup key={filter.filterType} gap="$4">
                <Label>{filter.label}</Label>
                <CustomSelect
                  items={filter.options}
                  onValueChange={(value) => handleFilterChange(filter.filterType, value)}
                  initialSelected={selectedFilters[filter.filterType]}
                  label={t('filter-by-filter-label-tolowercase')}
                />
              </XGroup>
            ))} 
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}