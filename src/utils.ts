export function idGenerator(): () => number {
    let id = 0

    return () => ++id
}

export function isNumber(value: any): boolean {
    return typeof value === "number"
}
