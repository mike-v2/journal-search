function makeDatePretty(date: string): string {
  let [month, day, year] = date.split('-');
  //month = month.replace(/^0+/, '');
  //day = day.replace(/^0+/, '');
  //return `${month}-${day}-${year}`;
  month = convertMonthNumberToWord(month);
  day = day.replace(/^0+/, '');
  return `${month} ${day}, ${year}`;
}

function ISOStringToDate(iso: Date) : string {
  let date = iso.toString().split('T')[0];
  let [year, month, day] = date.split('-');
  return `${month}-${day}-${year}`;
}

function dateToISOString(date: string): string {
  let [month, day, year] = date.split('-');
  return new Date(`${year}-${month}-${day}`).toISOString();
}

function timestampToDate(timestamp: string) {
  let date = timestamp.split('T')[0];
  let [year, month, day] = date.split('-');

  return `${month}-${day}-${year}`;
}

function convertMonthNumberToWord(month: string): string {
  const m = Number(month);
  switch (m) {
    default: '';
    case 1:
      return 'Jan.';
    case 2:
      return 'Feb.';
    case 3:
      return 'Mar.';
    case 4:
      return 'Apr.';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'Aug.';
    case 9:
      return 'Sept.';
    case 10:
      return 'Oct.';
    case 11:
      return 'Nov.';
    case 12:
      return 'Dec.';
  }
}

export {makeDatePretty, dateToISOString, timestampToDate, ISOStringToDate}