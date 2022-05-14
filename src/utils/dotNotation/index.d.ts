export function getByDotNotation<Object extends Record<string, any>, Path extends string, Default = unknown>(
    object: Object,
    path: Path,
    defaultValue?: Default,
    mustReturnFinalValue?: boolean
): Object | Object[Path] | Default;

export function setByDotNotation<Object extends Record<string, any>>(
    object: Object,
    path: string,
    value: unknown
): Object;
