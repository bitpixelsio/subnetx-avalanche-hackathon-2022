export {};

declare global {
  export interface String {
    ellipsize(start?: number, end?: number): String

    removePrefix(prefix: string): String

    removeSuffix(suffix: string): String
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.ellipsize = function (start: number = 0, end: number = 0): String {
  if (this.length > start + end) {
    return this.substring(0, start) + "…" + this.substring(this.length - end)
  } else {
    return this
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.removePrefix = function (prefix: string): String {
  if (this.startsWith(prefix)) {
    return this.substring(prefix.length)
  } else {
    return this
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.removeSuffix = function (suffix: string): String {
  if (this.endsWith(suffix)) {
    return this.substring(0, this.length - suffix.length)
  } else {
    return this
  }
}
