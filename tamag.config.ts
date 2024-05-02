import { createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

export const tamaguiConfig = createTamagui(config)

type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
