import { View} from 'tamagui';
import React, { useState } from 'react';

import DepartmentSelector from '@/components/SelectDepartments';
import { MotiView } from 'moti';


interface Step {
    step: number
    campus?: string
}

export function Step3({ step, campus }: Step) {

    const [departments, setDepartments] = useState<string[]>([]);

    const handleDepartmentChange = (departments: string[]) => {
        setDepartments(departments);
    };

    return (
        <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 3 ? 'flex' : 'none' }}
    >
        <View>
            {campus && <DepartmentSelector campus={campus} onSelect={handleDepartmentChange} />}
        </View>
    </MotiView>
    )

}