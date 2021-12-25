export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export function Merge<T>(a: T, b?: DeepPartial<T>): T {
    if (!b) return a;
    let _a = a as any;
    let _b = b as any;
    Object.keys(b).map(k => {
        if (!_a[k] || (Array.isArray(_b[k]) || typeof _b[k] !== 'object')) _a[k] = _b[k];
        else _a[k] = Merge(_a[k], _b[k])
    })
    return _a as T;
}