import type { InjectionKey } from 'vue'
// We import the `useBlueprint` function itself to get its type information.
import type { useBlueprint } from './useBlueprint'

/**
 * An InjectionKey for the Blueprint composable API.
 *
 * This key is used by the parent `BlueprintEditor` to `provide` the API,
 * and by all child components (`PlayerInventory`, `LoadoutDetails`, etc.) to `inject` it.
 */
export const blueprintKey = Symbol('blueprint') as InjectionKey<ReturnType<typeof useBlueprint>>
