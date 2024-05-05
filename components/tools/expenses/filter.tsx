import { Filter } from "@tamagui/lucide-icons";
import { Text, Select, Button, Sheet, Group, Label, XGroup } from "tamagui";
import { CustomSelect } from "@/components/ui/select";
import { useState } from "react";

export function ExpenseFilter() {
    const [selected, setSelected] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [open, setOpen] = useState(false);
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
                        <XGroup space="$4" >
                            <Label>Status</Label>
                        <CustomSelect
                            items={[
                                { name: "All" },
                                { name: "Pending" },
                                { name: "Paid" },
                            ]}
                            onValueChange={(value) => setSelected(value)}
                            initialSelected={selected}
                            label="Filter by status"
                        />
                        </XGroup>
                        <XGroup space="$4" >
                            <Label>Department</Label>
                        <CustomSelect
                            items={[
                                { name: "All" },
                                { name: "Marketing" },
                                { name: "IT" },
                                { name: "HR" },
                                { name: "Finance" },
                            ]}
                            onValueChange={(value) => setSelectedDepartment(value)}
                            initialSelected={selectedDepartment}
                            label="Filter by department"
                        />
                        </XGroup>
                    </Sheet.ScrollView>
                </Sheet.Frame>
            </Sheet>
        </>
    );
}