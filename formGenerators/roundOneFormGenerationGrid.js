const sourceSheetId = "1EBqsWChNdoBq74M1UAUAgqwg0SgfQRn0W2tiRw7urk4";

function generateFlightForms() {
  var sourceSheet = SpreadsheetApp.openById(sourceSheetId);
  var data = sourceSheet.getDataRange().getValues();
  var header = data.shift();
  const timestamp = new Date();
  const resultsSheetTitle = `Stampede Cellar Round 1 Results - ${timestamp.toLocaleString()}`;
  const resultsSheet = SpreadsheetApp.create(resultsSheetTitle);

  const allWines = [];
  const flights = new Map();

  if (data.length <= 0) {
    throw new Error("No data found. Confirm source sheet ID");
  }

  const displayIdIndex = header
    .map((value) => value.toString().toLowerCase())
    .indexOf("displayid");
  const flightNumberIndex = header
    .map((value) => value.toString().toLowerCase())
    .indexOf("flight number");
  const flightPositionIndex = header
    .map((value) => value.toString().toLowerCase())
    .indexOf("flight position");

  for (var i = 0; i < 5; i++) {
    const row = data[i];

    const displayId = row[displayIdIndex];
    const flightNumber = row[flightNumberIndex];
    const position = row[flightPositionIndex];

    allWines.push({ displayId, flightNumber, position });
    flights.set(flightNumber, flightNumber);
  }

  flights.forEach((flight) => {
    const flightWines = allWines.filter((wine) => wine.flightNumber === flight);
    let flightForm;
    if (flightWines.length > 0) {
      flightForm = FormApp.create(`Stampede Cellar Round 1 - Flight ${flight}`);
    }

    flightForm.setAllowResponseEdits(true);
    flightForm.setRequireLogin(false);
    flightForm.setLimitOneResponsePerUser(true);

    const nameInput = flightForm.addTextItem();

    nameInput.setTitle("Name");
    nameInput.setRequired(true);

    const gridItem = flightForm.addGridItem();
    gridItem.setRequired(true);

    gridItem
      .setTitle("Please provide your evaluation of the following entrants")
      .setRows(
        flightWines.map(
          (wine) => `Position ${wine.position}: ${wine.displayId}`
        )
      )
      .setColumns(["Gold", "Silver", "Bronze"]);

    flightForm.setDestination(
      FormApp.DestinationType.SPREADSHEET,
      resultsSheet.getId()
    );
  });
}
