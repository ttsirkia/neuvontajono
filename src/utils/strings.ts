/**
 * Makes a string of comma-separated values pretty having one space between each item.
 * @param value string to be formatted
 * @returns a,b , c => a, b, c
 */
export const prettyStringList = function (value: string) {
  if (value) {
    let parts = value.split(",");
    parts = parts.map(function (part) {
      return part.trim();
    });
    return parts.join(", ");
  } else {
    return value;
  }
};

/**
 * Returns a comma-separated string as an array.
 */
export const stringAsList = function (value: any) {
  if (value) {
    let parts: string[] = value.toString().split(",");
    return parts.map(function (part: string) {
      return part.trim();
    });
  } else {
    return [] as string[];
  }
};
