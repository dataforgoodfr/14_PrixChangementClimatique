// credit to https://github.com/rtcoder/string-to-color
export function stringToColor(str: string): string {
  let hash: number = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color: string = "#";
  for (let i = 0; i < 3; i++) {
    const value: number = (hash >> (i * 8)) & 0xff;
    const hex: string = "00" + value.toString(16);
    color += hex.substring(hex.length - 2);
  }

  return color;
}
