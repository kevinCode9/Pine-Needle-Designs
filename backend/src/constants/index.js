export const BOOKING_DEPOSITS = Object.freeze({
  fitting: {
    title: 'First Fitting Deposit',
    amount: '10.00',
    calendarUrl: 'https://calendar.app.google/NU1nzMP69Vjz7JU4A',
  },
  brides: {
    title: 'Bridal Appointment Deposit',
    amount: '25.00',
    calendarUrl: 'https://calendar.app.google/EU8HAuemRhmr4zBY6',
  },
});

export const DISCOUNT_RULES = {
  B$: { type: 'fixed', value: 20 },
  W$: { type: 'fixed', value: 25 },
  FAM: { type: 'percent', value: 40 },
  SURPRISE: { type: 'percent', value: 20 },
  SEW: { type: 'percent', value: 10 },
};
