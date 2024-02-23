const sourceSheetId = "1wrL_tY76yQX_lSys7QGA8blQ85v84UwK0cJN2rVjLYA";
const numRanks = 10;

function generateForms() {
  var sourceSheet = SpreadsheetApp.openById(sourceSheetId);
  var data = sourceSheet.getSheetByName("R2 Out").getDataRange().getValues();

  const allWines = [];

  if (data.length <= 0) {
    throw new Error("No data found. Confirm source sheet ID");
  }

  const displayIdIndex = 1;
  const rankScoreIndex = 10;

  for (var i = 0; i < data.length; i++) {
    const row = data[i];

    const displayId = row[displayIdIndex];
    const rankScore = row[rankScoreIndex];

    if (typeof displayId === "number" && typeof rankScore === "number") {
      allWines.push({ displayId, rankScore });
    }
  }

  const timestamp = new Date().toLocaleString();
  const resultsSheetTitle = `Stampede Cellar Round 3 Results - ${timestamp}`;
  const resultsSheet = SpreadsheetApp.create(resultsSheetTitle);

  const form = FormApp.create(`Round 3 - ${timestamp}`);
  const formItems = [];

  form.setAllowResponseEdits(true);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(true);

  const nameInput = form.addTextItem();

  nameInput.setTitle("Name");
  nameInput.setRequired(true);

  const sectionHeader = form.addSectionHeaderItem();

  sectionHeader.setTitle(`Select your top ${numRanks} entrants`);

  for (let i = 0; i < numRanks; i++) {
    const item = form.addListItem();
    item.setTitle(`Rank ${i + 1}`);
    item.setRequired(true);

    formItems.push(item);
  }

  let choices = new Set();

  allWines
    .sort((a, b) => a.rankScore - b.rankScore)
    .slice(0, numRanks)
    .sort((a, b) => a.displayId - b.displayId)
    .map((wine) => choices.add(wine.displayId));

  formItems.map((item) => item.setChoiceValues(Array.from(choices)));

  form.setDestination(
    FormApp.DestinationType.SPREADSHEET,
    resultsSheet.getId()
  );
}
