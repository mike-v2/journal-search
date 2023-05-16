function makeDatePretty(date: string): string {
  let [month, day, year] = date.split('-');
  //month = month.replace(/^0+/, '');
  //day = day.replace(/^0+/, '');
  //return `${month}-${day}-${year}`;
  month = convertMonthNumberToWord(month);
  day = day.replace(/^0+/, '');
  return `${month} ${day}, ${year}`;
}

function dateToJournalDate(date: Date) : string {
  let d = date;
  if (typeof date === 'string') {
    d = new Date(date);
  }
  const dateStr = d.toISOString().split('T')[0];
  let [year, month, day] = dateStr.split('-');
  return `${month}-${day}-${year}`;
}

function databaseDateToJournalDate(date: Date) {

}

function journalDateToDate(dateStr: string) {
  const [month, day, year] = dateStr.split('-');
  dateStr = `${year}-${month}-${day}`;
  return new Date(dateStr);
}

function journalDateToISOString(date: string): string {
  let [month, day, year] = date.split('-');
  return new Date(`${year}-${month}-${day}`).toISOString();
}

function timestampToDate(timestamp: string) {
  let date = timestamp.split('T')[0];
  let [year, month, day] = date.split('-');

  return `${month}-${day}-${year}`;
}

function journalDateToCondensedDate(jDate: string) : string {
  let [month, day, year] = jDate.split('-');
  return `${month.replace(/^0/, '')}-${day.replace(/^0/, '') }`;
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

export { makeDatePretty, journalDateToISOString, timestampToDate, dateToJournalDate, journalDateToDate, journalDateToCondensedDate }