import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name : 'removeMinusPipe'
})

export class RemoveMinusPipe implements PipeTransform{
    transform(value : number) : number {
        return Math.abs(value);
    }
}