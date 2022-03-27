export {}
declare global {
    interface Array<T> {
        group<K>(valueBy: (e: T) => (K)): Map<K, Array<T>>;

        random(): T;

        shuffle(): void

        dedup(equals?: (x: T, y: T) => (boolean)): Array<T>
    }

    interface Map<K, V> {
        valuesArray(): Array<V>
    }
}

export function initializeExtensions() {
    if (!Map.prototype.valuesArray) {
        Map.prototype.valuesArray = function <V>(): Array<V> {
            const values: Array<V> = []
            // tslint:disable-next-line: no-invalid-this
            this.forEach((value) => {
                values.push(value)
            })
            return values
        }
    }

    if (!Array.prototype.group) {
        Array.prototype.group = function <T, K>(valueBy: (e: T) => (K)) {
            const map = new Map<K, T[]>()

            // tslint:disable-next-line: no-invalid-this
            for (const element of this) {
                const v = valueBy(element)
                const array = map.get(v)
                if (array) {
                    array.push(element)
                } else {
                    map.set(v, [element])
                }
            }
            return map
        }
    }

    if (!Array.prototype.random) {
        Array.prototype.random = function () {
            // tslint:disable-next-line: no-invalid-this
            return this[Math.floor((Math.random() * this.length))];
        }
    }

    if (!Array.prototype.shuffle) {
        Array.prototype.shuffle = function () {
            // tslint:disable-next-line: no-invalid-this
            let currentIndex = this.length
            while (currentIndex !== 0) {
                const randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1
                // tslint:disable-next-line: no-invalid-this
                const temporaryValue = this[currentIndex];
                // tslint:disable-next-line: no-invalid-this
                this[currentIndex] = this[randomIndex];
                // tslint:disable-next-line: no-invalid-this
                this[randomIndex] = temporaryValue;
            }
        }
    }

    if (!Array.prototype.dedup) {
        Array.prototype.dedup = function <T>(equals?: ((x: T, y: T) => (boolean))): Array<T> {
            const deduped: Array<T> = []
            // tslint:disable-next-line: no-invalid-this
            for (const element of this) {
                const found = deduped.find(value => equals ? equals(value, element) : (value === element))
                if (!found) {
                    deduped.push(element)
                }
            }
            return deduped
        }
    }
}

declare global {
    interface PromiseConstructor {
        allCompleted: (promises: Promise<any>[]) => Promise<any>
    }
}

Promise.allCompleted = function (promises) {
    return Promise.all(promises.map(reflect))
}

function reflect(promise) {
    return promise.then(function (v) {
            return { v: v, status: "fulfilled" }
        },
        function (e) {
            return { e: e, status: "rejected" }
        });
}

export function notFalse<TValue>(value: TValue | false): value is TValue {
    return value !== false;
}
