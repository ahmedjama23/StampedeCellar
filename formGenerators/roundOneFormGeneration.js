const sourceSheetId = "1LMXzMnt357iqCvExyxM1RjCYhW4HWwktP0a2JNlGPxo";

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
  const awardClassIndex = header
    .map((value) => value.toString().toLowerCase())
    .indexOf("award class");

  for (var i = 0; i < 150; i++) {
    const row = data[i];

    const displayId = row[displayIdIndex];
    const flightNumber = row[flightNumberIndex];
    const position = row[flightPositionIndex];
    const awardClass = row[awardClassIndex];

    if (
      typeof displayId === "number" &&
      typeof flightNumber === "number" &&
      typeof position !== "undefined"
    ) {
      allWines.push({ displayId, flightNumber, position, awardClass });
      flights.set(flightNumber, flightNumber);
    }
  }

  flights.forEach((flight) => {
    const flightWines = allWines.filter((wine) => wine.flightNumber === flight);
    const classSet = new Set(
      flightWines.map((wine) => {
        return wine.awardClass;
      })
    );
    const awardClasses = Array.from(classSet);

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

    awardClasses.forEach((awardClass) => {
      const classWines = flightWines.filter(
        (wine) => wine.awardClass === awardClass
      );
      const sectionHeader = flightForm.addSectionHeaderItem();
      sectionHeader.setTitle(`Award Class: ${awardClass}`);

      const gridItem = flightForm.addGridItem();
      gridItem.setRequired(true);
      gridItem.setHelpText(
        `Please provide your evaluation of the following entrants:`
      );

      gridItem
        .setRows(classWines.map((wine) => `${wine.displayId}`))
        .setColumns(["Gold", "Silver", "Bronze"]);
    });

    awardClasses.forEach((awardClass) => {
      const classWines = flightWines.filter(
        (wine) => wine.awardClass === awardClass
      );

      const favouritesListItem = flightForm.addListItem();
      favouritesListItem.setChoiceValues(
        classWines.map((wine) => wine.displayId)
      );
      favouritesListItem.setRequired(true);
      favouritesListItem.setTitle(
        `Select your favourite entrant of award class ${awardClass}:`
      );
    });

    flightForm.setDestination(
      FormApp.DestinationType.SPREADSHEET,
      resultsSheet.getId()
    );
  });
}
