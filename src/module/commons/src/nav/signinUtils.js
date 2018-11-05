export default {
  swedishNationalNumber(pnr) {
    let pnr_ = pnr;
    if (pnr_ === '1212121212' || pnr_ === '121212-1212') {
      return false;
    }

    // Do formatting and sanity control
    pnr_ = pnr_.replace(/(-|\s)/g, ''); // only keep digits
    if (pnr_.length === 12) { // year format 1985 → 85
      pnr_ = pnr_.substr(2);
    }
    if (pnr_.length !== 10) { // check length
      return false;
    }
    if (pnr_.substr(2, 2) > 12) { // check month
      return false;
    }
    if (pnr_.substr(4, 2) > 31 || pnr_.substr(4, 2) === 0) { // check date
      return false;
    }
    const parts = pnr_.split('').map(i => Number(i));
    // Then run the mod 10 algorithm to produce check digit
    const control = parts.pop();
    let inc = 0;
    let multiplicator = 2;
    let product;

    parts.forEach((i) => {
      product = parts[i] * multiplicator;
      if (product > 9) { inc += product - 9; } else { inc += product; }
      multiplicator = multiplicator === 1 ? 2 : 1;
    });
    let control_ = 10 - (inc - (Math.floor(inc / 10) * 10));
    if (control_ === 10) { control_ = 0; }
    return control === control_;
  },
};
