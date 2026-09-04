declare module 'lunar-javascript' {
  export class Solar { static fromYmdHms(y:number,m:number,d:number,h:number,min:number,s:number):Solar; getLunar():Lunar }
  export class Lunar { static fromYmdHms(y:number,m:number,d:number,h:number,min:number,s:number):Lunar; getEightChar():EightChar }
  export class EightChar { getYear():string; getMonth():string; getDay():string; getTime():string }
}

