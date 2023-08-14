import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { tap, map, startWith } from 'rxjs/operators';

interface Currency {
  rates: any;
  base: string;
  timestamp: number;
  success: 'true' | 'false';
  date: Date | string;
}
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private http = inject(HttpClient);
  private currencyState = new BehaviorSubject<any>([]);
  currencyObs = this.currencyState.asObservable();
  #currencyURL = `http://api.exchangeratesapi.io/v1/latest?access_key=8427f51700c7fb8408c508c8fd77ed6b`;
  constructor() {
    this.loadCurrencySymbol().pipe(catchError(e => {
      console.log('error', e);
      return throwError(e);
    }), tap((data: Currency) => {
      const { rates } = data
      const arrayEntries = Object.keys(rates);
      const converted = arrayEntries.map(key => {
        return Object.assign({}, { key, value: rates[key] });
      })
      this.currency = converted
    })).subscribe();
  }
  get currency() {
    return this.currencyObs;
  }
  set currency(currency: any) {
    this.currencyState.next(currency);
  }

  private loadCurrencySymbol(): Observable<Currency> {
    return this.http.get<Currency>(this.#currencyURL);
  }

  // api is not available for my subscription
  convert(from: string, to: string, amount: number): Observable<Currency> {
    let url = this.#currencyURL.replace('latest', 'convert');
    url = `${url}&from=${from}&to=${to}&amount=${amount}`;
    return this.http.get<Currency>(url).pipe(catchError(e => throwError(e)));
  }
}
