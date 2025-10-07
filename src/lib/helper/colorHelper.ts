export type ColorInterpolateParams = {
    start: number;
    end: number;
    reverse: boolean;
    interpolateFunc: (t: number) => string;
};

export function createColorsArray(dataLength: number, colorInterpolateParams: ColorInterpolateParams): string[] {
    const colorRange = colorInterpolateParams.end - colorInterpolateParams.start;
    const intervalSize = colorRange / dataLength;
    const colorArray = [];

    for(let i = 0; i < dataLength; i++) {
        const colorPoint: number = colorInterpolateParams.reverse ?
            (colorInterpolateParams.end - (i * intervalSize)) :
            (colorInterpolateParams.start + (i * intervalSize));
        colorArray.push(colorInterpolateParams.interpolateFunc(colorPoint));
    }

    return colorArray;
}
