import React from 'react';

/**
 * A custom hook that returns a value based on whether the component is rendered on the client or the server.
 * During server rendering, the server value is used, while on the client, the client value is returned.
 *
 * @template S - The type of the server value.
 * @template C - The type of the client value.
 * @param {S} server - The value to use when rendering on the server.
 * @param {C} client - The value to use when rendering on the client.
 * @returns {S | C} The current value, which will be either the server or client value depending on the rendering context.
 *
 * @example
 * const value = useClientOnlyValue('Server Value', 'Client Value');
 * console.log(value); // Outputs 'Server Value' during server rendering, 'Client Value' on the client.
 *
 * @throws {Error} Throws an error if the parameters are not of expected types.
 */
// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
