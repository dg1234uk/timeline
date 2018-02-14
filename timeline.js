// Test Data
const DATA = [
  {
    id: 0,
    title: "tile1",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 0, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 0, 0))
  },
  {
    id: 1,
    title: "tile2",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 0, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 0, 0))
  },
  {
    id: 2,
    title: "tile3",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 0, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 0, 0))
  }
];

// Mins to pixels ratio
const scheduleState = {
  startTime: new Date(Date.UTC(18, 2, 13, 6, 0, 0)),
  zoom: 1
}

const settings = {
  tileMargin: 10,
  tileHeight: 20,
  tileTop: 20
};

// Get reference to timeline
const timeline = document.getElementById("timeline");

// Set up event handlers
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

btnZoomIn.addEventListener('click', btnZoomInHandler, false);
btnZoomOut.addEventListener('click', btnZoomOutHandler, false);

// Clear timeline
timeline.innerHTML = "";

for (let tileData of DATA) {
  const tileDiv = createTileElement(tileData, timeline);

  // Add tile to timeline
  timeline.appendChild(tileDiv);
}

// const scheduleEndTime =

function createTileElement(tileData, timeline) {
  // Check tileData has the properties expected
  if (
    tileData.hasOwnProperty("id") === false ||
    tileData.hasOwnProperty("title") === false ||
    tileData.hasOwnProperty("startTime") === false ||
    tileData.hasOwnProperty("endTime") === false
  ) {
    throw new Error("tileData object does not have required properties");
  }
  // Check if timeline is a HTMLCollection
  /*
  if (!(timeline instanceof HTMLCollection)) {
    throw new Error('timeline is not an HTMLCollection');
  }
  */

  const tileDiv = document.createElement("div");
  tileDiv.className = "tile";

  // Calculate pixel positions of tile from time
  const minsToX = 10;

  tilePos = {
    left: tileData.startTime.getUTCHours() * minsToX,
    width: (tileData.endTime.getUTCHours() - tileData.startTime.getUTCHours()) * minsToX * 5,
    height: settings.tileHeight,
    top: settings.tileTop
  };

  // Collision Detection of tile
  const timelineChildren = timeline.children;
  for (let element of timelineChildren) {
    if (
      element.offsetLeft < tilePos.left + tilePos.width &&
      element.offsetLeft + element.offsetWidth > tilePos.left &&
      element.offsetTop < tilePos.top + tilePos.height &&
      element.offsetTop + element.offsetHeight > tilePos.top
    ) {
      // Move conflicting tile down
      tilePos.top += element.offsetHeight + settings.tileMargin;
    }
    // collision detected!
    tileDiv.style.top = `${tilePos.top}px`;
  }

  // Set content & tile div absolute positions
  tileDiv.dataset.id = tileData.id;
  tileDiv.innerText = tileData.title;
  tileDiv.style.left = `${tilePos.left}px`;
  tileDiv.style.width = `${tilePos.width}px`;
  tileDiv.style.height = `${tilePos.height}px`;
  tileDiv.style.top = `${tilePos.top}px`;

  return tileDiv;
}

function btnZoomInHandler(e) {
  scheduleState.zoom++;
}

function btnZoomOutHandler(e) {
  scheduleState.zoom--;
}
