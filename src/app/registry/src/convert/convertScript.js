import dcat11 from './dcat11';

export default (target, checkOnly) => {
  const report = { count: 0 };

  Object.keys(dcat11).forEach((prop) => {
    const ro = { count: 0, fixes: [] };
    report[prop] = ro;
    const propVal = dcat11[prop];
    if (typeof propVal === 'string') {
      const arr = target.find(null, prop);
      arr.forEach((stmt) => {
        if (checkOnly !== true) {
          stmt.setPredicate(propVal);
        }
        ro.count += 1;
        report.count += 1;
        ro.fixes.push({
          from: prop, to: propVal, s: stmt.getSubject(), t: 'p',
        });
      });
    } else {
      const arr = target.find(null, prop);
      arr.forEach((stmt) => {
        const oldvalue = stmt.getValue();
        const replaceWith = propVal[oldvalue];
        if (replaceWith != null) {
          if (checkOnly !== true) {
            stmt.setValue(replaceWith);
          }
          ro.count += 1;
          report.count += 1;
          ro.fixes.push({
            from: oldvalue, to: replaceWith, s: stmt.getSubject(), t: 'o',
          });
        }
      });
    }
  });

  return report;
};
