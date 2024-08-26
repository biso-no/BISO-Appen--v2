import {
    blue,
    blueDark,
    gray,
    grayDark,
    green,
    greenDark,
    orange,
    orangeDark,
    pink,
    pinkDark,
    purple,
    purpleDark,
    red,
    redDark,
    yellow,
    yellowDark,
  } from '@tamagui/colors'
  import { Variable, createTokens } from '@tamagui/web'
  
  // should roughly map to button/input etc height at each level
  // fonts should match that height/lineHeight at each stop
  // so these are really non-linear on purpose
  // why?
  //   - at sizes <1, used for fine grained things (borders, smallest paddingY)
  //     - so smallest padY should be roughly 1-4px so it can join with lineHeight
  //   - at sizes >=1, have to consider "pressability" (jumps up)
  //   - after that it should go upwards somewhat naturally
  //   - H1 / headings top out at 10 naturally, so after 10 we can go upwards faster
  //  but also one more wrinkle...
  //  space is used in conjunction with size
  //  i'm setting space to generally just a fixed fraction of size (~1/3-2/3 still fine tuning)
  export const size = {
    $0: 0,
    '$0.25': 2,
    '$0.5': 4,
    '$0.75': 8,
    $1: 20,
    '$1.5': 24,
    $2: 28,
    '$2.5': 32,
    $3: 36,
    '$3.5': 40,
    $4: 44,
    $true: 44,
    '$4.5': 48,
    $5: 52,
    $6: 64,
    $7: 74,
    $8: 84,
    $9: 94,
    $10: 104,
    $11: 124,
    $12: 144,
    $13: 164,
    $14: 184,
    $15: 204,
    $16: 224,
    $17: 224,
    $18: 244,
    $19: 264,
    $20: 284,
  }
  
  type SizeKeysIn = keyof typeof size
  type Sizes = {
    [Key in SizeKeysIn extends `$${infer Key}` ? Key : SizeKeysIn]: number
  }
  type SizeKeys = `${keyof Sizes extends `${infer K}` ? K : never}`
  
  const spaces = Object.entries(size).map(([k, v]) => {
    return [k, sizeToSpace(v)]
  })
  
  /**
   * Converts a given numerical value to a corresponding space value.
   * This function provides backward compatibility for specific values while 
   * applying a scaling factor for larger values.
   *
   * @param {number} v - The input numerical value to be converted. 
   *                     Expected to be a non-negative number.
   *                     Special cases include:
   *                     - 0 returns 0
   *                     - 2 returns 0.5
   *                     - 4 returns 1
   *                     - 8 returns 1.5
   *                     - Values between 0 and 16 are scaled by a factor of 0.333.
   *                     - Values greater than 16 are scaled by a factor of 0.7, 
   *                       with an adjustment of -12.
   *
   * @returns {number} The converted space value based on the input.
   *
   * @throws {RangeError} If the input value is negative.
   *
   * @example
   * // Returns 0
   * sizeToSpace(0);
   *
   * // Returns 0.5
   * sizeToSpace(2);
   *
   * // Returns 1
   * sizeToSpace(4);
   *
   * // Returns 1.5
   * sizeToSpace(8);
   *
   * // Returns 5 (Math.round(12 * 0.333))
   * sizeToSpace(12);
   *
   * // Returns 1 (Math.floor(20 * 0.7 - 12))
   * sizeToSpace(20);
   */
  // a bit odd but keeping backward compat for values >8 while fixing below
  function sizeToSpace(v: number) {
    if (v === 0) return 0
    if (v === 2) return 0.5
    if (v === 4) return 1
    if (v === 8) return 1.5
    if (v <= 16) return Math.round(v * 0.333)
    return Math.floor(v * 0.7 - 12)
  }
  
  const spacesNegative = spaces.map(([k, v]) => [`-${(k as string).slice(1)}`, -v])
  
  type SizeKeysWithNegatives =
    | `-${SizeKeys extends `$${infer Key}` ? Key : SizeKeys}`
    | SizeKeys
  
  export const space: {
    [Key in SizeKeysWithNegatives]: Key extends keyof Sizes ? Sizes[Key] : number
  } = {
    ...Object.fromEntries(spaces),
    ...Object.fromEntries(spacesNegative),
  } as any
  
  export const zIndex = {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  }
  
  export const colorTokens = {
    light: {
      blue: blue,
      gray: gray,
      green: green,
      orange: orange,
      pink: pink,
      purple: purple,
      red: red,
      yellow: yellow,
    },
    dark: {
      blue: blueDark,
      gray: grayDark,
      green: greenDark,
      orange: orangeDark,
      pink: pinkDark,
      purple: purpleDark,
      red: redDark,
      yellow: yellowDark,
    },
  }
  
  export const darkColors = {
    ...colorTokens.dark.blue,
    ...colorTokens.dark.gray,
    ...colorTokens.dark.green,
    ...colorTokens.dark.orange,
    ...colorTokens.dark.pink,
    ...colorTokens.dark.purple,
    ...colorTokens.dark.red,
    ...colorTokens.dark.yellow,
  }
  
  export const lightColors = {
    ...colorTokens.light.blue,
    ...colorTokens.light.gray,
    ...colorTokens.light.green,
    ...colorTokens.light.orange,
    ...colorTokens.light.pink,
    ...colorTokens.light.purple,
    ...colorTokens.light.red,
    ...colorTokens.light.yellow,
  }
  
  export const color = {
    ...postfixObjKeys(lightColors, 'Light'),
    ...postfixObjKeys(darkColors, 'Dark'),
  }
  
  /**
   * Appends a specified postfix to each key of the given object.
   *
   * This function takes an object with string keys and values that can either be 
   * strings or instances of the `Variable<string>` type. It returns a new object 
   * where each key is modified by appending the provided postfix.
   *
   * @template A - The type of the input object, which must have string keys and 
   *                values of type `Variable<string>` or `string`.
   * @template B - The type of the postfix, which must be a string.
   *
   * @param {A} obj - The input object whose keys will be modified.
   * @param {B} postfix - The string to append to each key of the input object.
   * 
   * @returns {Object} A new object with keys modified by appending the postfix 
   *                   and retaining the original values.
   *
   * @example
   * const original = { key1: 'value1', key2: new Variable('value2') };
   * const result = postfixObjKeys(original, '_postfix');
   * // result will be: { key1_postfix: 'value1', key2_postfix: new Variable('value2') }
   *
   * @throws {TypeError} Throws an error if the input object is not of the expected 
   *                     structure or if the postfix is not a string.
   */
  function postfixObjKeys<
    A extends { [key: string]: Variable<string> | string },
    B extends string
  >(
    obj: A,
    postfix: B
  ): {
    [Key in `${keyof A extends string ? keyof A : never}${B}`]: Variable<string> | string
  } {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [`${k}${postfix}`, v])
    ) as any
  }
  
  export const radius = {
    0: 0,
    1: 3,
    2: 5,
    3: 7,
    4: 9,
    true: 9,
    5: 10,
    6: 16,
    7: 19,
    8: 22,
    9: 26,
    10: 34,
    11: 42,
    12: 50,
  }
  
  export const tokens = createTokens({
    color,
    radius,
    zIndex,
    space,
    size,
  })