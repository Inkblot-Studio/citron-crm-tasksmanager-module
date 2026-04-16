/**
 * Radix Select (citron-ui) no permite <Select.Item value="">.
 * Usar este valor para la opción "Sin asignar" y mapearlo a null / '' al guardar o al API.
 */
export const ASSIGNEE_SELECT_SENTINEL = '__citron_assignee_unassigned__'
