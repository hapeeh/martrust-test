import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CurrencyService } from './currency.service';
import { debounceTime, Observable } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'martrust-test';
  currencyService: CurrencyService = inject(CurrencyService);
  fb: FormBuilder = inject(FormBuilder);
  forms = this.fb.group({
    sell: [''],
    sellValue: [''],
    buy: [''],
    buyValue: [''],
  }, { nonNullable: true })
  currencies = new Observable<[{ key: string, value: number }]>;
  buy?: string;
  sell?: string;
  // formatter = new Intl.NumberFormat
  valueToConvert?: null | string;
  convertedValue?: null | string;
  convertedValueAmount?: null | string;
  storeCurrencyValue?: { key: string, value: number }[];
  ngOnInit() {
    this.currencies = this.currencyService.currency.pipe(tap(data => {
      console.log('data', data)
      this.storeCurrencyValue = [...data as Array<{ key: string, value: number }>];
    }));
    this.f['sell'].valueChanges.subscribe(_ => {

      this.compute('sell');
    })
    this.f['buy'].valueChanges.subscribe(_ => {

      this.compute('buy')
    })
    this.f['sellValue'].valueChanges.pipe(debounceTime(500)).subscribe(_ => {

      this.compute('sell')
    })
    this.f['buyValue'].valueChanges.pipe(debounceTime(500)).subscribe(_ => {

      this.compute('buy')
    })
  }
  get f() {
    return this.forms.controls;
  }
  compute = (type: string) => {
    // if (this.forms.valid) {
    const sell = this.f['sell'].value
    const euValSell = (1 / sell);
    const buy = this.f['buy'].value;
    const euValBuy = (1 / buy)
    if (type === 'sell') {
      const evalSellOverBuy = (euValSell / euValBuy);
      this.convertedValueAmount = (evalSellOverBuy * 1).toFixed(8);
      this.f['buyValue'].setValue((evalSellOverBuy * this.f['sellValue'].value).toFixed(10), { emitEvent: false });
      this.valueToConvert = this.storeCurrencyValue?.find(({ key, value }) => 1 * this.f['sell'].value == value)?.key ?? null;
      this.convertedValue = this.storeCurrencyValue?.find(({ key, value }) => 1 * this.f['buy'].value == value)?.key ?? null;
    } else {
      const evalBuyOverSell = (euValBuy / euValSell);
      this.convertedValueAmount = (evalBuyOverSell * 1).toFixed(8);
      this.f['sellValue'].setValue((evalBuyOverSell * this.f['buyValue'].value).toFixed(10), { emitEvent: false });
      this.valueToConvert = this.storeCurrencyValue?.find(({ key, value }) => 1 * this.f['buy'].value == value)?.key ?? null;
      this.convertedValue = this.storeCurrencyValue?.find(({ key, value }) => 1 * this.f['sell'].value == value)?.key ?? null;
    }
    // }
  }
}
