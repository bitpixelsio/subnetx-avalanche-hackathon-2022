class ReturnModel{
    result: string;
    data: any;

    constructor(data: any, result: string){
        this.result = result;
        this.data = data;
    }
}


export function returnHandler(data: any, result = 'ok') {
    return new ReturnModel(data, result);
}

export function returnHandler2(data: any) {
    return data;
}
