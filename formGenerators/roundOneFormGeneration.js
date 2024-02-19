const sourceSheetId = "1EBqsWChNdoBq74M1UAUAgqwg0SgfQRn0W2tiRw7urk4";
const resultsSheetId = "1nZ6LNe9kU3GadM5GxvSIUWyEPN8W8li1j8Qpk3HFHXI";

function generateFlightForms() {
  var sourceSheet = SpreadsheetApp.openById(sourceSheetId);
  const resultsSheet = SpreadsheetApp.create();
  var data = sourceSheet.getDataRange().getValues();
  var header = data.shift();
  const timestamp = new Date();
  const dirTitle = `Stampede Cellar Results - ${timestamp.toLocaleString()}`;

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

  for (var i = 0; i < 10; i++) {
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
      flightForm = FormApp.create(`Flight ${flight}`);
    }

    flightForm.setAllowResponseEdits(true);
    flightForm.setRequireLogin(false);
    flightForm.setLimitOneResponsePerUser(true);
    flightForm.setDescription(
      `Please provide your evaluation of the following entrants`
    );

    const nameInput = flightForm.addTextItem();

    nameInput.setTitle("Name");
    nameInput.setRequired(true);

    flightWines.forEach((wine) => {
      const multipleChoiceItem = flightForm.addMultipleChoiceItem();
      multipleChoiceItem.setRequired(true);

      multipleChoiceItem.setTitle(
        `Position ${wine.position}: Wine Id ${wine.displayId}`
      );

      const doubleGold = multipleChoiceItem.createChoice("Double Gold");
      const gold = multipleChoiceItem.createChoice("Gold");
      const silver = multipleChoiceItem.createChoice("Silver");
      const bronze = multipleChoiceItem.createChoice("Bronze");
      const noMedal = multipleChoiceItem.createChoice("No Medal");

      multipleChoiceItem.setChoiceValues(["Gold", "Silver", "Bronze"]);
    });

    flightForm.setDestination(
      FormApp.DestinationType.SPREADSHEET,
      resultsSheetId
    );
  });
}

function onFormSubmit(e) {
  // Get the submitted responses
  var responses = e.values;

  // Open the target spreadsheet by its ID
  var spreadsheet = SpreadsheetApp.openById(resultsSheetId);

  // Select the desired sheet (replace 'Sheet1' with your sheet name)
  var sheet = spreadsheet.getSheetByName("Sheet1");

  // Append the responses to the sheet
  sheet.appendRow(responses);
}
