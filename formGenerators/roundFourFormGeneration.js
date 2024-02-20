const sourceSheetId = "1wrL_tY76yQX_lSys7QGA8blQ85v84UwK0cJN2rVjLYA";

function generateForms() {
  var sourceSheet = SpreadsheetApp.openById(sourceSheetId);
  var data = sourceSheet.getSheetByName("R3 Out").getDataRange().getValues();
  var header = data.shift();

  const allWines = [];

  if (data.length <= 0) {
    throw new Error("No data found. Confirm source sheet ID");
  }

  const displayIdIndex = 1;

  for (var i = 0; i < data.length; i++) {
    const row = data[i];

    const displayId = row[displayIdIndex];

    allWines.push({ displayId });
  }

  const timestamp = new Date().toLocaleString();
  const resultsSheetTitle = `Stampede Cellar Round 4 Results - ${timestamp}`;
  const resultsSheet = SpreadsheetApp.create(resultsSheetTitle);

  const form = FormApp.create(`Round 4 - ${timestamp}`);
  const formItems = [];

  form.setAllowResponseEdits(true);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(true);

  const nameInput = form.addTextItem();

  nameInput.setTitle("Name");
  nameInput.setRequired(true);

  const sectionHeader = form.addSectionHeaderItem();

  sectionHeader.setTitle(`Select your top 10 entrants`);

  for (let i = 0; i < 5; i++) {
    const item = form.addListItem();
    item.setTitle(`Rank ${i + 1}`);
    item.setRequired(true);

    formItems.push(item);
  }

  let choices = new Set();

  allWines
    .sort((a, b) => a.displayId - b.displayId)
    .map((wine) => choices.add(wine.displayId));

  formItems.map((item) => item.setChoiceValues(Array.from(choices)));

  form.setDestination(
    FormApp.DestinationType.SPREADSHEET,
    resultsSheet.getId()
  );
}